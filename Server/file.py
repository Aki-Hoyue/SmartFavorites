import shutil
from fastapi import FastAPI, File, Form, UploadFile, APIRouter
from databases import Database
from contextlib import asynccontextmanager
from pydantic import BaseModel
import base64
import os
import uuid

database = Database("sqlite:///SmartFavoritesDB.db")

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

class modifyInfo(BaseModel):
    email: str
    uid: str
    loginAuth: str
    filename: str
    author: str
    abstract: str
    cover: str

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
            "data": result,
            "count": len(result)
        }
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }
        
@app.post("/upload")
async def upload(email: str = Form(...), uid: str = Form(...), loginAuth: str = Form(...), file: UploadFile = File(...)):
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
            "Type": file_type.replace(".", "").upper(),
            "Description": description,
            "FileAddress": file_path,
            "UID": uid
        })

        return {
            "status_code": 200,
            "data": {
                "FID": fid,
                "Filename": file.filename,
                "Type": file_type.replace(".", "").upper(),
                "Description": description,
                "FileAddress": file_path,
                "UID": uid
            }
        }
        
    else:
        return {
            "status_code": 401,
            "detail": "User not logged in"
        }
        
@app.post("/delete/{fid}")
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

@app.post("/modifyFiles/{fid}")
async def modify_files(request: modifyInfo, fid: int):
    await database.execute("CREATE TABLE IF NOT EXISTS fileInfo (FID INTEGER PRIMARY KEY NOT NULL, Filename TEXT NOT NULL, Type TEXT NOT NULL, Description TEXT, FileAddress TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY(UID) REFERENCES userInfo(UID))")
    filename = request.filename
    author = request.author
    abstract = request.abstract
    cover = request.cover
    email = request.email
    uid = request.uid
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    
    if loginAuth == email + uid:
        if filename == "" and author == "" and abstract == "":
            return {
                "status_code": 400,
                "detail": "No modification"
            }
        query = "UPDATE fileInfo SET Filename = :filename, Description = '{\"Author\":\" " + author + "\", \"Abstract\": \"" + abstract + "\", \"Cover\": \"" + cover + "\"}' " + "WHERE FID = :fid"
        await database.execute(query, {"filename": filename, "fid": fid})
        
        return {
            "status_code": 200,
            "detail": "Modify success"
        }
        
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

@app.post("/findPath/{fid}")
async def file_search(request: fileInfo, fid: int):
    await database.execute("CREATE TABLE IF NOT EXISTS fileInfo (FID INTEGER PRIMARY KEY NOT NULL, Filename TEXT NOT NULL, Type TEXT NOT NULL, Description TEXT, FileAddress TEXT NOT NULL, UID INTEGER NOT NULL, FOREIGN KEY(UID) REFERENCES userInfo(UID))")
    email = request.email
    uid = request.uid
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    
    if loginAuth == email + uid:
        query = "SELECT FileAddress FROM fileInfo WHERE FID = :fid"
        file_path = await database.fetch_one(query, {"fid": fid})
        if file_path is not None:
            return {
                "status_code": 200,
                "path": file_path["FileAddress"].replace("./files", "/files")
            }
        else:
            return {
                "status_code": 400,
                "detail": "File not found"
            }
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }    
