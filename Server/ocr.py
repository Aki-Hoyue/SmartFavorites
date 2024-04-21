from io import BytesIO
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, APIRouter
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import base64
import requests

app = APIRouter(tags=["OCR"])

@app.post("/ocr")
async def process_ocr(email: str = Form(...), uid: str = Form(...), loginAuth: str = Form(...), languages: str = Form(...), file: UploadFile = File(...)):
    Auth = base64.b64decode(loginAuth).decode('utf-8')
    
    if Auth == email + uid:
        if languages == 'eng':
            ocr_render_type = 'hocr'
        else: 
            ocr_render_type = 'sandwich'
        sidecar = True
        ocr_type = 'skip-text'
        
        try:
            file_content = await file.read()
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        if file.content_type != 'application/pdf':
            raise HTTPException(status_code=400, detail="Input file is not a PDF")
        response = requests.post(
            'https://pdf.hoyue.pp.ua/api/v1/misc/ocr-pdf',
            files={'fileInput': (file.filename, file_content, file.content_type)},
            data={
                'languages': languages,
                'sidecar': sidecar,
                'ocrType': ocr_type,
                'ocrRenderType': ocr_render_type
            }
        )
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type')
            filename = response.headers.get('Content-Disposition').split('filename=')[1]
            return StreamingResponse(BytesIO(response.content), media_type=content_type, headers={"Content-Disposition": "form-data; name='attachment'; filename={}".format(filename)})
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)
    else:
        return {
            "status_code": 401,
            "detail": "User not logged in"
        }
