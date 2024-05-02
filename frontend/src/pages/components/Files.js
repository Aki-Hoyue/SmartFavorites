import React, {useEffect, useState} from 'react'
import classNames from 'classnames';
import { useFileManager, useFileManagerUpdate } from "../components/Context";
import icons from './Icons';
import { Modal, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Icon } from "../../components/Component";
import Details from "../modals/Details";
import {Render} from '../views/Render';
import { set } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import TTSModal from '../modals/TTSModal';
import OCRModal from '../modals/OCR';
import { useCookies } from 'react-cookie';

const File = ({item, fileView, page}) => {
    const [cookies] = useCookies(['userInfo']);
    const navigate = useNavigate();
    const location = useLocation();
    const [TTSShow, setTTSShow] = useState(false);
    const [OCRShow, setOCRShow] = useState(false);
    const [TTSStart, setTTSStart] = useState(false);
    const [OCRStart, setOCRStart] = useState(false);
    const {fileManagerUpdate} = useFileManagerUpdate();
    
    const [detailModal, setDetailModal] = useState(false);

    const toggleDetailModal = () => {
        setDetailModal(!detailModal);
    };
    

    const downloadFile = (file) => {
        const downloadLink = document.createElement("a");
        try {
            const response = fetch(`http://127.0.0.1:8000/findPath/${file.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: cookies.userInfo.email,
                    uid: cookies.userInfo.uid,
                    loginAuth: cookies.userInfo.loginAuth,
                })
            });
            const result = response.json();
            if (result["status_code"] !== 200) {
                downloadLink.href = "data:" + file.type + ";charset=utf-8," + encodeURIComponent(file.name);
                downloadLink.download = file.name;
                downloadLink.click();
                console.error('Download failed:', result);
            }
            else {
                const path = result["path"];
                downloadLink.href = `http://localhost:8000${path}`;
                downloadLink.download = file.name;
                downloadLink.click();
            }
        }
        catch (error) {
            console.error(error);
        }
    };

    const deleteFile = (file) => {
        if (detailModal)
            setDetailModal(false);
        fileManagerUpdate.toTrash(file.id, true);
        if (detailModal)
            setDetailModal(true);
    }

    const processTTS = (start=false) => {
        setTTSShow(true);
        if (start)
            setTTSStart(true);
    }

    const toPreview = (item) => {
        const fileInfo = {
          fileId: item.id,
          fileName: item.name,
        };
        navigate('/preview', { state: {fileInfo: fileInfo} });
      };

    const OCRFile = (start=false) => {
        setOCRShow(true);
        if (start)
            setOCRStart(true);
    }

    useEffect(() => {
        if (location.state?.ocr) {
            const ocr = location.state.ocr;
            if (ocr == item.id)
                OCRFile(true);
        }
        else if (location.state?.tts) {
            const tts = location.state.tts;
            if (tts == item.id)
                processTTS(true);
        }
    }, []);

    return (
        <>
            <div className="nk-file-item nk-file">
                <div className="nk-file-info">
                    <div className="nk-file-title">
                        <div className="nk-file-icon"  onClick={() => toPreview(item)}>
                            <span className="nk-file-icon-type">{icons[item.icon]}</span>
                        </div>
                        <div className="nk-file-name">
                            <div className="nk-file-name-text">
                                <span className="title">{item.name}</span>
                                <div className="asterisk">
                                    <a
                                        href="#folder"
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            fileManagerUpdate.toggleStarred(item.id);
                                        }}
                                        className={item.starred ? "active" : ""}
                                    >
                                        <Icon className="asterisk-off icon ni ni-star"></Icon>
                                        <Icon className="asterisk-on icon ni ni-star-fill"></Icon>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {fileView === 'list' &&  <>
                    {(page === undefined) && <div className="nk-file-meta">
                        <div className="tb-lead">{item.type}</div>
                    </div>}
                </>}
                <div className="nk-file-actions">
                    <UncontrolledDropdown>
                        <DropdownToggle tag="a" href="#folder" className="dropdown-toggle btn btn-sm btn-icon btn-trigger"
                            onClick={(ev) => ev.preventDefault()}>
                            <Icon name="more-h"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end>
                            <ul className="link-list-opt no-bdr">
                                <li>
                                    <DropdownItem tag="a" href="#details" onClick={(ev) => {ev.preventDefault(); setDetailModal(true);}}>
                                        <Icon name="eye"></Icon>
                                        <span>Details</span>
                                    </DropdownItem>
                                </li>
                                <li>
                                    <DropdownItem tag="a" href="#download" onClick={(ev) => {ev.preventDefault(); downloadFile(item)}}>
                                        <Icon name="download"></Icon>
                                        <span>Download</span>
                                    </DropdownItem>
                                </li>
                                {item.type == "PDF" && <li>
                                    <DropdownItem tag="a" href="#ocr" onClick={(ev) => {ev.preventDefault(); OCRFile()}}>
                                        <Icon name="scan"></Icon>
                                        <span>OCR</span>
                                    </DropdownItem>
                                </li>}
                                {(item.type == "TXT" || item.type == "EPUB") && <li>
                                    <DropdownItem tag="a" href="#tts" onClick={(ev) => {ev.preventDefault(); processTTS()}}>
                                        <Icon name="mic"></Icon>
                                        <span>TTS</span>
                                    </DropdownItem>
                                </li>}
                                <li>
                                    <DropdownItem tag="a" href="#delete" onClick={(ev) => {ev.preventDefault(); deleteFile(item)}}>
                                        <Icon name="trash"></Icon><span>Delete</span>
                                    </DropdownItem>
                                </li>
                            </ul>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>

                <Modal isOpen={detailModal} size="md" toggle={toggleDetailModal}>
                    <Details file={item} toggle={toggleDetailModal} triggerDelete={deleteFile} triggerDownload={downloadFile} />
                </Modal>
                
                <Modal isOpen={TTSShow} toggle={() => setTTSShow(!TTSShow)}>
                    <TTSModal id={item.id} setTTSShow={setTTSShow} toggle={() => setTTSShow(!TTSShow)} startNow={TTSStart} />
                </Modal>

                <Modal isOpen={OCRShow} toggle={() => setOCRShow(!OCRShow)}>
                    <OCRModal file={item} setOCRShow={setOCRShow} toggle={() => setOCRShow(!OCRShow)} startNow={OCRStart}/>
                </Modal>
            </div>
        </>
    )
}


