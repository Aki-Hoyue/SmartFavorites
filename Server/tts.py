import base64
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, APIRouter
from edge_tts import Communicate
from databases import Database
from pydantic import BaseModel
import os
from uuid import uuid4

database = Database("sqlite:///SmartFavoritesDB.db")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

TTS_PATH = "./tts_files"
if not os.path.exists(TTS_PATH):
    os.makedirs(TTS_PATH)

app = APIRouter(lifespan=lifespan, tags=["TTS"])

class TTSRequest(BaseModel):
    email: str
    uid: str
    loginAuth: str
    text: str
    voice: str

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    email = request.email
    uid = request.uid
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    TEXT = request.text.replace("\"", " ")
    VOICE = request.voice
    
    if loginAuth == email + uid:
        try:
            unique_filename = "TTSResult.mp3"
            file_path = os.path.join(TTS_PATH, unique_filename)
            
            communicate = Communicate(TEXT, VOICE)
            await communicate.save(file_path)
            return {
                "status_code": 200,
                "data": file_path.replace("./", "/").replace("\\", "/")
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }
    

@app.get("/getText/{fid}")
async def get_text(fid: int, email: str, uid: str, loginAuth: str):
    Auth = loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == email + uid:
        try:
            query = "SELECT FileAddress FROM fileInfo WHERE FID = :fid"
            path = await database.fetch_one(query, {"fid": fid})
            file = open(path[0], "r", encoding="utf-8")
            result = file.read()
            
            return {
                "status_code": 200,
                "data": result
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }


# TODO: Add more voices and languages
# Test texts:
'''
zh-ch_jijiji: 季姬寂，集鸡，鸡即棘鸡。棘鸡饥叽，季姬及箕稷济鸡。鸡既济，跻姬笈，季姬忌，急咭鸡，鸡急，继圾几，季姬急，即籍箕击鸡，箕疾击几伎，伎即齑，鸡叽集几基，季姬急极屐击鸡，鸡既殛，季姬激，即记《季姬击鸡记》。

en: Life was like a box of chocolates, you never know what you're gonna get.	

number: 早上好，今天是2020/10/29，最低温度是-3°C。	

mixed: 大家好，我是 parrot 虚拟老师，我们来读一首诗，我与春风皆过客，I and the spring breeze are passing by，你携秋水揽星河，you take the autumn water to take the galaxy。	

zh-hk_1: 宜家唔系事必要你讲，但系你所讲嘅说话将会变成呈堂证供。	

zh-hk_2: 各个国家有各个国家嘅国歌
'''

# https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4