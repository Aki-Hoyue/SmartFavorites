import shutil
from fastapi import FastAPI, File, UploadFile, APIRouter
from databases import Database
from contextlib import asynccontextmanager
from pydantic import BaseModel
import base64
import os
import uuid

database = Database("sqlite:///test.db")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

app = APIRouter(lifespan=lifespan, tags=["File Management"])   

class fileInfo(BaseModel):
    email: str
    uid: str
    loginAuth: str

@app.get("/files")
async def getfiles(email: str, uid: str, loginAuth: str):
    await database.execute("CREATE TABLE IF NOT EXISTS fileInfo (FID INTEGER PRIMARY KEY NOT NULL, Filename TEXT NOT NULL, Type TEXT NOT NULL, Description TEXT, FileAddress TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY(UID) REFERENCES userInfo(UID))")
    Auth = loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == email + uid:
        query = "SELECT * FROM fileInfo WHERE UID = :uid"
        result = await database.fetch_all(query, {"uid": uid})
        return {
            "status_code": 200,
            "data": result
        }
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }
        
@app.post("/upload")
async def upload(email: str, uid: str, loginAuth: str, file: UploadFile = File(...)):
    await database.execute("CREATE TABLE IF NOT EXISTS fileInfo (FID INTEGER PRIMARY KEY NOT NULL, Filename TEXT NOT NULL, Type TEXT NOT NULL, Description TEXT, FileAddress TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY(UID) REFERENCES userInfo(UID))")
    Auth = loginAuth.encode("utf-8")
    Auth = base64.b64decode(Auth).decode("utf-8")
    
    if Auth == email + uid:
        query = "SELECT COALESCE(MAX(FID), 0) + 1 FROM fileInfo"
        result = await database.fetch_one(query)
        fid = result[0]
        
        description = ""
        file_type = os.path.splitext(file.filename)[1].replace(".", "")
        file_uuid_name = str(uuid.uuid4()) + "." + file_type
        file_path = f"./files/{file_uuid_name}"
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as f:
            data = await file.read()
            f.write(data)
            shutil.copyfileobj(file.file, f)

        query = "INSERT INTO fileInfo VALUES (:FID, :Filename, :Type, :Description, :FileAddress, :UID)"
        await database.execute(query, {
            "FID": fid,
            "Filename": file.filename,
            "Type": file_type,
            "Description": description,
            "FileAddress": file_path,
            "UID": uid
        })

        return {
            "status_code": 200,
            "fid": fid,
            "file_path": file_path
        }
        
    else:
        return {
            "status_code": 401,
            "detail": "User not logged in"
        }
        
@app.post("/delete")
async def delete(request: fileInfo, fid: int):
    await database.execute("CREATE TABLE IF NOT EXISTS fileInfo (FID INTEGER PRIMARY KEY NOT NULL, Filename TEXT NOT NULL, Type TEXT NOT NULL, Description TEXT, FileAddress TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY(UID) REFERENCES userInfo(UID))")
    email = request.email
    uid = request.uid
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    
    if loginAuth == email + uid:
        query = "SELECT FileAddress FROM fileInfo WHERE FID = :fid"
        file_path = await database.fetch_one(query, {"fid": fid})
        if file_path is None:
            return {
                "status_code": 400,
                "detail": "File not found",
                "filepath": file_path
            }
        
        query = "DELETE FROM fileInfo WHERE FID = :fid"
        await database.execute(query, {"fid": fid})
        os.remove(file_path[0])
        
        return {
            "status_code": 200,
            "detail": "Delete success"
        }
        
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

@app.post("/modifyFiles")
async def modify_files(request: fileInfo, fid: int, filename: str = "", description: str = ""):
    await database.execute("CREATE TABLE IF NOT EXISTS fileInfo (FID INTEGER PRIMARY KEY NOT NULL, Filename TEXT NOT NULL, Type TEXT NOT NULL, Description TEXT, FileAddress TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY(UID) REFERENCES userInfo(UID))")
    email = request.email
    uid = request.uid
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    
    if loginAuth == email + uid:
        query = "UPDATE fileInfo SET Filename = :Filename, Description = :Description WHERE FID = :FID"
        try: 
            await database.execute(query, {"Filename": filename, "Description": description, "FID": fid})
            return {"status_code": 200}
        except Exception:
            return {"status_code": 400}
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

@app.post("/fileSearch")
async def file_search(request: fileInfo, keyword: str):
    await database.execute("CREATE TABLE IF NOT EXISTS fileInfo (FID INTEGER PRIMARY KEY NOT NULL, Filename TEXT NOT NULL, Type TEXT NOT NULL, Description TEXT, FileAddress TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY(UID) REFERENCES userInfo(UID))")
    email = request.email
    uid = request.uid
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    
    if loginAuth == email + uid:
        query = "SELECT * FROM fileInfo WHERE (Filename LIKE :keyword OR Description LIKE :keyword) AND Email = :email"
        try:
            result = await database.fetch_all(query, {"keyword": "%" + keyword + "%", "email": email})
            return {
                "status_code": 200,
                "data": result
            }
        except Exception:
            return {
                "status_code": 400,
                "detail": "File not found"
            }
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }    