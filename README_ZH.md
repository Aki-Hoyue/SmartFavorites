# SmartFavorites

<center><b>中文</b>    |   <a href="https://github.com/Aki-Hoyue/SmartFavorites/blob/main/README.md">English</a></center> 

一个整合智能AI语音交互的多格式文档管理系统。  

## 介绍

SmartFavorites是一个基于**React和FastAPI**技术开发的WEB应用程序，它融合了预训练的操作分类模型和在线大语言模型进行AI智能处理。此外，该系统还集成了多文档在线管理、文件预览、书籍搜索、OCR文本识别、TTS文本转语音等功能，为用户管理个人文件提供便捷。该项目适合小型团队或个人使用，可以轻松部署于NAS或私人服务器上。



## 特性

- **美观的页面**: 采用了[Reactstrap](https://reactstrap.github.io/)组件库设计响应式页面，支持PC和手机浏览使用。
- **在线阅读**：可以直接在SmartFavorites系统中阅读各种格式的文档，无需下载或使用外部软件。
- **书籍信息搜索**：通过在线书籍搜索功能，用户可以快速找到需要的书籍信息以及相关文档。
- **RSS订阅功能**：用户可以订阅相关RSS源，实时获取最新的文档或新闻。
- **用户信息管理**：提供用户管理功能，方便用户创建和管理个人账户，及其文档的访问和编辑权限。
- **在线OCR**：能够将扫描的文档或图片中的文字内容转换为电子文本，方便后续处理和阅读。
- **文档TTS（文本转语音）**：支持将文档内容转换为语音朗读，改善阅读体验，特别是对视力障碍人士非常友好。
- **语音助手功能**：通过AI驱动的语音助手，提升人机交互体验，使文档处理和操作更加高效便捷。



## 预览

主页：

<img src="https://image.hoyue.fun/imgup/2024/04/202405041834253.webp" style="zoom:50%;" />

星标：

<img src="https://image.hoyue.fun/imgup/2024/04/202405041834682.webp" style="zoom:50%;" />

详情页：

<img src="https://image.hoyue.fun/imgup/2024/04/202405041837990.webp" style="zoom:50%;"/>

书籍搜索：

<img src="https://image.hoyue.fun/imgup/2024/04/202405041843426.webp" style="zoom:50%;"/>

RSS：

<img src="https://image.hoyue.fun/imgup/2024/04/202405041844874.webp" style="zoom:50%;"/>

TTS：

<img src="https://image.hoyue.fun/imgup/2024/04/202405041847100.webp" style="zoom:50%;"/>

OCR：

<img src="https://image.hoyue.fun/imgup/2024/04/202405041847490.webp" style="zoom:50%;"/>

语音助手：

<img src="https://image.hoyue.fun/imgup/2024/04/202405041846663.webp" style="zoom:50%;"/>

## 使用

本项目为前后端分离项目，暂未将其整合，下面展示本地部署方法。

请保证具有如下本地环境：

* Node.js >= 10.2.4
* Python >= 3.11
* Uvicorn Server

通过Git Clone或下载源代码的方式将本项目克隆到本地目录中：

```bash
git clone https://github.com/Aki-Hoyue/SmartFavorites.git
```

在本地目录中，进入前端文件夹(`/frontend`)，安装必要组件库：

```bash
cd ./frontend
npm install
```

进入后端文件夹(`/Server`)，安装后端必要的库：

```bash
cd ./Server
pip install -r requirements.txt
```

**请修改大语言模型Google-Gemini的调用API，项目中的API只是演示，已过期。获取方法请参考搜索引擎。**

在后端文件夹中，因为Github仓库大小限制，缺少预训练的模型文件和语音识别模型，可以通过下面的链接进行下载，也可以通过`/train`文件夹中的Jupyter Notebook自行训练。

* classifier.pth: [https://www.mediafire.com/file/gbku7iwhvezrrwx/classifier.pth/file](https://www.mediafire.com/file/gbku7iwhvezrrwx/classifier.pth/file)
* medium.pt: [https://openaipublic.azureedge.net/main/whisper/models/345ae4da62f9b3d59415adc60127b97c714f32e89e936602e85993674d08dcb1/medium.pt](https://openaipublic.azureedge.net/main/whisper/models/345ae4da62f9b3d59415adc60127b97c714f32e89e936602e85993674d08dcb1/medium.pt)

安装结束后，若在生产环境中，请修改代码中对应后端地址后在前端文件夹中打包部署：

```bash
cd ./frontend
npm run build
```

若在本地环境中简单展示，可以进入dev模式：

```bash
npm start
```

后端可以通过修改`main.py`中的`main`函数部分，实现运行`main.py`启动后端，也可以通过如下命令启动：

```bash
cd ./Server
uvicorn main:app --host "0.0.0.0" --port 8000 --reload
```

Enjoy~  



## 文档

本项目基于MIT License，欢迎二次开发，详细的开发文档说明请看document文件夹。

中文开发文档：[https://github.com/Aki-Hoyue/SmartFavorites/blob/main/documents/development_zh.md](https://github.com/Aki-Hoyue/SmartFavorites/blob/main/documents/development_zh.md)

英文开发文档：[https://github.com/Aki-Hoyue/SmartFavorites/blob/main/documents/development.md](https://github.com/Aki-Hoyue/SmartFavorites/blob/main/documents/development.md)



## Q&A

> Q: 为什么书籍信息无法搜索？

书籍信息搜索通过豆瓣API，因为服务器连接和其他不可抗力原因，该搜索不一定有效。如果你有一定的编码能力，可以修改后端`/Server/search.py`文件的搜索逻辑，更换为其他可用书籍搜索服务。  

> Q：为什么语音助手不能精确反馈我的要求？

在后端`/Server/voiceassistant.py`中，设计了向大语言模型提供的Prompt，你可以修改它让它变得更加精准，同时也可以自己训练分类模型，请见`/train`文件夹中的Jupyter Notebook。

> Q: 为什么生成环境中RSS获取失败？

也许因为服务器防火墙限制等，RSS Feedparser无法获取到正确的XML内容，建议检查服务器网络设置和链接的可行性。  

其他问题欢迎在[Issue](https://github.com/Aki-Hoyue/SmartFavorites/issues)中提出。



## 贡献

主要开发工程师：

<a href="https://github.com/Aki-Hoyue"><img src="https://avatars3.githubusercontent.com/u/73027485?s=400" alt="Hoyue" width="100">Hoyue</a>

<a href="https://github.com/0216Feng"><img src="https://avatars3.githubusercontent.com/u/90129509?s=400" alt="Ukenn" width="100">0216Feng</a>

<a href="https://github.com/LiangPeng03"><img src="https://avatars2.githubusercontent.com/u/150891126?s=400" alt="bymoye" width="100">LiangPeng03</a>

