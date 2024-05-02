import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { Button } from "reactstrap";
import { Icon } from "../../components/Component";
import { bytesToMegaBytes } from "../../utils/Utils";
import {iconsType} from '../components/Icons';
import { set } from "react-hook-form";
import { useFileManagerUpdate } from "../components/Context";
import { useCookies } from 'react-cookie';

const Upload = ({ toggle }) => {
  const [cookies] = useCookies(['userInfo']);
  const {fileManagerUpdate} = useFileManagerUpdate();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(false);
  const [errorType, setErrorType] = useState('');
  const [errorUpload, setErrorUpload] = useState(false);

  const handleDropChange = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const removeFromList = (name) => {
    let defaultFiles = files;
    defaultFiles = defaultFiles.filter((item) => item.name !== name);
    setErrorType('');
    setError(false);
    setFiles([...defaultFiles]);
  };

  const determineType = (type) => {
    switch(type) {
      case 'application/pdf':
        return 'PDF';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'XLSX';
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'PPTX';
      case 'text/plain':
        return 'TXT';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'DOCX';
      case 'application/epub':
        return 'EPUB';
      case 'application/epub+zip':
        return 'EPUB';
      case 'text/markdown':
        return 'Markdown';
      default:
        return 'Error';
    }
  }

  const determineIcon = (type) => {
    switch(type) {
      case 'TXT':
      case 'EPUB':
        return 'fileText';
      case 'PDF':
        return 'filePDF';
      case 'DOCX':
        return 'fileDoc';
      case 'XLSX':
        return 'fileSheet';
      case 'PPTX':
        return 'filePPT';
      case 'MD':
        return 'fileCode';
      default:
        return 'fileText';
    }
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError(true);
      return;
    }
    else 
      setError(false);
    let type = '';
    const markdown = RegExp(/.md$/);
    markdown.test(files[0].name) ? type = 'Markdown' : type = determineType(files[0].type);
    if(type === 'Error') {
      setErrorType(files[0].type);
      console.log('Error type.');
      return;
    }
    else 
      setErrorType('');
    
    const formData = new FormData();
    formData.append("email", cookies.userInfo.email);
    formData.append("uid", cookies.userInfo.uid);
    formData.append("loginAuth", cookies.userInfo.loginAuth);
    formData.append("file", files[0]);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
  
      if (result["status_code"] === 200) {
        const newFile = [{
          id: result["data"]["FID"],
          name: result["data"]["Filename"],
          type: result["data"]["Type"],
          icon: determineIcon(result["data"]["Type"]),
          starred: false,
          author: "",
          abstract: "",
          cover: ""
        }]
        fileManagerUpdate.newFiles(newFile);
        setErrorUpload(false);
        toggle();
      } else {
        console.error('Upload failed:', result);
        setErrorUpload(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorUpload(true);
    }
  }

  return (
    <React.Fragment>
      <a
        href="#close"
        onClick={(ev) => {
          ev.preventDefault();
          toggle();
        }}
        className="close"
      >
        <Icon name="cross-sm"></Icon>
      </a>
      <div className="modal-body modal-body-md">
        <div className="nk-upload-form">
          <h5 className="title mb-3">Upload File</h5>
          {error && <div className="alert alert-danger alert-icon"><em className="icon ni ni-cross-circle"></em><strong>Upload failed. </strong>Please select a file.</div>}
          {errorType && <div className="alert alert-danger alert-icon"><em className="icon ni ni-cross-circle"></em><strong>Upload failed. </strong>{errorType} is not allowed.</div>}
          {errorUpload && <div className="alert alert-danger alert-icon"><em className="icon ni ni-cross-circle"></em><strong>Upload failed. </strong>Please check your connection and try again.</div>}
          <Dropzone onDrop={(acceptedFiles) => handleDropChange(acceptedFiles)}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()} className="dropzone upload-zone small bg-lighter my-2 dz-clickable">
                  <input {...getInputProps()} />
                  <div className="dz-message">
                    <span className="dz-message-text">
                      <span>Drag and drop</span> file here or <span>browse</span>
                    </span>
                  </div>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
        {files.length > 0 && <div className="nk-upload-list">
          <h6 className="title">Uploaded Files</h6>
          {files.length > 0 ? (
            files.map((file, index) => (
              <div className="nk-upload-item" key={index}>
                <div className="nk-upload-icon">
                  {iconsType[file.type] ? iconsType[file.type] : iconsType["others"]}
                </div>
                <div className="nk-upload-info">
                  <div className="nk-upload-title">
                    <span className="title">{file.name}</span>
                  </div>
                  <div className="nk-upload-size">{bytesToMegaBytes(file.size)} MB</div>
                </div>
                <div className="nk-upload-action">
                  <a
                    href="#delete"
                    onClick={(ev) => {
                      ev.preventDefault();
                      removeFromList(file.name);
                    }}
                    className="btn btn-icon btn-trigger"
                  >
                    <Icon name="trash"></Icon>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="d-flex justify-center">
              <span>No files added yet !</span>
            </div>
          )}
        </div>}
        <div className="nk-modal-action justify-end">
          <ul className="btn-toolbar g-4 align-center">
            <li>
              <a
                href="#toggle"
                onClick={(ev) => {
                  ev.preventDefault();
                  toggle();
                }}
                className="link link-primary"
              >
                Cancel
              </a>
            </li>
            <li>
              <Button color="primary" onClick={uploadFiles}>
              <Icon name="upload">&nbsp;</Icon>Upload 
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Upload;
