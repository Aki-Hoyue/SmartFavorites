# Backend Development Document

> Author: Hoyue
>
> Framework: FastAPI
>
> Last Update: 2024/04/15

## User Management

### Login

Method: **POST**

Path: `/files`

Description: Endpoint for user login.

Parameters:

* request (loginInfo): The login request containing email and password.

Returns:

* dict: A dictionary containing the login status code, details, user ID, and authentication token.

Details: After successful login LoginAuth is encrypted with the user's email and uid and returned to the user for login status verification.

Return Examples:

```json
// success
{
    "status_code": 200,
    "detail": "Login success",
    "email": "test@test.com",
    "uid": 1,
    "username": "test",
    "auth": "dGVzdEB0ZXN0LmNvbTE=",
    "avatar": "https://cdn-icons-png.flaticon.com/512/149/149071.png"
}

// user not found
{
    "status_code": 401,
    "detail": "User not found"
}

// password error
{
    "status_code": 401,
    "detail": "Password incorrect"
}
```



### Register

Method: **POST**

Path: `/register`

Description: Register a new user.

Parameters:

* request (registerInfo): The registration information provided by the user.

Returns:

* dict: A dictionary containing the status code and a detail message.

Return Examples:

```json
// success
{
    "status_code": 200,
    "detail": "Register success"
}

// email exists
{
    "status_code": 400,
    "detail": "Email already exists"
}
```



### Change password

Method: **POST**

Path: `/changePassword`

Description: Endpoint for changing user's password.

Parameters: 

* request (newPassword): The request object containing the new password and other necessary information.

Returns:

* dict: A dictionary containing the status code and a detail message.

Return Examples:

```json
// success
{
    "status_code": 200,
    "detail": "Password changed"
}

// change error
{
    "status_code": 401,
    "detail": "Password incorrect"
}

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



### User infomation change

Method: **POST**

Path: `/userInfoChange`

Description: Endpoint for changing user's password.Change the avatar and username of a user in the userInfo table.

Parameters:
   - request: userInfo - User information object containing email, uid, and loginAuth.
   - username: str - New username for the user.
   - avatar: UploadFile - New avatar image file.

Returns:
    - dict: Dictionary containing the status code and detail message.

Return Examples:

```json
// success
{
    "status_code": 200,
    "detail": "UserInfo changed"
}

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



## File Operation

### Retrieve files

Method: **GET**

Path: `/files`

Description: Retrieve files associated with a user.

Parameters:

* email (str): The email of the user.
* uid (str): The unique identifier of the user.
* loginAuth (str): The login authentication token.

Returns:

* dict: A dictionary containing the status code and data.

  * If the authentication is successful, the status code is 200 and the data contains the retrieved files.

  * If the authentication fails, the status code is 401 and the detail indicates that the user is not logged in.

Return Examples:

```json
// success
{
    "status_code": 200,
    "data": {
    	"FID": 10,
        "Filename": "title",
        "Type": "pdf",
        "FileAddress": "/files/test.pdf"
        "UID": 1
    }
}

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



### Upload files

Method: **POST**

Path: `/upload`

Description: Uploads a file to the server and saves its information in the database.

Parameters:
- email (str): The email of the user.
- uid (str): The user ID.
- loginAuth (str): The login authentication.
- file (UploadFile): The file to be uploaded.

Returns:
* dict: A dictionary containing the status code, file ID, and file path.

Return Examples:

```json
// success
{
    "status_code": 200,
    "fid": 10,
    "file_path": "/files/upload_test.pdf"
}

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



### Delete files

Method: **POST**

Path: `/delete`

Description: Delete a file from the fileInfo table.

Parameters:

- request (fileInfo): The request object containing information about the file.
- fid (int): The ID of the file to be deleted.

Returns:

- dict: A dictionary containing the status code and details of the delete operation.

Return Examples:

```json
// success
{
    "status_code": 200,
    "detail": "Delete success"
}

// file not found
{
    "status_code": 400,
    "detail": "File not found",
    "filepath": "/files/test.pdf"
}

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



### Modify files' attribute

Method: **POST**

Path: `/modifyFiles`

Description: Modify files in the fileInfo table.

Parameters:

- request (fileInfo): The request object containing email, uid, and loginAuth.
- fid (int): The file ID.
- filename (str, optional): The new filename. Defaults to "".
- description (str, optional): The new description. Defaults to "".

Returns:

- dict: A dictionary containing the status code of the operation.

Return Examples:

```json
// success
{
    "status_code": 200
}

