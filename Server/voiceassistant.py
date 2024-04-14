import os
import shutil
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
from datasets import load_dataset
from fastapi import FastAPI, File, UploadFile
import requests
import base64
import json
from databases import Database
from contextlib import asynccontextmanager

app = FastAPI()

def classifier(text: str):
    import torch
    from transformers import BertTokenizer, BertForSequenceClassification

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

    predicted_label = predict(model, text, tokenizer, labels, device)
    return predicted_label

@app.post("/voice")
async def voice(email: str, uid: str, loginAuth: str, voice: UploadFile = File(...)):
    Auth = loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == email + uid:
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

        model_id = "distil-whisper/distil-large-v3"

        model = AutoModelForSpeechSeq2Seq.from_pretrained(
            model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
        )
        model.to(device)

        processor = AutoProcessor.from_pretrained(model_id)

        pipe = pipeline(
            "automatic-speech-recognition",
            model=model,
            tokenizer=processor.tokenizer,
            feature_extractor=processor.feature_extractor,
            max_new_tokens=128,
            torch_dtype=torch_dtype,
            device=device,
        )

        # dataset = load_dataset("distil-whisper/librispeech_long", "clean", split="validation")
        
        filepath = f"./files/{voice.filename}"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, "wb") as f:
            data = await voice.read()
            f.write(data)
            shutil.copyfileobj(voice.file, f)
        
        result = pipe(filepath, generate_kwargs={"task": "translate"})

        response = google_gemini(result["text"])
        response = json.loads(response)
        
        confident_code = response["Most_Confidence"]["label"]
        confidence = response["Most_Confidence"]["level"]
        
        if confidence > 0.5:
            code = classifier(result["text"])
            if confident_code != code:
                code = confident_code
            
            if code == 0:
                state = openfile(result["text"])
            elif code == 1:
                state = deletefile(result["text"])
            elif code == 2:
                state = ocrfile(result["text"], email, uid, loginAuth)
            elif code == 3:
                state = getlatestrss()
            elif code == 4:
                state = searchbook(result["text"])
            elif code == 5:
                state = ttsfile(result["text"])
        


def google_gemini(text: str, prompt=None):
    GOOGLE_API = "AIzaSyDqoqVxxiQYmcua5GkJ7oYX8zoVMcGyfvY"
    import google.generativeai as genai
    
    config = {
        "temperature": 1,
        "top_p": 1,
        "top_k": 1,
        "max_output_tokens": 2048
    }
    
    genai.configure(api_key=GOOGLE_API)
    model = genai.GenerativeModel('gemini-pro')
    
    if prompt:
        prompts = prompt
    else:
        prompts = PROMPT
    
    response = model.generate_content(prompts + text, generation_config=config)
    
    return response.text

PROMPT = "You are an intelligent verbal response assistant who will respond to the correct answer based on the prompts I give you. First, I will send you a statement and ask you to first judge the confidence of each item in labels for what the statement describes based on your model and output it using JSON format. Finally tell a most confidence label number and its confidence level, if you think the statement does not match any of the items described in the label, please tell me the label number is -1 and the level of confidence is -1.. labels are as follows:\nlabels = {'open a file': 0, 'delete a file': 1, 'ocr a file': 2, 'get latest rss titles': 3, 'search a book': 4, 'tts a file': 5}\nA similar output would be as follows:{'labels': {'0': percentage, '1': percentage...}, 'Most_Confidence': {'labels': '0', 'level': 'percentage%'}' }\nNext, please output your feedback on the statement using generative text based on the statement. Requirements: provide a better user experience from the perspective of a voice assistant, and require the output to be bilingual in Chinese and English. And write it to the previous JSON, here is the example:\n{'labels': {'0': 'percentage%', '1': 'percentage%'...}, 'Most_Confidence': {'labels': '0', 'level': 'percentage%'}, 'text_zh': '中文回复','text_en': 'English response'}\nThe following is my statement, please complete the output according to the above requirements:\n"

GETFILENAME = "You are an intelligent verbal response assistant who will respond to the correct answer based on the prompts I give you. I want you to extract the filename or the search keyword in the following statement, for example from ' I want to open the file test.md.' to 'test.md', or from ' I want to ocr the mybook.' to 'mybook', or from 'I want to search for 'Huozhe' to 'Huozhe'. Please return the extracted content to me directly."

def openfile(text: str):
    prompt = GETFILENAME
    filename = google_gemini(text, prompt)
    
    database = Database("sqlite:///test.db")
    database.connect()
    
    query = "SELECT FileAddress FROM fileInfo WHERE Filename = :filename"
    result = database.fetch_one(query, {"filename": filename})
    database.disconnect()
    
    if result:
        return {
            "status_code": 200,
            "operation": "open a file",
            "text": "OK, I will open " + filename + " for you",
            "fileaddress": result[0]
        }
    return {
        "status_code": 404,
        "operation": "open a file",
        "text": "Can not find " + filename + ". Please check the filename and try again!",
        "fileaddress": None
    }
    
def deletefile(text: str):
    prompt = GETFILENAME
    filename = google_gemini(text, prompt)
    
    database = Database("sqlite:///test.db")
    database.connect()
    
    query = "SELECT FileAddress FROM fileInfo WHERE Filename = :filename"
    result = database.fetch_one(query, {"filename": filename})
    
    if result:
        query = "DELETE FROM fileInfo WHERE Filename = :filename"
        database.execute(query, {"filename": filename})
        database.disconnect()
    else:
        database.disconnect()
        return {
            "status_code": 404,
            "operation": "delete a file",
            "text": "Can not find " + filename + ". Please check the filename and try again!"
        }
    
    return {
        "status_code": 200,
        "operation": "delete a file",
        "text": "OK, I will delete " + filename + " for you"
    }

def ocrfile(text: str, email: str, uid: str, loginAuth: str):
    prompt = GETFILENAME
    filename = google_gemini(text, prompt)
    
    database = Database("sqlite:///test.db")
    database.connect()
    
    query = "SELECT FileAddress FROM fileInfo WHERE Filename = :filename"
    address = database.fetch_one(query, {"filename": filename})
    
    if address is None:
        database.disconnect()
        return {
            "status_code": 404,
            "operation": "ocr a file",
            "text": "Can not find " + filename + ". Please check the filename and try again!"
        }
    
    requests.post("/ocr", data={
        email: email,
        uid: uid,
        loginAuth: loginAuth,
        
    })
    
    return {
        "status_code": 200,
        "operation": "ocr a file",
        "text": "OCR result for " + filename + ": " + processed_result
    }