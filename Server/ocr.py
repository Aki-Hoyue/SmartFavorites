from contextlib import asynccontextmanager
import os
from pathlib import Path
import mimetypes
from databases import Database
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, APIRouter
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import base64
import requests

database = Database("sqlite:///SmartFavoritesDB.db")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()
app = APIRouter(lifespan=lifespan, tags=["OCR"])

class OCRRequest(BaseModel):
    email: str
    uid: str
    loginAuth: str
    languages: str
    
@app.post("/ocr/{fid}")
async def process_ocr(fid: int, request: OCRRequest):
    email = request.email
    uid = request.uid
    languages = request.languages
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    
    if loginAuth != email + uid:
        return {
            "status_code": 401,
            "detail": "User not logged in"
        }
    
    query = "SELECT FileAddress FROM fileInfo WHERE FID = :fid"
    file_path = await database.fetch_one(query, {"fid": fid})
    if file_path is None:
        return {
            "status_code": 400,
            "detail": "File not found"
        }
    
    file_path = file_path[0]
    content_type = mimetypes.guess_type(file_path)[0]
    if content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Input file is not a PDF")
    
    filename = Path(file_path).name
    try:
        with open(file_path, 'rb') as f:
            file_content = f.read()
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    if languages == 'eng':
        ocr_render_type = 'hocr'
    else: 
        ocr_render_type = 'sandwich'
    sidecar = True
    ocr_type = 'skip-text'
    
    try:
        response = requests.post(
            'https://pdf.hoyue.fun/api/v1/misc/ocr-pdf',
            files={'fileInput': (filename, file_content, content_type)},
            data={
                'languages': languages,
                'sidecar': sidecar,
                'ocrType': ocr_type,
                'ocrRenderType': ocr_render_type
            },
            headers={"User-Agent": "HoyueAPI / 1.0.0"}
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    if response.status_code == 200:
        filename = filename.replace(".pdf", "")
        filename = f"{filename}_ocr.zip"
        file_path = f"./ocr_files/{filename}"
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(response.content)
        
        return {
            "status_code": 200,
            "file_path": file_path.replace("./", "/").replace("\\", "/")
        }
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
        
