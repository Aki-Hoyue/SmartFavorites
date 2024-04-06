from fastapi import FastAPI, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
import base64
import requests

app = FastAPI()

class ocrInfo(BaseModel):
    email: str
    loginAuth: str
    languages: str
    file: UploadFile


@app.post("/ocr")
async def register(request: ocrInfo):
    email = request.email
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth)
    if loginAuth == email:
        file_input = request.file.file
        languages = request.languages
        if languages == 'eng':
            ocr_render_type = 'hocr'
        else: 
            ocr_render_type = 'sandwich'
        sidecar = True  # Set to True if you want to include OCR text in a sidecar text file
        ocr_type = 'Normal'  # Specify the OCR type, e.g., 'skip-text', 'force-ocr', or 'Normal'
        
        response = requests.post(
            'https://pdf.hoyue.pp.ua/api/v1/misc/ocr-pdf',
            files={'fileInput': file_input},
            data={
                'languages': languages,
                'sidecar': sidecar,
                'ocrType': ocr_type,
                'ocrRenderType': ocr_render_type
            }
        )

        file_input.close()

        if response.status_code == 200:
            # Process the response body as a file and return it as an object
            return FileResponse(response.content)
        
        else:
            return {
                "status_code": response.status_code,
                "detail": "OCR request failed"
            }
    else:
        return {
            "status_code": 401,
            "detail": "User not logged in"
        }
