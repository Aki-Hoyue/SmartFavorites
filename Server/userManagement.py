import os
import shutil
import uuid
from fastapi import FastAPI, File, Form, UploadFile, APIRouter
from databases import Database
from contextlib import asynccontextmanager
from pydantic import BaseModel
import hashlib
import base64

database = Database("sqlite:///SmartFavoritesDB.db")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

app = APIRouter(lifespan=lifespan, tags=["User Management"])

class newPassword(BaseModel):
    email: str
    uid: str
    password: str
    newpassword: str
    loginAuth: str

class userInfo(BaseModel):
    email: str
    uid: str
    loginAuth: str
    username: str

class avatarInfo(BaseModel):
    email: str
    uid: str
    loginAuth: str

@app.post("/changePassword")
async def register(request: newPassword):
    await database.execute("CREATE TABLE IF NOT EXISTS userInfo (UID INTEGER PRIMARY KEY NOT NULL, Username TEXT NOT NULL, Password TEXT NOT NULL, Email TEXT NOT NULL, Avatar TEXT NOT NULL)")
    email = request.email
    uid = request.uid
    password = request.password
    m = hashlib.md5()
    m.update(password.encode("utf-8"))
    password = m.hexdigest()
    m.update(request.newpassword.encode("utf-8"))
    newpassword = m.hexdigest()
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    
    if loginAuth == email + uid:
        query = "SELECT Password FROM userInfo WHERE Email = :email"
        databasePass = await database.fetch_one(query, {"email": email})
        if password == databasePass[0]:
            await database.execute("UPDATE userInfo SET Password = :newpassword WHERE UID = :uid", {"newpassword": newpassword, "uid": int(uid)})
            return {
                "status_code": 200,
                "detail": "Password changed"
            }
        else:
            return {
                "status_code": 401,
                "detail": "Password incorrect"
            }
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

@app.post("/changeUsername")
async def usernameChange(request: userInfo):
    await database.execute("CREATE TABLE IF NOT EXISTS userInfo (UID INTEGER PRIMARY KEY NOT NULL, Username TEXT NOT NULL, Password TEXT NOT NULL, Email TEXT NOT NULL, Avatar TEXT NOT NULL)")
    email = request.email
    uid = request.uid
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    username = request.username
    
    if loginAuth == email + uid:
        await database.execute("UPDATE userInfo SET Username = :username WHERE Email = :email", {"username": username, "email": email})
        
        return {
            "status_code": 200,
            "detail": "UserInfo changed"
        }
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }

@app.post("/changeAvatar")
async def avatarChange(email: str = Form(None), uid: str = Form(None), loginAuth: str = Form(...), avatar: UploadFile = File(None), avatar_url: str = Form(None)):
    await database.execute("CREATE TABLE IF NOT EXISTS userInfo (UID INTEGER PRIMARY KEY NOT NULL, Username TEXT NOT NULL, Password TEXT NOT NULL, Email TEXT NOT NULL, Avatar TEXT NOT NULL)")
    Auth = base64.b64decode(loginAuth).decode('utf-8')
    
    if Auth == email + uid:
        if avatar:
            avatar_type = os.path.splitext(avatar.filename)[1].replace(".", "")
            avatar_name = str(uuid.uuid4()) + "_" + uid + "." + avatar_type
            avatar_path = f"./avatars/{avatar_name}"
            print(avatar_path)
            os.makedirs(os.path.dirname(avatar_path), exist_ok=True)
            with open(avatar_path, "wb") as f:
                data = await avatar.read()
                f.write(data)
                shutil.copyfileobj(avatar.file, f)
            await database.execute("UPDATE userInfo SET Avatar = :avatar WHERE Email = :email", {"avatar": avatar_path, "email": email})
            return {
                "status_code": 200,
                "detail": "UserInfo changed",
                "path": avatar_path.replace("./", "/")
            }
        elif avatar_url:
            await database.execute("UPDATE userInfo SET Avatar = :avatar WHERE Email = :email", {"avatar": avatar_url, "email": email})
            return {
                "status_code": 200,
                "detail": "UserInfo changed",
                "path": avatar_url
            }
        elif not avatar and not avatar_url:
            return {
                "status_code": 400,
                "detail": "Empty avatar"
            }
        
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }
