from transformers import AutoTokenizer, AutoModelForSequenceClassification, BertTokenizer
from datasets import load_dataset
from torch.utils.data import DataLoader
import torch
import numpy as np

tokenizer = BertTokenizer.from_pretrained('bert-base-cased')
labels = {'open a file':0,
          'ocr a file':1,
          'open any RSS feed':2,
          'search a book':3,
          'tts a file':4
          } 

class Dataset(torch.utils.data.Dataset):
    def __init__(self, df):
        self.labels = [labels[label] for label in df['Category']]
        self.texts = [tokenizer(text, padding='max_length', max_length = 512, truncation=True, return_tensors="pt") for text in df['Text']]

    def classes(self):
        return self.labels

    def __len__(self):
        return len(self.labels)

    def get_batch_labels(self, idx):
        return np.array(self.labels[idx])

    def get_batch_texts(self, idx):
        return self.texts[idx]

    def __getitem__(self, idx):
        batch_texts = self.get_batch_texts(idx)
        batch_y = self.get_batch_labels(idx)
        return batch_texts, batch_y


import pandas as pd
text_df = pd.read_csv('./datasets.csv')
df = pd.DataFrame(text_df)

np.random.seed(112)
df_train, df_val, df_test = np.split(df.sample(frac=1, random_state=42), [int(.8 * len(df)), int(.9 * len(df))])
print(len(df_train),len(df_val), len(df_test))


# 3. Modelling
import torch
print(torch.cuda.is_available())

# 4. Training Models

from torch.optim import Adam
from tqdm import tqdm
from model import BertClassifier
from torch import nn

def train(model, train_data, val_data, learning_rate, epochs):
    train, val = Dataset(train_data), Dataset(val_data)
    train_dataloader = torch.utils.data.DataLoader(train, batch_size=2, shuffle=True)
    val_dataloader = torch.utils.data.DataLoader(val, batch_size=2)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    criterion = nn.CrossEntropyLoss()
    optimizer = Adam(model.parameters(), lr=learning_rate)

    if torch.cuda.is_available():
        model = model.cuda()
        criterion = criterion.cuda()
    for epoch_num in range(epochs):
        total_acc_train = 0
        total_loss_train = 0
        for train_input, train_label in tqdm(train_dataloader):

            train_label = train_label.to(device)
            mask = train_input['attention_mask'].to(device)
            input_id = train_input['input_ids'].squeeze(1).to(device)
            output = model(input_id, mask)
            batch_loss = criterion(output, train_label.long())
            total_loss_train += batch_loss.item()
            acc = (output.argmax(dim=1) == train_label).sum().item()
            total_acc_train += acc
            model.zero_grad()
            batch_loss.backward()
            optimizer.step()
        
        total_acc_val = 0
        total_loss_val = 0
        with torch.no_grad():
            for val_input, val_label in val_dataloader:
                val_label = val_label.to(device)
                mask = val_input['attention_mask'].to(device)
                input_id = val_input['input_ids'].squeeze(1).to(device)

                output = model(input_id, mask)

                batch_loss = criterion(output, val_label.long())
                total_loss_val += batch_loss.item()

                acc = (output.argmax(dim=1) == val_label).sum().item()
                total_acc_val += acc

        print(
            f'''Epochs: {epoch_num + 1}
            | Train Loss: {total_loss_train / len(train_data): .3f}
            | Train Accuracy: {total_acc_train / len(train_data): .3f}
            | Val Loss: {total_loss_val / len(val_data): .3f}
            | Val Accuracy: {total_acc_val / len(val_data): .3f}''')
            
EPOCHS = 40
model = BertClassifier()
LR = 1e-6
train(model, df_train, df_val, LR, EPOCHS)
# Save models
torch.save(model, 'classifier.pth')

# 5. Evaluation

def evaluate(model, test_data):

    test = Dataset(test_data)
    test_dataloader = torch.utils.data.DataLoader(test, batch_size=2)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    if torch.cuda.is_available():
        model = model.cuda()

    total_acc_test = 0
    with torch.no_grad():
        for test_input, test_label in test_dataloader:
            test_label = test_label.to(device)
            mask = test_input['attention_mask'].to(device)
            input_id = test_input['input_ids'].squeeze(1).to(device)
            output = model(input_id, mask)
            acc = (output.argmax(dim=1) == test_label).sum().item()
            total_acc_test += acc
    print(f'Test Accuracy: {total_acc_test / len(test_data): .3f}')

evaluate(model, df_test)

# 6. Predict

import torch
from transformers import BertTokenizer, BertForSequenceClassification
from model import BertClassifier

labels = {'open a file': 0, 'delete a file': 1, 'ocr a file': 2, 'get latest rss titles': 3, 'search a book': 4, 'tts a file': 5}

tokenizer = BertTokenizer.from_pretrained('bert-base-cased')

model = BertForSequenceClassification.from_pretrained('bert-base-cased', num_labels=len(labels))

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = torch.load('./classifier.pth')
model.to(device)
if torch.cuda.is_available():
    model = model.cuda()
tokenizer = BertTokenizer.from_pretrained('bert-base-cased')

model.eval()

def predict(model, sentence, tokenizer, labels, device):
    inputs = tokenizer(sentence, padding='max_length', max_length=512, truncation=True, return_tensors="pt")
    input_id = inputs['input_ids'].to(device)
    mask = inputs['attention_mask'].to(device)

    with torch.no_grad():
        outputs = model(input_id=input_id, mask=mask)

    prediction = torch.argmax(outputs, dim=1).item()

    return prediction

test_sentence = "I want to open the file test.md."
predicted_label = predict(model, test_sentence, tokenizer, labels, device)
print(f"Predicted label for '{test_sentence}': {predicted_label}")

