from fastapi import FastAPI
import requests
import base64
from pydantic import BaseModel

app = FastAPI()

class searchInfo(BaseModel):
    keyword: str
    email: str
    loginAuth: str

@app.post("/search")
async def search_books(request: searchInfo):
    keyword = request.keyword
    email = request.email
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    
    if loginAuth == email:
        query = "https://read.douban.com/j/search?start=0&limit=20&query=" + keyword
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
        return bookList
    else:
        return {
            "status_code": 401,
            "detail": "User not logined",
            "loginAuth": loginAuth,
            "email": email
        }