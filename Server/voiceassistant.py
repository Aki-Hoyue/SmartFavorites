from contextlib import asynccontextmanager
import os
import shutil
from fastapi.responses import StreamingResponse
import requests
import whisper
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, APIRouter
import base64
import json
from databases import Database
from io import BytesIO
from edge_tts import Communicate
from uuid import uuid4
import torch
from transformers import BertTokenizer

database = Database("sqlite:///SmartFavoritesDB.db")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

app = APIRouter(lifespan=lifespan, tags=["Voice Assistant"])

def classifier(text: str):
    from model import BertClassifier
    
    tokenizer = BertTokenizer.from_pretrained('bert-base-cased')

    labels = {'open a file': 0, 'delete a file': 1, 'ocr a file': 2, 'get latest rss titles': 3, 'search a book': 4, 'tts a file': 5}

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = torch.load('./models/classifier.pth')
    
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

LABEL = json.dumps({
    "labels": {
        "open a file": 0,
        "delete a file": 1,
        "ocr a file (Getting the system to convert text to text)": 2,
        "get latest rss titles (or latest article or feeds)": 3,
        "search a book": 4,
        "tts a file (Getting the system to read text)": 5
    }
})

CONFIDENT_EXAMPLE = json.dumps({
    "Most_Confidence": {
        "label": "0",
        "level": "percentage"
    }
})

FINAL_EXAMPLE_EN = json.dumps({
    "Most_Confidence": {
        "label": "0",
        "level": "percentage"
    },
    "Response": "[Here is some response in the language of the input...]",
    "Language": "English"
})

FINAL_EXAMPLE_ZH = json.dumps({
    "Most_Confidence": {
        "label": "0",
        "level": "percentage"
    },
    "Response": "[这里是一些回复，用输入的语言...]",
    "Language": "Chinese"
})

PROMPT = "You are an intelligent verbal response assistant tasked with providing accurate responses based on the prompts I present to you. Initially, I will send you a statement for which you are to assess the confidence level of each item in a set of labels according to what the statement implies, using your model's capabilities. The assessment should be formatted in JSON. You are to respond with the label that has the highest confidence level, along with the confidence percentage. If you determine that the statement does not align with any of the provided labels, you should indicate this with a label number of -1 and a confidence level of -1. Following this, rather than stating a mismatch, you should proceed to offer a creative text response to the statement. \nThe labels are defined as follows: " + LABEL + "\nAn example labels matching output would look like this:\n" + CONFIDENT_EXAMPLE + "\nNote that the [level] should be expressed as a percentage in the form of a floating-point string ranging from 0 to 1, such as '0.5'.\n Following the confidence assessment, please provide your feedback on the statement using generative text based on the content of the statement. The response should aim to enhance the user experience from the perspective of a voice assistant. The text response should be in either Chinese or English, matching the language of the input. Additionally, all double quotes in the 'Response' field must be converted to brackets ('[]'). The output language should be specified as either 'English' or 'Chinese'. This information should be appended to the previous JSON structure. Here's an example:\n" + FINAL_EXAMPLE_EN + "\nOR\n" + FINAL_EXAMPLE_ZH + "Please ensure that all percentages in the output are in string format. All quotes in the JSON you return must be double quotes. Do not alter single quotes within the text of the 'Response' (e.g., leave [your's] as is, and do not change [I'm] to [I\"m]). Convert other double quotes within 'Response' to brackets ('[]'), such as changing \"Hello\" to [Hello]."

GETFILENAME = "You are an intelligent verbal response assistant who will respond to the correct answer based on the prompts I give you. I want you to extract the keywords in the following statement, keywords includes the file title or filename or the search keyword or the file ID, for example from 'I want to open the file test.md.' to 'test.md', or from ' I want to ocr the mybook.' to 'mybook', or from 'I want to search for 'Huozhe' to 'Huozhe', or from 'I want to open the file which id is 1.' to '1'. Please return the extracted content to me with JSON format and finally tell me the language of the input text, for example: {'Type': 'Keyword', 'Keyword': 'Huozhe', 'Language': 'English'}, or {'Type': 'ID', 'ID': '1', 'Language': 'English'}, or {'Type': 'Name', 'Name': 'mybook', 'Language': 'English'}. Type only includes 'Keyword', 'ID' and 'Name' (Title or complete name are included in 'Name'), 'Keyword' only appears if a search is involved, Language only includes 'English' and 'Chinese'. Please all the quotes in the JSON you return are double quotes, don't refer to my example as it is for ease of writing, if they are not double quotes please modify them before outputting. The following is my statement, please complete the output according to the above requirements:\n"

