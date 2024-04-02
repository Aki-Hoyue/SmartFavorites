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

class loginInfo(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(request: loginInfo):
    email = request.email
    password = request.password
    m = hashlib.md5()
    m.update(password.encode("utf-8"))
    password = m.hexdigest()
    loginAuth = base64.b64encode(email.encode("utf-8"))
    
    await database.execute("CREATE TABLE IF NOT EXISTS userInfo (UID INTEGER PRIMARY KEY NOT NULL, Username TEXT NOT NULL, Password TEXT NOT NULL, Email TEXT NOT NULL, Avatar Text NOT NULL)")
    query = "SELECT Password FROM userInfo WHERE Email = :email"
    databasePass = await database.fetch_one(query, {"email": email})
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
        return {
            "status_code": 200,
            "detail": "Login success",
            "auth": loginAuth
        }
    
