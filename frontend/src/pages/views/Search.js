import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, List, Modal, ModalHeader, ModalBody } from "reactstrap";
import FileCard from '../components/FileCard';
import { set } from 'react-hook-form';
import { useFileManager, useFileManagerUpdate } from "../components/Context";
import Toast from '../components/Toast';

const SearchPage = ({ userInfo }) => {
    const [formData] = useState(userInfo);
    const [showToast, setShowToast] = useState(false);
    const [toastText, setToastText] = useState('');
    const [toastIcon, setToastIcon] = useState('alert-circle');
    const [toastReplay, setToastReplay] = useState(false);
    const setToast = async (text, icon) => {
        if (!showToast) {
        setToastReplay(false);
        }
        else {
        setToastReplay(true);
        }
        setToastText(text);
        setToastIcon(icon);
        setShowToast(true);
    }

    const {fileManagerUpdate} = useFileManagerUpdate();
    const location = useLocation();
    const [search, setSearch] = useState(location.state?.title || '');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [empty, setEmpty] = useState(false);
    const [importStatus, setImportStatus] = useState(false);
    const [bookInfo, setBookInfo] = useState({});

    const handleSearch = async () => {
        if (searchResult.length > 0) {
            setSearchResult([]);
        }
        setEmpty(false);
        if (!search){
            setEmpty(true);
            return;
        }
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                keyword: search,
                email: formData.email,
                uid: formData.uid,
                loginAuth: formData.loginAuth,
            }),
        });
        const result = await response.json();
        if (result["status_code"] !== 200) {
            console.error('Search failed:', result["detail"]);
            setToast('Search failed: ' + result["detail"], 'cross-circle');
        }
        else {
            setSearchResult(result["data"]);
            setLoading(false);
        }
    }

    const importToFile = async (id) => {
        const filename = bookInfo.title;
        const author = bookInfo.author;
        const abstract = bookInfo.abstract;
        const cover = bookInfo.image;
        try {
            const response = await fetch(`http://127.0.0.1:8000/modifyFiles/${id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: formData.email,
                uid: formData.uid,
                loginAuth: formData.loginAuth,
                filename: filename,
                author: author,
                abstract: abstract,
                cover: cover
              })
            });
            const result = await response.json();
            if (result["status_code"] !== 200) {
              console.error('Import failed:', result);
              setImportStatus(false);
              setToast('Import failed: ' + result["detail"], 'cross-circle');
            }
            else {
              fileManagerUpdate.modifyFile(id, filename, author, abstract, cover);
              setImportStatus(false);
              setToast('Import successfully', 'check-circle');
            }
          } catch (error) {
            console.error(error);
            setImportStatus(false);
            setToast('Import failed: ' + error, 'cross-circle');
          }
    }

    const getFile = (file) => {
        setImportStatus(false);
        importToFile(file.id);
    }

    useEffect(() => {
        if(location.state?.title){
            handleSearch();
        }
    }, [])
    return (
        <>
            {showToast && <Toast text={toastText} icon={toastIcon} showToast={showToast} setShowToast={setShowToast} replay={toastReplay} setReplay={setToastReplay}></Toast>}
            <h6 className="nk-fmg-title">Search your book infomation online.</h6>
            <div className="nk-fmg-body-head d-flex flex-wrap align-items-center">
                <div style={{ flex: 1 }} className="nk-fmg-search">
                    <input
                        type="text"
                        className="form-control border border-primary form-focus-none"
                        placeholder="Search book infomation online"
                        value={search || ''}
                        onChange={(ev) => setSearch(ev.target.value)}
                        onKeyDown={(ev) => ev.key === 'Enter' && !loading && handleSearch()}
                    />
                </div>
                <div className="d-flex align-items-center">
                    <Button color="primary" onClick={handleSearch} disabled={loading}>{loading && <><span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> <span>Loading...</span></>}{!loading && <span>Search</span>}</Button>
                </div>
            </div>
            {searchResult.length === 0 && 
                <div className="alert alert-info alert-icon" role='alert'>
                    <em className="icon ni ni-alert-circle"></em>
                    Result will be shown here, go to search your book infomation online~
                </div>}
            {empty && <div className="alert alert-danger alert-icon" role='alert'>
                <em className="icon ni ni-cross-circle"></em>
                Please enter your book infomation
            </div>}
            <List>
                {searchResult.map((book, index) => (
                    <div className="card card-bordered" key={index}>
                        <div className="row">
                            <div className="col-md-3">
                                <img src={book.image} className="card-img-left w-100 h-auto" alt="" />
                            </div>
                            <div className="col-md-8">
                                <div className="card-inner">
                                    <h4 className="card-title">{book.title}</h4>
                                    <h6 className="card-subtitle mb-2 text-muted">{book.author}</h6>
                                    <p className="card-text">{book.abstract}</p>
                                    <a href={`${book.detail}`} className="btn btn-info" target="_blank">Details</a>
                                    &nbsp;&nbsp;
                                    <a href="#import" className="btn btn-light" onClick={() => {setImportStatus(true); setBookInfo(book)}}>Import to the File</a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </List>
            {importStatus && <Modal isOpen={importStatus} toggle={() => setImportStatus(false)} className="modal-dialog-centered modal-md">
                <ModalBody>
                    <FileCard setImportStatus={setImportStatus} getFile={getFile} />
                </ModalBody>
            </Modal>}
        </>
    )
}

export default SearchPage


