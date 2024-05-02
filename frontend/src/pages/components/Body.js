import React, {useState, useLayoutEffect} from 'react'

import ViewFilter, {options as viewOptions} from './ViewFilter';
import Files from './Files';

import Upload from "../modals/Upload";
import { useFileManager, useFileManagerUpdate } from "./Context";

import { BlockTitle, BlockBetween, BlockHead, BlockHeadContent, Icon } from "../../components/Component";
import { Button, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Modal } from "reactstrap";
const FilesBody = ({searchBar, title, viewFilter, recoveryFilter, searchOnline, rss, ...props}) => {

    const {fileManager} = useFileManager();
    const {fileManagerUpdate} = useFileManagerUpdate();

    const [uploadModal, setUploadModal] = useState(false);

    const [search, setSearch] = useState(false);

    const toggleSearch = () => {
        setSearch(!search);
    };

    const toggleUploadModal = () => {
      setUploadModal(!uploadModal);
    };

    const addRSSFeed = () => {
        console.log('addRSSFeed')
    }

    useLayoutEffect(() => {
        fileManagerUpdate.search('')
    }, []);

    const searchResult = [ ...fileManager.files.filter(item => !item.deleted && item.name.toLowerCase().includes(fileManager.search.toLowerCase())) ]
    
return (
    <>
            {searchBar && <div className="nk-fmg-body-head d-none d-lg-flex">
                    <div className="nk-fmg-search">
                            <Icon name="search"></Icon>
                            <input
                                    type="text"
                                    className="form-control border-transparent form-focus-none"
                                    placeholder="Search files, folders"
                                    value={fileManager.search}
                                    onChange={(ev) => fileManagerUpdate.search(ev.target.value)}
                            />
                    </div>
            <div className="nk-fmg-actions">
            <ul className="nk-block-tools g-3">
                <li>
                    <Button color="primary" onClick={() => toggleUploadModal()}>
                    <Icon name="upload-cloud"></Icon> <span>Upload</span>
                    </Button>
                </li>
            </ul>
        </div>
        </div>}
        <div className="nk-fmg-body-content">
            <BlockHead size="sm">
                <BlockBetween className="position-relative">
                    <BlockHeadContent>
                        {(title && fileManager.search === '') && title} 
                        {(title && fileManager.search !== '') && <BlockTitle page>{title}</BlockTitle>}
                        {fileManager.search !== '' && <BlockTitle page>Search for : <span className="fw-normal ms-2 text-muted">{fileManager.search}</span></BlockTitle>}
                    </BlockHeadContent>
                    <BlockHeadContent>
                        <ul className="nk-block-tools g-1">
                            {searchBar && <li className="d-lg-none">
                                <a
                                href="#folder"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    toggleSearch();
                                }}
                                className="btn btn-trigger btn-icon search-toggle toggle-search"
                                >
                                    <Icon name="search"></Icon>
                                </a>
                            </li>}


                            {(viewFilter || fileManager.search !== '') && <li className="d-lg-none">
                                <UncontrolledDropdown>
                                    <DropdownToggle
                                        tag="a"
                                        href="#toggle"
                                        onClick={(ev) => ev.preventDefault()}
                                        className="btn btn-trigger btn-icon"
                                    >
                                        <Icon name={viewOptions.filter((item) => item.value === fileManager.filesView)[0].icon}></Icon>
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                        <ViewFilter listOpt/>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </li>}
                            
                            {!searchOnline && !rss && <li className="d-lg-none">
                                <UncontrolledDropdown>
                                <DropdownToggle
                                    tag="a"
                                    href="#toggle"
                                    onClick={(ev) => ev.preventDefault()}
                                    className="btn btn-trigger btn-icon"
                                >
                                    <Icon name="plus"></Icon>
                                </DropdownToggle>
                                <DropdownMenu end>
                                    <ul className="link-list-opt no-bdr">
                                    <li>
                                        <DropdownItem
                                        tag="a"
                                        href="#upload"
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            toggleUploadModal();
                                        }}
                                        >
                                        <Icon name="upload-cloud"></Icon>
                                        <span>Upload File</span>
                                        </DropdownItem>
                                    </li>
                                    </ul>
                                </DropdownMenu>
                                </UncontrolledDropdown>
                            </li>}
                        </ul>
                    </BlockHeadContent>
                    {searchBar && <div className={`search-wrap px-2 d-lg-none ${search ? "active" : ""}`}>
                        <div className="search-content">
                        <a
                            href="#toggle"
                            onClick={(ev) => {
                            ev.preventDefault();
                            toggleSearch();
                            }}
                            className="search-back btn btn-icon toggle-search"
                        >
                            <Icon name="arrow-left"></Icon>
                        </a>
                        <input
                            type="text"
                            className="form-control border-transparent form-focus-none"
                            placeholder="Search files, folders"
                            value={fileManager.search}
                            onChange={(ev) => fileManagerUpdate.search(ev.target.value)}
                        />
                        <button className="search-submit btn btn-icon">
                            <Icon name="search"></Icon>
                        </button>
                        </div>
                    </div>}

                    {(viewFilter || fileManager.search !== '') && <BlockHeadContent className="d-none d-lg-block"><ViewFilter/></BlockHeadContent>}
                    
                </BlockBetween>
            </BlockHead>
            {fileManager.search === '' ? props.children : <Files files={searchResult} />}
        </div>
        
        <Modal isOpen={uploadModal} size="md" toggle={toggleUploadModal}>
            <Upload toggle={toggleUploadModal} />
        </Modal>
    </>
  )
}

export default FilesBody