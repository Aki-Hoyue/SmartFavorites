from fastapi import FastAPI
import file
import login
import search
import ocr
import tts
import rss
import userManagement
import voiceassistant


app = FastAPI()


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