const Files = ({files, fixedView, page}) => {

    const {fileManager} = useFileManager();
    
    const fileView = fixedView ? fixedView : fileManager.filesView;

    const mainClass = classNames({
        "nk-files": true,
        [`nk-files-view-${fileView}`]: fileView
    });

    const filesList = files;

    return (
        <div className={mainClass}>
            {filesList.length > 0 && <div className="nk-files-head">
                <div className="nk-file-item">
                    {fileView === 'list' && <> 
                        <div className="nk-file-info">
                            <div className="tb-head">Name</div>
                            <div className="tb-head"></div>
                        </div>
                        {(page === undefined) &&<div className="nk-file-meta">
                            <div className="tb-head">Type</div>
                        </div>}
                        <div className="nk-file-actions">
                        </div>
                    </>}
                </div>
            </div>}
            {(fileView === 'list' || fileView === 'grid') && 
                <div className="nk-files-list">
                    {filesList.map((item) => (
                        <File fileView={fileView} item={item} key={item.id} page={page}/>
                    ))}
                </div>
            }
            {fileView === 'group' && <>
                <div className="nk-files-group">
                    <h6 className="title">Files</h6>
                    <div className="nk-files-list">
                        {filesList.map((item) => (
                            <File fileView={fileView} item={item} key={item.id} page={page}/>
                        ))}
                    </div>
                </div>
            </>}
            {filesList.length === 0 && <div className="nk-files-empty">No folders or files are available</div>}
        </div>
    )
}

export default Files