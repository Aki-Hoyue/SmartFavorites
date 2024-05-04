# SmartFavorites 开发文档

本文档主要面向开发者，和SmartFavorites进行代码修改和自定义功能的用户。

## 前端

本程序使用的前端框架为React，对于前端开发者，熟悉React框架和基本JavaScript即可进行开发。下面是前端策划程序的基本结构：

```
|─public
│      .htaccess
│      favicon.png
│      index.html
│      logo192.png
│      manifest.json
│      robots.txt
│      SmartFavorites_icon.png
│
└─src
    │  App.js
    │  App.test.js
    │  index.js
    │  logo.svg
    │  reportWebVitals.js
    │  setupTests.js
    │
    ├─assets // Some assets
    ├─components  // Some styles
    ├─images  // Some images
    ├─layout  // Layout design
    ├─pages
    │  │  Data.js
    │  │  Files.js
    │  │  Home.js
    │  │  Preview.js
    │  │  RSS.js
    │  │  Search.js
    │  │  Settings.js
    │  │  Starred.js
    │  │
    │  ├─auth
    │  │      AuthFooter.js
    │  │      ForgotPassword.js
    │  │      Login.js
    │  │      Register.js
    │  │      Success.js
    │  │
    │  ├─components
    │  │      Aside.js
    │  │      Body.js
    │  │      ConfirmDeleteDialog.js
    │  │      Context.js
    │  │      FileCard.js
    │  │      Files.js
    │  │      Icons.js
    │  │      Layout.js
    │  │      QuickAccess.js
    │  │      Toast.js
    │  │      ViewFilter.js
    │  │      VoiceAssistant.js
    │  │
    │  ├─error
    │  │      404.js
    │  │
    │  ├─modals
    │  │      Details.js
    │  │      OCR.js
    │  │      TTSModal.js
    │  │      UpdateAvatar.js
    │  │      Upload.js
    │  │
    │  └─views
    │          AllFiles.js
    │          Home.js
    │          Render.js
    │          RSS.js
    │          Search.js
    │          Settings.js
    │          Starred.js
    │
    ├─route
    │      Index.js
    │
    └─utils
            Utils.js
```

在`Page`中，文件名即功能，还是比较好理解的。前端中使用到的组件样式可以参考：[https://dashlite.net/demo4/components.html](https://dashlite.net/demo4/components.html)和[Reactstrap](https://reactstrap.github.io/)组件库。



## 后端

后端基于Python的FastAPI编写，只需要简单的Python基础就可以看懂。FastAPI集成了API文档，你可以在`http://backend/docs`中查看后端API信息。

数据库采用了简单的SQLlite，在生产环境中建议改为Mysql或PostgreSQL，下面是数据库定义(左侧第一个为主码)：

**userInfo**

| UID  | Username | Password | Email | Avatar |
| :--: | :------: | :------: | :---: | :----: |
| INT  |   TEXT   |   TEXT   | TEXT  |  TEXT  |

**fileInfo**

| FID  | File Name | Type | Description | File Address |
| :--: | :-------: | :--: | :---------: | :----------: |
| INT  |   TEXT    | TEXT |    TEXT     |     TEXT     |

**rssContent**

| Title | Link | Published(seconds from 1970-01-01 00:00:00 UTC) | URLID |   UID   |
| :---: | :--: | :---------------------------------------------: | :---: | :-----: |
| TEXT  | TEXT |                     INTEGER                     | TEXT  | INTEGER |

**rssList**

| URLID | Name | Link |   UID   |
| :---: | :--: | :--: | :-----: |
|  INT  | TEXT | TEXT | INTEGER |

* 特别说明`voiceassistant.py`：`PROMPT`和`GETFILENAME`常量规定了两个系统Prompt可以自行调整设定的功能和要求。`GOOGLE_API`申请至Google Gemini，目前项目内置的KEY**已经失效**。



## 部署

> 部署要求：
>
> 前端随意
>
> 后端因为涉及模型计算等，所需要的服务器配置有一定要求，下面是推荐的配置，更低的配置建议自行检查。
>
> * CPU: 至少2个vCPU（双核），在CPU配置高的情况下可以试试单核。
> * 内存：>=2G
> * 硬盘：>=20G

前端通过npm命令打包，将打包好的build文件夹中的内容在服务器端部署即可，例如在宝塔面板中部署：

<img src="https://image.hoyue.fun/imgup/2024/04/202405042211799.webp"/>

注意检查build中的index文件是否为空。

此外前端页面也可以在github中直接fork，在Vercel等服务中部署，具体请见[Vercel教程](https://vercel.com/docs)。

后端因为涉及文件上传与修改，不建议在Vercel等无文件管理权限的服务中部署，除非修改文件存储逻辑为云端存储。下面是后端在宝塔面板中部署的示例：

首先上传Server文件夹中的所有内容和模型文件，修改main.py中注释的部分，添加main函数：

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
```

在网站 - Python项目 - 添加Python项目中，填写上传到服务器中的文件位置和运行文件。注意，如果开启了宝塔防护，运行端口需要放行。框架请选择Python，运行方式选择gunicorn，网络协议选择asgi，依赖包选择目录下的`requirements.txt`文件。

<img src="https://image.hoyue.fun/imgup/2024/04/202405042230818.webp"/>

等待一段时间的虚拟环境部署后，请检查模块中是否添加了所需的模块，如果没有的话请到虚拟环境中安装：

```bash
pip3 install -r requirements.txt
```

需要在该项目的设置-运行配置中的启动方式改成：

```nginx
worker_class = 'uvicorn.workers.UvicornWorker'
```

最后在域名管理中添加域名，点击外网映射后即可在外网访问后端。启动项目即可。

<img src="https://image.hoyue.fun/imgup/2024/04/202405042234455.webp"/>



## 问题排查

> 部署中宝塔一直显示环境部署中。

请尝试重启面板后，删除该项目并重新部署。宝塔中Python项目的部署一直存在一些问题，可以向宝塔社区反馈。

其他报错信息请查看宝塔日记或程序运行日记。

