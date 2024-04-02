from fastapi import FastAPI
import requests

app = FastAPI()

@app.get("/search")
async def search_books(keyword: str):