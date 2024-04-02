from fastapi import FastAPI
from databases import Database
from contextlib import asynccontextmanager
from pydantic import BaseModel
import hashlib
import base64

database = Database("sqlite:///test.db")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

app = FastAPI(lifespan=lifespan)

class newPassword(BaseModel):
    email: str
    password: str
    newpassword: str
    loginAuth: str

class userInfo(BaseModel):
    email: str
    loginAuth: str
    avatar: str

@app.post("/forgetPassword")
async def register(request: newPassword):
    await database.execute("CREATE TABLE IF NOT EXISTS userInfo (UID INTEGER PRIMARY KEY NOT NULL, Username TEXT NOT NULL, Password TEXT NOT NULL, Email TEXT NOT NULL, Avatar TEXT NOT NULL)")
    email = request.email
    password = request.password
    m = hashlib.md5()
    m.update(password.encode("utf-8"))
    password = m.hexdigest()
    m.update(request.newpassword.encode("utf-8"))
    newpassword = m.hexdigest()
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth)
    
    if loginAuth == email:
        query = "SELECT Password FROM userInfo WHERE Email = :email"
        databasePass = await database.fetch_one(query, {"email": email})
        if password == databasePass[0]:
            await database.execute("UPDATE userInfo SET Password = :newpassword WHERE Email = :email", {"newpassword": newpassword, "email": email})
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

@app.post("/avatarChange")
async def avatarChange(request: userInfo):
    await database.execute("CREATE TABLE IF NOT EXISTS userInfo (UID INTEGER PRIMARY KEY NOT NULL, Username TEXT NOT NULL, Password TEXT NOT NULL, Email TEXT NOT NULL, Avatar TEXT NOT NULL)")
    email = request.email
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth)
    avatar = request.avatar
    if loginAuth == email:
        await database.execute("UPDATE userInfo SET Avatar = :avatar WHERE Email = :email", {"avatar": avatar, "email": email})
        return {
            "status_code": 200,
            "detail": "Avatar changed"
        }
    else:
        return {
            "status_code": 401,
            "detail": "User not logined"
        }
