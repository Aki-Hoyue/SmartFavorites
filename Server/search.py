from fastapi import FastAPI, APIRouter
import requests
import base64
from pydantic import BaseModel
import re
from bs4 import BeautifulSoup
import random
from lxml import html

data = []

url_base = "https://www.douban.com/search?cat=1001&q="

USERAGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36"

def getProxies():
    # Target URLs to scrape proxy IPs from
    target_urls = [
        "http://www.kxdaili.com/dailiip.html",
        "http://www.kxdaili.com/dailiip/2/1.html"
    ]
    proxy_ip_pool = []  # Initialize an empty list to store the proxy IPs
    
    # Scrape the proxy IPs from the target URLs
    for url in target_urls:
        response = requests.get(url)
        if response.status_code == 200:
            # Parse the HTML response
            tree = html.fromstring(response.content)
            rows = tree.xpath("//table[@class='active']//tr")[1:]
            for tr in rows:
                ip = "".join(tr.xpath('./td[1]/text()')).strip()
                port = "".join(tr.xpath('./td[2]/text()')).strip()
                proxy_ip = f"{ip}:{port}"
                proxy_ip_pool.append(proxy_ip)  # Append each proxy IP to the list
                yield proxy_ip  # Yield the proxy IP as well
    return proxy_ip_pool  # Return the complete proxy IP pool list

proxies = list(getProxies())

async def getBookList(title):
    
    respone = requests.get(url=url_base + title, headers={"User-Agent": USERAGENT})

    soup = BeautifulSoup(respone.text, "lxml")
    
    book_list = soup.find_all("div", attrs={"class": "result"})

    for book in book_list:
        onclick = book.find("a").get("onclick")
        sid = re.search(r"sid: (\d+)", onclick).group(1)
        result = await getBookDetail(sid)
        if result["status_code"] == 200:
            data.append(result)

    return data
        
    
async def getBookDetail(sid, proxies=proxies):
    selected_proxy = random.choice(proxies)
    proxies = {
        'http': f'http://{selected_proxy}'
    }
    book_url = "https://book.douban.com/subject/" + sid + "/"
    respone = requests.get(url=book_url, headers={
        "Host": "book.douban.com",
        "User-Agent": USERAGENT,
        'cookie': 'll="108306"; bid=bHbeAX3wRsY; douban-fav-remind=1; ap_v=0,6.0; viewed="35003286_10507697_1455933_36532377"'
    }, proxies=proxies)
    if respone.status_code != 200:
        return {
            "status_code": respone.status_code,
            "detail": "Book not found"
        }
    soup = BeautifulSoup(respone.text, "lxml")
    try:
        title = soup.find("meta", attrs={"property": "og:title"}).get("content")
        image = soup.find("meta", attrs={"property": "og:image"}).get("content").replace("/l/", "/s/")
        detail = soup.find("meta", attrs={"property": "og:url"}).get("content")
        author = soup.find("a", attrs={"href": re.compile("author")}).get_text().replace("\n", "").replace(" ", "")
        abstract = soup.find("meta", attrs={"property": "og:description"}).get("content").replace("\n", "").replace(" ", "")
        
        image = image.replace("https://img", "https://dcover.hoyue.eu.org/img").replace(".doubanio.com", "")
        
    except Exception as e:
        return {
            "status_code": 500,
            "detail": "Error, server busy and try again later",
            "sid": sid
        }
    
    return {
        "status_code": 200,
        "title": title,
        "image": image,
        "author": author,
        "abstract": abstract,
        "detail": detail
    }

app = APIRouter(tags=["Search"])

class searchInfo(BaseModel):
    keyword: str
    email: str
    uid: str
    loginAuth: str

@app.post("/search")
async def search_books(request: searchInfo):
    keyword = request.keyword
    email = request.email
    uid = request.uid
    loginAuth = request.loginAuth
    loginAuth = base64.b64decode(loginAuth).decode('utf-8')
    
    if loginAuth == email + uid:
        bookInfo = await getBookList(keyword)
        return bookInfo
    else:
        return {
            "status_code": 401,
            "detail": "User not logined",
            "loginAuth": loginAuth,
            "email": email
        }
