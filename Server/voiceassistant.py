import os
import shutil
from fastapi.responses import StreamingResponse
import requests
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
from fastapi import FastAPI, File, HTTPException, UploadFile
import base64
import json
from databases import Database
from io import BytesIO
from edge_tts import Communicate
from uuid import uuid4

app = FastAPI()
database = Database("sqlite:///test.db")

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
                state = ocrfile(result["text"])
            elif code == 3:
                state = getlatestrss()
            elif code == 4:
                state = searchbook(result["text"])
            elif code == 5:
                state = ttsfile(result["text"])
            
            text = state["text"]
        else: 
            text = response["text_zh"]
        
        request = text.replace("\"", " ")
        voice = "zh-CN-XiaoxiaoNeural"
        TTS_PATH = "./tts_files"
        
        try:
            unique_filename = str(uuid4()) + ".mp3"
            file_path = os.path.join(TTS_PATH, unique_filename)
            
            communicate = Communicate(request, voice)
            await communicate.save(file_path)
            return {
                "status_code": 200,
                "operation": state["operation"],
                "text": text,
                "voice": file_path
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

async def google_gemini(text: str, prompt=None):
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

async def openfile(text: str):
    prompt = GETFILENAME
    filename = google_gemini(text, prompt)
    
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
    
async def deletefile(text: str):
    prompt = GETFILENAME
    filename = google_gemini(text, prompt)
    
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

async def ocrfile(text: str):
    prompt = GETFILENAME
    filename = google_gemini(text, prompt)
    
    database.connect()
    
    query = "SELECT FileAddress FROM fileInfo WHERE Filename = :filename"
    file_path = database.fetch_one(query, {"filename": filename})
    database.disconnect()
    
    if file_path is None:
        return {
            "status_code": 404,
            "operation": "ocr a file",
            "text": "Can not find " + filename + ". Please check the filename and try again!"
        }
    
    with open(file_path, 'rb') as file:
        content = file.read()
        file = UploadFile(filename=file_path.name, file=BytesIO(content))
    
    if file.content_type != 'application/pdf':
        return {
            "status_code": 400,
            "operation": "ocr a file",
            "text": "Input file is not a PDF"
        }

    response = requests.post(
        'https://pdf.hoyue.pp.ua/api/v1/misc/ocr-pdf',
        files={'fileInput': (file.filename, content, file.content_type)},
        data={
            'languages': "eng",
            'sidecar': True,
            'ocrType': 'skip-text',
            'ocrRenderType': "hocr"
        }
    )
    
    if response.status_code == 200:
        content_type = response.headers.get('content-type')
        filename = response.headers.get('Content-Disposition').split('filename=')[1]
    
    
    return {
        "status_code": 200,
        "operation": "ocr a file",
        "text": "OK, I will ocr it.",
        "files": StreamingResponse(BytesIO(response.content), media_type=content_type, headers={"Content-Disposition": "form-data; name='attachment'; filename={}".format(filename)})
    }
    
async def getlatestrss():
    database.connect()
    
    query = "SELECT Link FROM rssContent WHERE Published = (SELECT MAX(Published) FROM rssContent)" 
    Link = database.fetch_one(query)
    database.disconnect()
    
    if Link is None:
        return {
            "status_code": 404,
            "operation": "get latest rss",
            "text": "No rss content found."
        }
    else:
        return {
            "status_code": 200,
            "operation": "get latest rss",
            "text": "The latest rss is " + Link[0],
            "link": Link[0]
        }

async def searchbook(text: str):
    prompt = GETFILENAME
    title = google_gemini(text, prompt)
    
    query = "https://read.douban.com/j/search?start=0&limit=20&query=" + title
    useragent = "Mozilla/5.0 (Linux; Android 8.1.0; JKM-AL00b Build/HUAWEIJKM-AL00b; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044807 Mobile Safari/537.36"
    response = requests.get(query, headers={"User-Agent": useragent})
    list = response.json()
    bookList = []
    for i in list:
        if i["title"] is not None:
            bookList.append({
                "title": i["title"],
                "subtitle": i["subtitle"],
                "author": i["author"],
                "abstract": i["abstract"],
                "cover": i["cover"],
                "id": i["id"]
            })
    return {
        "status_code": 200,
        "operation": "search for book",
        "text": "OK, I will search for " + title + " for you",
        "booklist": bookList
    }
    
async def ttsfile(text: str):
    prompt = GETFILENAME
    filename = google_gemini(text, prompt)
    
    query = "SELECT FileAddress, Type FROM fileInfo WHERE Filename = :filename"
    respone = database.fetch_one(query, {"filename": filename})
    file_path = respone[0]
    file_type = respone[1]
    database.disconnect()
    
    if file_path is None:
        return {
            "status_code": 404,
            "operation": "tts a file",
            "text": "Can not find " + filename + ". Please check the filename and try again!"
        }
    
    if file_type != 'epub' and file_type != 'pdf' and file_type != 'txt':
        return {
            "status_code": 400,
            "operation": "tts a file",
            "text": "File type is not supported"
        }
    
    with open(file_path, 'r') as file:
        content = file.read()
    
    request = content.replace("\"", " ")
    voice = "zh-CN-XiaoxiaoNeural"
    TTS_PATH = "./tts_files"
    
    try:
        unique_filename = str(uuid4()) + ".mp3"
        file_path = os.path.join(TTS_PATH, unique_filename)
        
        communicate = Communicate(request, voice)
        await communicate.save(file_path)
        return {
            "status_code": 200,
            "operation": "tts a file",
            "text": "OK, I will TTS " + filename,
            "file_path": file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
