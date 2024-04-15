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
    "uid": 1,
    "auth": "dGVzdEB0ZXN0LmNvbTE="
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



