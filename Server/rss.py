import base64
from fastapi import FastAPI, HTTPException, APIRouter
import feedparser
from databases import Database
from contextlib import asynccontextmanager
from datetime import datetime

from pydantic import BaseModel

database = Database("sqlite:///test.db")

@asynccontextmanager
async def lifespan(rss: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

app = APIRouter(lifespan=lifespan, tags=["RSS"])

async def read_rss(feed_url: str, urlid: int, uid: str):
    try:
        feed = feedparser.parse(feed_url, agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36')

        if feed.bozo:
            raise HTTPException(status_code=400, detail="Can not resolve rss feed url.")

        await database.execute("CREATE TABLE IF NOT EXISTS rssContent (Title TEXT NOT NULL, Link TEXT NOT NULL PRIMARY KEY NOT NULL, Published INTEGER NOT NULL, URLID INTEGER NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY (UID) REFERENCES rssList (UID) ON DELETE CASCADE)")

        query = await database.fetch_all("SELECT Link FROM rssContent WHERE UID = :uid ORDER BY Published DESC", {"uid": int(uid)})
        
        articles = []
        
        for entry in feed.entries:
            published = int(datetime.strptime(entry.published, "%a, %d %b %Y %H:%M:%S %z").timestamp())
            query_links = [row[0] for row in query]
            if entry.link not in query_links:
                articles.append({
                    "Title": entry.title,
                    "Link": entry.link,
                    "Published": published,
                    "URLID": urlid
                })
                await database.execute("INSERT INTO rssContent VALUES (:Title, :Link, :Published, :URLID, :UID)", {
                    "Title": entry.title,
                    "Link": entry.link,
                    "Published": published,
                    "URLID": urlid,
                    "UID": int(uid)
                })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error, server busy and try again later")

@app.get("/rss")
async def update_rss(email: str, uid: str, loginAuth: str):
    Auth = loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == email + uid:
        await database.execute("CREATE TABLE IF NOT EXISTS rssList (URLID INTEGER PRIMARY KEY NOT NULL, Name TEXT NOT NULL, Link TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY (UID) REFERENCES userInfo (UID))")
        rsslist = await database.fetch_all("SELECT * FROM rssList WHERE UID = :UID", {"UID": int(uid)})
        for rss in rsslist:
            await read_rss(rss[2], rss[0], uid)
        
        query = await database.fetch_all("SELECT * FROM rssContent WHERE UID = :uid ORDER BY Published DESC", {"uid": int(uid)})
        return query
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

@app.get("/getRssList")
async def get_rss_list(email: str, uid: str, loginAuth: str):
    Auth = loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == email + uid:
        await database.execute("CREATE TABLE IF NOT EXISTS rssList (URLID INTEGER PRIMARY KEY NOT NULL, Name TEXT NOT NULL, Link TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY (UID) REFERENCES userInfo (UID))")
        rsslist = await database.fetch_all("SELECT * FROM rssList WHERE UID = :UID", {"UID": uid})
        
        return rsslist
    
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

class addRss(BaseModel):
    email: str
    uid: str
    loginAuth: str
    name: str
    link: str

@app.post("/addRss")
async def add_rss(request: addRss):
    email = request.email
    uid = request.uid
    loginAuth = request.loginAuth
    name = request.name
    link = request.link
    Auth = loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == email + uid:
        await database.execute("CREATE TABLE IF NOT EXISTS rssList (URLID INTEGER PRIMARY KEY NOT NULL, Name TEXT NOT NULL, Link TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY (UID) REFERENCES userInfo (UID))")
        query = await database.fetch_all("SELECT * FROM rssList WHERE UID = :UID", {"UID": int(uid)})
        urlid = len(query) + 1
        await database.execute("INSERT INTO rssList VALUES (:URLID, :Name, :Link, :UID)", {
            "URLID": urlid,
            "Name": name,
            "Link": link,
            "UID": int(uid)
        })
        
        return {
            "status_code": 200,
            "detail": "Add RSS success"
        }
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

class deleteRss(BaseModel):
    email: str
    uid: str
    loginAuth: str
    urlid: int

@app.post("/deleteRss")
async def delete_rss(request: deleteRss):
    Auth = request.loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == request.email + request.uid:
        await database.execute("CREATE TABLE IF NOT EXISTS rssList (URLID INTEGER PRIMARY KEY NOT NULL, Name TEXT NOT NULL, Link TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY (UID) REFERENCES userInfo (UID))")
        await database.execute("DELETE FROM rssList WHERE URLID = :URLID AND UID = :UID", {"URLID": request.urlid, "UID": int(request.uid)})
        await database.execute("DELETE FROM rssContent WHERE URLID = :URLID AND UID = :UID", {"URLID": request.urlid, "UID": int(request.uid)})
        
        return {
            "status_code": 200,
            "detail": "Delete RSS success"
        }
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }
