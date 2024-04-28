import React, {useState} from 'react'
import classNames from 'classnames';
import { useFileManager, useFileManagerUpdate } from "../components/Context";
import icons from './Icons';
import { Modal, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Icon } from "../../components/Component";
import Details from "../modals/Details";
import {Render} from '../views/Render';
import { set } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import TTSModal from '../modals/TTSModal';
import OCRModal from '../modals/OCR';

const File = ({item, fileView, page}) => {
    const navigate = useNavigate();

    const [TTSShow, setTTSShow] = useState(false);
    const [OCRShow, setOCRShow] = useState(false);

    const {fileManagerUpdate} = useFileManagerUpdate();
    
    const [detailModal, setDetailModal] = useState(false);

    const toggleDetailModal = () => {
        setDetailModal(!detailModal);
    };
    

    const downloadFile = (file) => {
        const downloadLink = document.createElement("a");
        downloadLink.href = "data:" + file.ext + ";charset=utf-8," + encodeURIComponent(file.name);
        downloadLink.download = file.name;
        downloadLink.click();
    };

    const deleteFile = (file) => {
        if (detailModal)
            setDetailModal(false);
        fileManagerUpdate.toTrash(file.id, true);
        if (detailModal)
            setDetailModal(true);
    }

    const processTTS = () => {
        setTTSShow(true);
    }

    const toPreview = (item) => {
        const fileInfo = {
          fileId: item.id,
          fileName: item.name,
        };
        navigate('/preview', { state: fileInfo });
      };

    const OCRFile = (file) => {
        setOCRShow(true);
    }

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
                                    <DropdownItem tag="a" href="#ocr" onClick={(ev) => {ev.preventDefault(); OCRFile(item)}}>
                                        <Icon name="scan"></Icon>
                                        <span>OCR</span>
                                    </DropdownItem>
                                </li>}
                                {(item.type == "TXT" || item.type == "EPUB") && <li>
                                    <DropdownItem tag="a" href="#tts" onClick={(ev) => {ev.preventDefault(); processTTS(item)}}>
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
                    <TTSModal id={item.id} setTTSShow={setTTSShow} toggle={() => setTTSShow(!TTSShow)} />
                </Modal>

                <Modal isOpen={OCRShow} toggle={() => setOCRShow(!OCRShow)}>
                    <OCRModal file={item} setOCRShow={setOCRShow} toggle={() => setOCRShow(!OCRShow)} />
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