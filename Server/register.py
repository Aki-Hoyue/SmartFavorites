from fastapi import FastAPI
from databases import Database
from contextlib import asynccontextmanager
from pydantic import BaseModel
import hashlib
from starlette.middleware.cors import CORSMiddleware

database = Database("sqlite:///test.db")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

app = FastAPI(lifespan=lifespan)

# 配置允许的跨域请求来源
origins = [
    "http://localhost",
    "http://localhost:3000",
]

# 添加跨域中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class registerInfo(BaseModel):
    username: str
    email: str
    password: str

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
