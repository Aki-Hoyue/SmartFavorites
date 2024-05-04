# SmartFavorites Development Documentation

This document is primarily intended for developers, and users who wish to modify the code or customize functions in SmartFavorites.

## Frontend

The frontend framework utilized by this program is React. For frontend developers, familiarity with the React framework and basic JavaScript is sufficient for development. Below is the basic structure of the frontend planning program:

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
In `Page`, the file name corresponds to its function, which is quite self-explanatory. The components and styles used in the frontend can be referred to from: [https://dashlite.net/demo4/components.html](https://dashlite.net/demo4/components.html) and the [Reactstrap](https://reactstrap.github.io/) component library.

## Backend

The backend is written with Python's FastAPI, and a simple understanding of Python is enough to comprehend it. FastAPI incorporates API documentation, which you can view at `http://backend/docs` for backend API information.

The database uses a simple SQLite. In the production environment, it is recommended to switch to MySQL or PostgreSQL. Below is the database schema (with the leftmost column as the primary key):

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

* A special note on `voiceassistant.py`: The `PROMPT` and `GETFILENAME` constants define two system prompts that can be adjusted and set according to your needs. The `GOOGLE_API` key is obtained from Google Gemini and the KEY **has expired** within the current project.

## Deployment

> Deployment Requirements:
>
> The frontend can be arbitrary.
>
> Since the backend involves model computations, etc., there are certain requirements for server configuration. Below are the recommended specifications. Lower configurations should be self-tested.
>
> * CPU: At least 2 vCPU (dual-core), single-core can be tried if the CPU configuration is higher.
> * Memory: >=2G
> * Disk space: >=20G

The frontend is packaged using npm commands, and the contents of the build folder are deployed on the server side. For example, deploying with [aaPanel](https://www.aapanel.com/new/index.html):

<img src="https://image.hoyue.fun/imgup/2024/04/202405042211799.webp"/>

Make sure to check if the index file in the build is empty.

Additionally, the frontend pages can be directly forked on GitHub and deployed on services like Vercel. For details, please refer to [Vercel Tutorial](https://vercel.com/docs).

Due to file uploads and modifications, backend deployment on services without file management permissions such as Vercel is not recommended unless the file storage logic is modified for cloud storage. Below is an example of backend deployment with aaPanel:

First, upload all contents of the Server folder and the model files, modify the commented part in main.py, and add the main function:

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
```

In the website - Python projects - Add Python project section, fill in the file location uploaded to the server and the run file. Note, if you have enabled aaPanel protection, you need to allow the running port. Choose Python for the framework, gunicorn for the run method, asgi for the network protocol, and `requirements.txt` file in the directory for the dependency package.

<img src="https://image.hoyue.fun/imgup/2024/04/202405042230818.webp"/>

After a while of waiting for the deployment of the virtual environment, please check in the modules if the required modules have been added. If not, install them in the virtual environment:

```bash
pip3 install -r requirements.txt
```
You need to change the start method in the settings-run configuration of the project to:

```nginx
worker_class = 'uvicorn.workers.UvicornWorker'
```

Finally, add a domain in domain management and click on external network mapping to access the backend from the external network. Start the project to proceed.

<img src="https://image.hoyue.fun/imgup/2024/04/202405042234455.webp"/>

## Troubleshooting

> During deployment, aaPanel continuously shows that the environment is being deployed.

Please try restarting the panel, then delete the project and redeploy. There have been some issues with Python project deployment in aaPanel, which can be reported to the aaPanel community for assistance.

For other error messages, please check the aaPanel log or the program runtime log.
