from fastapi import FastAPI, APIRouter
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

app = APIRouter(lifespan=lifespan, tags=["User Management"])

class loginInfo(BaseModel):
    email: str
    password: str
    
class registerInfo(BaseModel):
    username: str
    email: str
    password: str

@app.post("/login")
async def login(request: loginInfo):
    email = request.email
    password = request.password
    m = hashlib.md5()
    m.update(password.encode("utf-8"))
    password = m.hexdigest()
    
    await database.execute("CREATE TABLE IF NOT EXISTS userInfo (UID INTEGER PRIMARY KEY NOT NULL, Username TEXT NOT NULL, Password TEXT NOT NULL, Email TEXT NOT NULL, Avatar Text NOT NULL)")
    query = "SELECT Password FROM userInfo WHERE Email = :email"
    databasePass = await database.fetch_one(query, {"email": email})
    uid = await database.fetch_val("SELECT UID FROM userInfo WHERE Email = :email", {"email": email})
    username = await database.fetch_val("SELECT Username FROM userInfo WHERE Email = :email", {"email": email})
    avatar = await database.fetch_val("SELECT Avatar FROM userInfo WHERE Email = :email", {"email": email})
    
    if databasePass is None:
        return {
            "status_code": 401,
            "detail": "User not found"
        }
    elif password != databasePass[0]:
        return {
            "status_code": 401,
            "detail": "Password incorrect"
        }
    else:
        loginAuth = base64.b64encode((email + str(uid)).encode("utf-8"))
        return {
            "status_code": 200,
            "detail": "Login success",
            "email": email,
            "uid": uid,
            "username": username,
            "auth": loginAuth,
            "avatar": avatar
        }
    

@app.post("/register")
async def register(request: registerInfo):
    await database.execute("CREATE TABLE IF NOT EXISTS userInfo (UID INTEGER PRIMARY KEY NOT NULL, Username TEXT NOT NULL, Password TEXT NOT NULL, Email TEXT NOT NULL, Avatar TEXT NOT NULL)")
    username = request.username
    email = request.email
    password = request.password
    m = hashlib.md5()
    m.update(password.encode("utf-8"))
    password = m.hexdigest()
    
    query = "SELECT * FROM userInfo WHERE Email = :email"
    if await database.fetch_one(query, {"email": email}) is not None:
        return {
            "status_code": 400,
            "detail": "Email already exists"
        }
    else:
        query = "SELECT MAX(UID) + 1 FROM userInfo"
        result = await database.fetch_one(query)
        uid = result[0] if result[0] is not None else 1
        await database.execute("INSERT INTO userInfo VALUES (:UID, :Username, :Password, :Email, :Avatar)", {
            "UID": uid,
            "Username": username,
            "Password": password,
            "Email": email,
            "Avatar": "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        })
        return {
            "status_code": 200,
            "detail": "Register success"
        }
