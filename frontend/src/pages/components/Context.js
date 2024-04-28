import React, { useState, createContext, useContext, useEffect } from "react";

import data, { getFiles } from "../Data";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { set } from "react-hook-form";

const FileManager = createContext();
const FileManagerUpdate = createContext();

export function useFileManager(){
  return useContext(FileManager);
}

export function useFileManagerUpdate(){
  return useContext(FileManagerUpdate);
}


const FileManagerProvider = ({ ...props }) => {

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentFileToDelete, setCurrentFileToDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');

  const toggleDeleteDialog = () => setIsDeleteDialogOpen(!isDeleteDialogOpen);

  const defaultFileManager = {
    search: '',
    data: data,
    files: [],
    filesView: 'grid',
    asideVisibility: false,
    contentHeight: 0
  }

  const [fileManager, setFileManager] = useState(defaultFileManager);

  useEffect(() => {
    const loadFiles = async () => {
      const fetchedFiles = await getFiles();
      setFileManager(prevFileManager => ({
        ...prevFileManager,
        files: fetchedFiles
      }));
    };
    loadFiles();
  }, []);

  const fileManagerUpdate = {
    toggleStarred: function(selector) {
      let index = fileManager.files.findIndex((item) => item.id === selector);
      fileManager.files[index].starred = !fileManager.files[index].starred;
      setFileManager({ ...fileManager });
    },
    toTrash: function(selector, value) {
      const fileToDelete = fileManager.files.find((item) => item.id === selector);
      setCurrentFileToDelete(fileToDelete);
      setIsDeleteDialogOpen(true);
    },
    asideVisibility: function() {
      setFileManager({ ...fileManager, asideVisibility: !fileManager.asideVisibility });
    },
    asideHide: function() {
      setFileManager({ ...fileManager, asideVisibility: false });
    },
    filesView: function(value) {
      setFileManager({ ...fileManager, filesView: value });
    },
    search: function(value) {
      setFileManager({ ...fileManager, search: value });
    },
    contentHeight: function(value) {
      setFileManager({ ...fileManager, contentHeight: value });
    },
    newFiles: function(newFiles) {
      setFileManager({ ...fileManager, files: [...fileManager.files, ...newFiles] });
    },
    modifyFile: function(id, name, author, abstract, cover) {
      let index = fileManager.files.findIndex((item) => item.id === id);
      fileManager.files[index].name = name;
      fileManager.files[index].author = author;
      fileManager.files[index].abstract = abstract;
      fileManager.files[index].cover = cover;
      setFileManager({ ...fileManager });
    }
  };

  const deleteFile = async (file) => {
    let index = fileManager.files.findIndex((item) => item.id === file.id);
    if(index !== -1) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/delete/${index}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: "test@test.com",
            uid: "1",
            loginAuth: "dGVzdEB0ZXN0LmNvbTE="
          }),
        });
        const result = await response.json();
        if (result["status_code"] !== 200) {
          setDeleteMessage(`Delete failed: ${result.message}`);
          console.error('Delete failed:', result);
        }
        else {
          setDeleteMessage('');
          fileManager.files[index].deleted = true;
          setFileManager({ ...fileManager });
          setIsDeleteDialogOpen(false);
        }
      } catch (error) {
        setDeleteMessage(`Delete failed: ${error}`);
        console.error(error);
      }
    }
    else {
      setDeleteMessage(`File with ID: ${file.id} not found`);
      console.log(`File with ID: ${file.id} not found`);
    }
  };

  return (
    <>
    <FileManager.Provider value={{ fileManager }}>
      <FileManagerUpdate.Provider value={{ fileManagerUpdate }}>
        {props.children}
        {currentFileToDelete && (
          <ConfirmDeleteDialog
            isOpen={isDeleteDialogOpen}
            toggle={toggleDeleteDialog}
            filename={currentFileToDelete.name}
            onDelete={() => deleteFile(currentFileToDelete)}
            deleteMessage={deleteMessage}
          />
        )}
      </FileManagerUpdate.Provider>
    </FileManager.Provider>
    </>
  );
};

export default FileManagerProvider;