// error
{
    "status_code": 400,
    "detail": "Modify error"
}

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



### Files local search

Method: **POST**

Path: `/fileSearch`

Description: Search for files in the local database based on a keyword.

Parameters:

- request (fileInfo): The request object containing user information.
- keyword (str): The keyword to search for in the file names and descriptions.

Returns:

- dict: A dictionary containing the search results or an error message.

Return Examples:

```json
// success
{
    "status_code": 200,
    "data": {
    	"FID": 10,
        "Filename": "title",
        "Type": "pdf",
        "FileAddress": "/files/test.pdf"
        "UID": 1
    }
}

// file not found
{
    "status_code": 400,
    "detail": "File not found"
}

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



## Book searching

Method: **POST**

Path: `/search`

Description: Search for books based on the provided keyword.

Parameters:

* request (searchInfo): The search request containing the keyword, email, uid, and loginAuth.

Returns:
* list: A list of dictionaries representing the books found. Each dictionary contains the following keys:

  - title: The title of the book.

  - subtitle: The subtitle of the book.

  - author: The author of the book.

  - abstract: The abstract of the book.

  - cover: The cover image URL of the book.

  - id: The ID of the book.


Returned:
- status_code: The status code indicating unauthorized access (401).
- detail: A message indicating that the user is not logged in.
- loginAuth: The provided loginAuth.
- email: The provided email.

Return Examples:

```json
// success
[
  {
    "title": "活着",
    "subtitle": "",
    "author": "余华",
    "abstract": "《活着》讲述了农村人福贵悲惨的人生遭遇。福贵本是个阔少爷，可他嗜赌如命，终于赌光了家业，一贫如洗。他的父亲被他活活气死，母亲则在穷困中患了重病，福贵前去求药，却…",
    "cover": "https://pic.arkread.com/cover/ebook/f/30541512.1653661839.jpg!cover_default.jpg",
    "id": "30541512"
  }...
]

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



## TTS

Method: **POST**

Path: `/process_tts`

Description: Process the text-to-speech request.

Parameters:

- request (str): The text to be converted to speech.
- voice (str): The voice to be used for the speech synthesis.
- email (str): The user's email.
- uid (int): The user's ID.
- loginAuth (str): The login authentication token.

Returns:

- If the authentication is successful, it returns the text-to-speech output.
- If the authentication fails, it returns a dictionary with the status code and detail message.

Return Examples:

```json
// success
[
  "status": "success",
  "file_path": "/tts_files/test.mp3"
]

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



## RSS

Method: **GET**

Path: `/rss`

Description: Get RSS feed and stores the articles in a database.

Parameters:

- feed_url (str): The URL of the RSS feed.
- urlid (int): The ID of the URL.
- email (str): The email of the user.
- uid (int): The ID of the user.
- loginAuth (str): The login authentication string.

Returns:

* Title (str): RSS feed ariticle titles.
* Link (str): Ariticle links.
* Published (int): Ariticle published time.
* UID (int): RSS URL ID.

Return Examples:

```json
// success
[
  {
    "Title": "xxx",
    "Link": "https://xxx/xxx.html",
    "Published": 1712936775,
    "UID": 1
  }...
]

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



## OCR

Method: **POST**

Path: `/ocr`

Description: Process OCR on a PDF file.

Parameters:

- email (str): The user's email.
- uid (str): The user's unique ID.
- loginAuth (str): The login authentication token.
- languages (str): The languages to be used for OCR.
- file (UploadFile): The PDF file to be processed.

Returns:

* StreamingResponse: The response containing the processed file.

Return Examples:

```json
// success
{
    StreamingResponse: file,
    header
}

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```



## Voice assistant

Method: **POST**

Path: `/voice`

Description: Endpoint for processing voice input and generating a response.

Parameters:

- email (str): The user's email.
- uid (str): The user's unique ID.
- loginAuth (str): The login authentication token.
- voice (UploadFile): The voice file to be processed.

Returns:
- dict: A dictionary containing the response information, including the status code, operation, text, and voice file path.

  - status_code (int): The HTTP status code.

  - operation (str): The operation performed based on the voice input.

  - text (str): The generated text response.

  - voice (str): The file path of the generated voice response.

Return Examples:

```json
// success
{
    "status_code": 200,
    "operation": "open a file",
    "text": "OK, I will open the file test.md",
    "voice": "/files/voice.mp3"
}

// not login
{
    "status_code": 401,
    "detail": "User not logined"
}
```

