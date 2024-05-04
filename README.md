# SmartFavorites

<center><b>English</b>    |   <a href="https://github.com/Aki-Hoyue/SmartFavorites/blob/main/README_ZH.md">中文</a></center> 

An integrated multi-format document management system with smart AI voice interaction.

## Introduction

SmartFavorites is a web application developed with **React and FastAPI**, blending pre-trained operational classification models and large online language models for AI-powered processing. Additionally, this system integrates functionalities such as multi-document online management, file preview, book search, OCR text recognition, and TTS (text to speech) for a convenient personal file management experience. Suitable for small teams or individual use, it can be easily deployed on NAS or private servers.

## Features

- **Attractive Interface**: Designed with the [Reactstrap](https://reactstrap.github.io/) component library to create responsive pages, supporting browsing on PCs and mobile devices.
- **Online Reading**: Allows reading of documents in various formats directly within the SmartFavorites system, eliminating the need for downloading or using external software.
- **Book Information Search**: Users can quickly locate necessary book information and related documents through an online search feature.
- **RSS Subscriptions**: Users can subscribe to related RSS feeds to receive the latest documents or news in real time.
- **User Information Management**: Offers user management functionality, making it easy for users to create and manage personal accounts along with their document access and editing privileges.
- **Online OCR**: Capable of converting text content in scanned documents or images into electronic text for easy processing and reading.
- **Document TTS (Text to Speech)**: Converts document content into spoken words, enhancing the reading experience, especially beneficial for individuals with visual impairments.
- **Voice Assistant**: Boosts human-machine interaction experience through AI-driven voice assistant technology, making document handling and operations more efficient and convenient.

## Preview

Homepage:

![Homepage Preview](https://image.hoyue.fun/imgup/2024/04/202405041834253.webp)

Starred Items:

![Starred Items](https://image.hoyue.fun/imgup/2024/04/202405041834682.webp)

Detail Page:

![Detail Page](https://image.hoyue.fun/imgup/2024/04/202405041837990.webp)

Book Search:

![Book Search](https://image.hoyue.fun/imgup/2024/04/202405041843426.webp)

RSS:

![RSS](https://image.hoyue.fun/imgup/2024/04/202405041844874.webp)

TTS:

<img src="https://image.hoyue.fun/imgup/2024/04/202405041847100.webp" alt="TTS" style="zoom:50%;" />

OCR:

<img src="https://image.hoyue.fun/imgup/2024/04/202405041847490.webp" alt="OCR" style="zoom: 50%;" />

Voice Assistant:

![Voice Assistant](https://image.hoyue.fun/imgup/2024/04/202405041846663.webp)

## Deployment

This project is developed with a separation between the frontend and backend, and is yet to be integrated. Below is a guide for local deployment.

Ensure the following local environment setup:

* Node.js >= 10.2.4
* Python >= 3.11
* Uvicorn Server

Clone the project to your local directory via Git Clone or by downloading the source code:

```bash
git clone https://github.com/Aki-Hoyue/SmartFavorites.git
```

In the local directory, enter the frontend folder (`/frontend`) and install the necessary components:

```bash
cd ./frontend
npm install
```

Enter the backend folder (`/Server`) and install the required libraries:

```bash
cd ./Server
pip install -r requirements.txt
```

**Please replace the Google-Gemini large language model API. The API included in the project is for demonstration purposes and has expired. For acquisition methods, please refer to search engines.**

Due to the limitations of the size of GitHub repositories, the backend folder lacks pretrained models and speech recognition models. They can be downloaded from the following links or you can train them yourself using Jupyter Notebooks in the `/train` folder.

- classifier.pth: [Download Link](https://www.mediafire.com/file/gbku7iwhvezrrwx/classifier.pth/file)
- medium.pt: [Download Link](https://openaipublic.azureedge.net/main/whisper/models/345ae4da62f9b3d59415adc60127b97c714f32e89e936602e85993674d08dcb1/medium.pt)

After installation, for production environments, modify the corresponding backend address in the frontend folder and then build for deployment:

```bash
cd ./frontend
npm run build
```

For a simple display in the local environment, enter dev mode:

```bash
npm start
```

The backend can be started by modifying the `main` function in `main.py`, or using the following command:

```bash
cd ./Server
uvicorn main:app --host "0.0.0.0" --port 8000 --reload
```

Enjoy~

## Documentation

This project is based on the MIT License, and further development is welcomed. For detailed development documentation, please see the document folder.

Development documentation in English: https://github.com/Aki-Hoyue/SmartFavorites/blob/main/documents/development.md
Development documentation in 中文: https://github.com/Aki-Hoyue/SmartFavorites/blob/main/documents/development_zh.md

## Q&A

> Q: Why can't book information be searched?

Book information search utilizes the Douban API. Due to server connections and other force majeure reasons, the search may not always be effective. If you have coding skills, you can modify the search logic in the backend file `/Server/search.py` to switch to another book search service.

> Q: Why doesn't the voice assistant accurately reflect my requirements?

In the backend file `/Server/voiceassistant.py`, prompts provided to the large language model are designed. You can modify them to make the feedback more precise. You can also train your classification models by referring to the Jupyter Notebooks in the `/train` folder.

> Q: Why does RSS retrieval fail in the production environment?

Possibly due to server firewall restrictions or other issues, the RSS Feedparser might not be able to retrieve the correct XML content. It's advisable to check the server's network settings and the feasibility of the links.

For other questions, feel free to raise them in [Issues](https://github.com/Aki-Hoyue/SmartFavorites/issues).

## Contribution

Main Developers:

<a href="https://github.com/Aki-Hoyue"><img src="https://avatars3.githubusercontent.com/u/73027485?s=400" alt="Hoyue" width="100">Hoyue</a>

<a href="https://github.com/0216Feng"><img src="https://avatars3.githubusercontent.com/u/90129509?s=400" alt="Ukenn" width="100">0216Feng</a>

<a href="https://github.com/LiangPeng03"><img src="https://avatars2.githubusercontent.com/u/150891126?s=400" alt="bymoye" width="100">LiangPeng03</a>
