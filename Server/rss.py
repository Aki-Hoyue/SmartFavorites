import base64
from fastapi import FastAPI, HTTPException
import feedparser
from databases import Database
from contextlib import asynccontextmanager
from datetime import datetime

database = Database("sqlite:///test.db")

@asynccontextmanager
async def lifespan(rss: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

# 创建FastAPI应用
rss = FastAPI(lifespan=lifespan)

@rss.get("/rss")
async def read_rss(feed_url: str, urlid: int, email: str, uid: int, loginAuth: str):
    Auth = loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == email + uid:
        feed = feedparser.parse(feed_url, agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36')

        if feed.bozo:
            raise HTTPException(status_code=400, detail="Can not resolve rss feed url.")

        await database.execute("CREATE TABLE IF NOT EXISTS rssContent (UID INTEGER PRIMARY KEY NOT NULL, Title TEXT NOT NULL, Link TEXT NOT NULL, Published INTEGER)")

        query = await database.fetch_all("SELECT Link FROM rssContent ORDER BY Published DESC")
        
        articles = []
        
        for entry in feed.entries:
            published = int(datetime.strptime(entry.published, "%a, %d %b %Y %H:%M:%S %z").timestamp())
            query_links = [row[0] for row in query]
            if entry.link not in query_links:
                articles.append({
                    "Title": entry.title,
                    "Link": entry.link,
                    "Published": published,
                    "UID": urlid
                })
                await database.execute("INSERT INTO rssContent VALUES (:Title, :Link, :Published, :UID)", {
                    "UID": urlid,
                    "Title": entry.title,
                    "Link": entry.link,
                    "Published": published
                })  
        
        result = await database.fetch_all("SELECT * FROM rssContent WHERE UID = :UID ORDER BY Published DESC", {"UID": urlid})
        
        return result
    
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }
