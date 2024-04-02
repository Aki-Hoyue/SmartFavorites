from fastapi import FastAPI, HTTPException
from edge_tts import Communicate
from pydantic import BaseModel
import os
from uuid import uuid4


TTS_PATH = "./tts_files"
if not os.path.exists(TTS_PATH):
    os.makedirs(TTS_PATH)

app = FastAPI()

class TTSRequest(BaseModel):
    text: str
    voice: str

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    TEXT = request.text
    VOICE = request.voice
    try:
        unique_filename = str(uuid4()) + ".mp3"
        file_path = os.path.join(TTS_PATH, unique_filename)
        
        communicate = Communicate(TEXT, VOICE)
        await communicate.save(file_path)
        return {
            "status": "success",
            "file_path": file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/process_tts")
async def process_text_to_speech(request: str, voice: str):
    request = request.replace("\"", " ")  # Fixed variable assignment
    return await text_to_speech(TTSRequest(text=request, voice=voice))  # Fixed return statement

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