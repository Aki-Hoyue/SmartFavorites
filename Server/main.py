from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import file
import login
import search
import ocr
import tts
import rss
import userManagement
import voiceassistant
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.mount("/avatars", StaticFiles(directory="avatars"), name="avatars")
app.mount("/files", StaticFiles(directory="files"), name="files")
app.mount("/tts_files", StaticFiles(directory="tts_files"), name="tts_files")

origins = [
    "http://localhost:3000",
    "http://localhost:443",
    "https://localhost",
    "http://localhost:80",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(file.app)
app.include_router(login.app)
app.include_router(search.app)
app.include_router(ocr.app)
app.include_router(rss.app)
app.include_router(tts.app)
app.include_router(userManagement.app)
app.include_router(voiceassistant.app)

'''
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Start with command: uvicorn app.main:app --reload
'''