async def google_gemini(text: str, prompt=None):
    GOOGLE_API = "AIzaSyDqoqVxxiQYmcua5GkJ7oYX8zoVMcGyfvY"
    import google.generativeai as genai
    
    config = {
        "temperature": 0.8,
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
    
    print("Google Gemini response: ", response.text.replace("'", "\""))
    
    return response.text.replace("'", "\"")

async def openfile(text: str):
    response = await google_gemini(text, GETFILENAME)
    response = response.replace("```", "")
    response = response.replace("JSON", "")
    response = response.replace("json", "")
    response = response.strip()
    response = json.loads(response)
    print("Open a file, with response: ", response)
    
    try:
        if response['Type'] == 'ID':
            query = "SELECT Filename FROM fileInfo WHERE FID = :id"
            result = await database.fetch_one(query, {"id": int(response['ID'])})    
            if result:
                if response['Language'] == 'English':
                    return {
                        "status_code": 200,
                        "operation": 0,
                        "text": "OK, I will open the file that id is " + response['ID'] + " for you",
                        "fileid": int(response['ID']),
                        "filename": result[0],
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 200,
                        "operation": 0,
                        "text": "好的，我会帮你打开ID为" + response['ID'] + "的文件。",
                        "fileid": int(response['ID']),
                        "filename": result[0],
                        "language": "Chinese"
                    }
            if response['Language'] == 'English':
                return {
                    "status_code": 404,
                    "operation": 0,
                    "text": "Can not find the file which ID is " + response['ID'] + ". Please check the ID and try again!",
                    "language": "English"
                }
            else:
                return {
                    "status_code": 404,
                    "operation": 0,
                    "text": "没有找到ID为" + response['ID'] + "的文件。请检查ID。",
                    "language": "Chinese"
                }
        elif response['Type'] == 'Name':
            query = "SELECT FID FROM fileInfo WHERE Filename = :filename"
            result = await database.fetch_one(query, {"filename": response['Name'].lower().lower()})
            if result:
                if response['Language'] == 'English':
                    return {
                        "status_code": 200,
                        "operation": 0,
                        "text": "OK, I will open " + response['Name'].lower() + " for you",
                        "fileid": int(result[0]),
                        "filename": response['Name'].lower().lower(),
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 200,
                        "operation": 0,
                        "text": "好的，我会打开" + response['Name'].lower() + "。",
                        "fileid": int(result[0]),
                        "filename": response['Name'].lower(),
                        "language": "Chinese"
                    }
            if response['Language'] == 'English':
                return {
                    "status_code": 404,
                    "operation": 0,
                    "text": "Can not find the file which name is " + response['Name'].lower() + ". Please check the name and try again!",
                    "language": "English"
                }
            else:
                return {
                    "status_code": 404,
                    "operation": 0,
                    "text": "没有找到名称为" + response['Name'].lower() + "的文件。请检查名称。",
                    "language": "Chinese"
                }
        
        else:
            if response['Language'] == 'English':
                return {
                    "status_code": 400,
                    "operation": 0,
                    "text": "Voice handle error",
                    "details": response,
                    "language": "English"
                }
            else:
                return {
                    "status_code": 400,
                    "operation": 0,
                    "text": "语音处理错误",
                    "details": response,
                    "language": "Chinese"
                }
    except Exception as e:
        raise HTTPException(status_code=400, message=e)
    
async def deletefile(text: str):
    response = await google_gemini(text, GETFILENAME)
    response = response.replace("```", "")
    response = response.replace("JSON", "")
    response = response.replace("json", "")
    response = response.strip()
    response = json.loads(response)
    
    try:
        if response['Type'] == 'ID':
            query = "SELECT Filename FROM fileInfo WHERE FID = :id"
            result = await database.fetch_one(query, {"id": int(response['ID'])})
            if result:
                if response['Language'] == 'English':
                    return {
                        "status_code": 200,
                        "operation": 1,
                        "text": "OK, I will delete the file that id is " + response['ID'] + " for you",
                        "language": "English",
                        "fileid": int(response['ID'])
                    }
                else:
                    return {
                        "status_code": 200,
                        "operation": 1,
                        "text": "好的，我会删除ID为" + response['ID'] + "的文件",
                        "language": "Chinese",
                        "fileid": int(response['ID'])
                    }
            else:
                if response['Language'] == 'English':
                    return {
                        "status_code": 404,
                        "operation": 1,
                        "text": "Can not find the file which ID is " + response['ID'] + ". Please check the ID and try again!",
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 404,
                        "operation": 1,
                        "text": "没有找到ID为" + response['ID'] + "的文件。请检查ID。",
                        "language": "Chinese"
                    }
        
        elif response['Type'] == 'Name':
            query = "SELECT FID FROM fileInfo WHERE Filename = :filename"
            result = await database.fetch_one(query, {"filename": response['Name'].lower()})
            if result:
                if response['Language'] == 'English':
                    return {
                        "status_code": 200,
                        "operation": 1,
                        "text": "OK, I will delete the file that name is " + response['Name'].lower() + " for you",
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 200,
                        "operation": 1,
                        "text": "好的，我会删除名称为" + response['Name'].lower() + "的文件",
                        "language": "Chinese"
                    }
            else:
                if response['Language'] == 'English':
                    return {
                        "status_code": 404,
                        "operation": 1,
                        "text": "Can not find the file which name is " + response['Name'].lower() + ". Please check the name and try again!",
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 404,
                        "operation": 1,
                        "text": "没有找到名称为" + response['Name'].lower() + "的文件。请检查名称。",
                        "language": "Chinese"
                    }
        else:
            if response['Language'] == 'English':
                return {
                    "status_code": 400,
                    "operation": 1,
                    "text": "Voice handle error",
                    "details": response,
                    "language": "English"
                }
            else:
                return {
                    "status_code": 400,
                    "operation": 1,
                    "text": "语音处理错误",
                    "details": response,
                    "language": "Chinese"
                }
    except Exception as e:
        raise HTTPException(status_code=400, message=e)

async def ocrfile(text: str):
    response = await google_gemini(text, GETFILENAME)
    response = response.replace("```", "")
    response = response.replace("JSON", "")
    response = response.replace("json", "")
    response = response.strip()
    response = json.loads(response)
    
    try:
        if response['Type'] == 'ID':
            query = "SELECT Type FROM fileInfo WHERE FID = :id"
            result = await database.fetch_one(query, {"id": int(response['ID'])})
            if result[0].replace(".", "").replace(" ", "").upper() == "PDF":
                if response['Language'] == 'English':
                    return {
                        "status_code": 200,
                        "operation": 2,
                        "text": "OK, I will ocr the file that id is " + response['ID'] + " for you",
                        "fileid": int(response['ID']),
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 200,
                        "operation": 2,
                        "text": "好的，我会帮你OCR ID为" + response['ID'] + "的文件。",
                        "fileid": int(response['ID']),
                        "language": "Chinese"
                    }
            else:
                if response['Language'] == 'English':
                    return {
                        "status_code": 404,
                        "operation": 2,
                        "text": "Not support file type or can not find the file which ID is " + response['ID'] + ". Please check the ID and try again!",
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 404,
                        "operation": 2,
                        "text": "不支持文件类型或没有找到ID为" + response['ID'] + "的文件。请检查ID。",
                        "language": "Chinese"
                    }
        elif response['Type'] == 'Name':
            query = "SELECT Type FROM fileInfo WHERE Filename = :filename"
            result = await database.fetch_one(query, {"filename": response['Name'].lower()})
            if result[0].replace(".", "").replace(" ", "").upper() == "PDF":
                query = "SELECT FID FROM fileInfo WHERE Filename = :filename"
                result = await database.fetch_one(query, {"filename": response['Name'].lower()})
                if response['Language'] == 'English':
                    return {
                        "status_code": 200,
                        "operation": 2,
                        "text": "OK, I will ocr the file that name is " + response['Name'].lower() + " for you",
                        "fileid": int(result[0]),
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 200,
                        "operation": 2,
                        "text": "好的，我会帮你OCR名称为" + response['Name'].lower() + "的文件。",
                        "fileid": int(result[0]),
                        "language": "Chinese"
                    }
            else:
                if response['Language'] == 'English':
                    return {
                        "status_code": 404,
                        "operation": 2,
                        "text": "Not support file type or can not find the file which name is " + response['Name'].lower() + ". Please check the name and try again!",
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 404,
                        "operation": 2,
                        "text": "不支持文件类型或没有找到名称为" + response['Name'].lower() + "的文件。请检查名称。",
                        "language": "Chinese"
                    }
        else:
            if response['Language'] == 'English':
                return {
                    "status_code": 400,
                    "operation": 2,
                    "text": "Voice handle error",
                    "details": response,
                    "language": "English"
                }
            else:
                return {
                    "status_code": 400,
                    "operation": 2,
                    "text": "语音处理错误",
                    "details": response,
                    "language": "Chinese"
                }
    except Exception as e:
        raise HTTPException(status_code=400, message=e)

async def getlatestrss():
    query = "SELECT Link FROM rssContent WHERE Published = (SELECT MAX(Published) FROM rssContent)" 
    Link = await database.fetch_one(query)
    if Link:
        return {
            "status_code": 200,
            "operation": 3,
            "text": "OK, I will get the latest rss article for you",
            "link": Link[0],
            "language": "English"
        }
    else:
        return {
            "status_code": 404,
            "operation": 3,
            "text": "Can not find the latest rss article",
            "language": "English"
        }

async def searchbook(text: str):
    response = await google_gemini(text, GETFILENAME)
    response = response.replace("```", "")
    response = response.replace("JSON", "")
    response = response.replace("json", "")
    response = response.strip()
    response = json.loads(response)
    
    try:
        if response['Type'] == 'Keyword':
            if response['Language'] == 'English':
                return {
                    "status_code": 200,
                    "operation": 4,
                    "text": "OK, I will search for " + response['Keyword'] + " for you",
                    "keyword": response['Keyword'],
                    "language": "English"
                }
            else:
                return {
                    "status_code": 200,
                    "operation": 4,
                    "text": "好的，我会搜索" + response['Keyword'] + "。",
                    "keyword": response['Keyword'],
                    "language": "Chinese"
                }
        else:
            if response['Language'] == 'English':
                return {
                    "status_code": 400,
                    "operation": 4,
                    "text": "Voice handle error",
                    "details": response,
                    "language": "English"
                }
            else:
                return {
                    "status_code": 400,
                    "operation": 4,
                    "text": "语音处理错误",
                    "details": response,
                    "language": "Chinese"
                }
    except Exception as e:
        raise HTTPException(status_code=400, message=e)
    
async def ttsfile(text: str):
    response = await google_gemini(text, GETFILENAME)
    response = response.replace("```", "")
    response = response.replace("JSON", "")
    response = response.replace("json", "")
    response = response.strip()
    response = json.loads(response)
    
    try:
        if response['Type'] == 'ID':
            query = "SELECT Type FROM fileInfo WHERE FID = :id"
            result = await database.fetch_one(query, {"id": int(response['ID'])})
            if result[0].replace(".", "").replace(" ", "").upper() == "TXT":  
                query = "SELECT Filename FROM fileInfo WHERE FID = :id"
                result = await database.fetch_one(query, {"id": int(response['ID'])})
                if result:
                    if response['Language'] == 'English':
                        return {
                            "status_code": 200,
                            "operation": 5,
                            "text": "OK, I will tts the file that id is " + response['ID'] + " for you",
                            "fileid": int(response['ID']),
                            "language": "English"
                        }
                    else:
                        return {
                            "status_code": 200,
                            "operation": 5,
                            "text": "好的，我会帮你TTS ID为" + response['ID'] + "的文件。",
                            "fileid": int(response['ID']),
                        }
                else:
                    if response['Language'] == 'English':
                        return {
                            "status_code": 404,
                            "operation": 5,
                            "text": "Can not find the file which ID is " + response['ID'] + ". Please check the ID and try again!",
                            "language": "English"
                        }
                    else:
                        return {
                            "status_code": 404,
                            "operation": 5,
                            "text": "没有找到ID为" + response['ID'] + "的文件。请检查ID。",
                            "language": "Chinese"
                        }
            else:
                if response['Language'] == 'English':
                    return {
                        "status_code": 404,
                        "operation": 5,
                        "text": "Not support file type or can not find the file which ID is " + response['ID'] + ". Please check the ID and try again!",
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 404,
                        "operation": 5,
                        "text": "不支持文件类型或没有找到ID为" + response['ID'] + "的文件。请检查ID。",
                        "language": "Chinese"
                    }
        elif response['Type'] == 'Name':
            query = "SELECT Type FROM fileInfo WHERE Filename = :filename"
            result = await database.fetch_one(query, {"filename": response['Name'].lower()})
            if result[0].replace(".", "").replace(" ", "").upper() == "TXT":
                query = "SELECT FID FROM fileInfo WHERE Filename = :filename"
                result = await database.fetch_one(query, {"filename": response['Name'].lower()})
                if result:
                    if response['Language'] == 'English':
                        return {
                            "status_code": 200,
                            "operation": 5,
                            "text": "OK, I will tts the file that name is " + response['Name'].lower() + " for you",
                            "fileid": int(result[0]),
                            "language": "English"
                        }
                    else:
                        return {
                            "status_code": 200,
                            "operation": 5,
                            "text": "好的，我会帮你TTS名称为" + response['Name'].lower() + "的文件。",
                            "fileid": int(result[0]),
                            "language": "Chinese"
                        }
                else:
                    if response['Language'] == 'English':
                        return {
                            "status_code": 404,
                            "operation": 5,
                            "text": "Can not find the file which name is " + response['Name'].lower() + ". Please check the name and try again!",
                            "language": "English"
                        }
                    else:
                        return {
                            "status_code": 404,
                            "operation": 5,
                            "text": "没有找到名称为" + response['Name'].lower() + "的文件。请检查名称。",
                            "language": "Chinese"
                        }
            else:
                if response['Language'] == 'English':
                    return {
                        "status_code": 404,
                        "operation": 5,
                        "text": "Not support file type or can not find the file which name is " + response['Name'].lower() + ". Please check the name and try again!",
                        "language": "English"
                    }
                else:
                    return {
                        "status_code": 404,
                        "operation": 5,
                        "text": "不支持文件类型或没有找到名称为" + response['Name'].lower() + "的文件。请检查名称。",
                        "language": "Chinese"
                    }
        else:
            if response['Language'] == 'English':
                return {
                    "status_code": 400,
                    "operation": 5,
                    "text": "Voice handle error",
                    "details": response,
                    "language": "English"
                }
            else:
                return {
                    "status_code": 400,
                    "operation": 5,
                    "text": "语音处理错误",
                    "details": response,
                    "language": "Chinese"
                }
    except Exception as e:
        raise HTTPException(status_code=400, message=e)

@app.post("/voiceTransform")
async def voiceTransform(email: str = Form(...), uid: str = Form(...), loginAuth: str = Form(...), voice: UploadFile = File(...)):
    Auth = loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == email + uid:
        try:
            filepath = f"./files/{voice.filename}"
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            with open(filepath, "wb") as f:
                data = await voice.read()
                f.write(data)
                shutil.copyfileobj(voice.file, f)
            
            model = whisper.load_model("medium", download_root="./models")
            
            prompt = "你默认使用英文分析语音内容并返回表示文本，如果使用了中文，则使用简体中文来表示文本内容。"
            result = model.transcribe(filepath, language=None, initial_prompt=prompt)
            return {
                "status_code": 200,
                "text": result["text"]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

@app.post("/voiceAnalysis")
async def voice(email: str = Form(...), uid: str = Form(...), loginAuth: str = Form(...), text: str = Form(...)):
    Auth = loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == email + uid:
        try:
            response = await google_gemini(text)
            response = response.replace("```", "")
            response = response.replace("JSON", "")
            response = response.replace("json", "")
            response = response.strip()
            response = json.loads(response)
            
            confident_code = response["Most_Confidence"]["label"]
            confidence = float(response["Most_Confidence"]["level"])
            state = {}
            if confident_code != '-1' and confidence >= 0.5:
                code = classifier(text)
                if confident_code != code:
                    code = confident_code 
                if code == '0':
                    state = await openfile(text)
                    print(state)
                elif code == '1':
                    state = await deletefile(text)
                elif code == '2':
                    state = await ocrfile(text)
                elif code == '3':
                    state = await getlatestrss()
                elif code == '4':
                    state = await searchbook(text)
                elif code == '5':
                    state = await ttsfile(text)
                
                response_text = state['text']
                print("state: ", state)
                print("response_text: ", response_text)
            else: 
                response_text = response['Response']
            request = response_text.replace("\"", " ")
            language = response['Language']
            if state != {}:
                language = state['language']
            
            if language == 'English':
                voice = "en-US-SteffanNeural"
            else:
                voice = "zh-CN-XiaoxiaoNeural"
            
            TTS_PATH = "./tts_files"
            
            filename = "Response.mp3"
            file_path = os.path.join(TTS_PATH, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
            
            communicate = Communicate(request, voice)
            await communicate.save(file_path)
            if state != {}:
                print(state)
                return {
                    "status_code": 200,
                    "text": response_text.replace("[", "").replace("]", ""),
                    "tts_path": file_path,
                    "state": state
                }
            else:
                return {
                    "status_code": 201,
                    "text": response_text,
                    "tts_path": file_path.replace("[", "").replace("]", "")
                }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

