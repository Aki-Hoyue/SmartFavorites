import React from 'react';
import { Button, Col, Row } from "reactstrap";
import { Icon } from "../../components/Component";
import { useFileManager } from "./Context";

const FileCard = ({ setImportStatus, getFile }) => {
  const {fileManager} = useFileManager();
  const filesList = [ ...fileManager.files.filter(item => (item.type == "PDF" || item.type == "TXT") && !item.deleted)]

  return (
    <React.Fragment>
        <a
            href="#dropdownitem"
            onClick={(ev) => {
              ev.preventDefault();
              setImportStatus(false);
            }}
            className="close"
          >
          <Icon name="cross-sm"></Icon>
          </a>
          <h5 className="title">Select a file to import</h5>
        {filesList.length === 0 && <div className="nk-files-empty">No folders or files are available</div>}
        {filesList.length > 0 &&
            <div className="nk-files-list">
                {filesList.map((file) => (
                    <div className="card card-bordered" key={file.id}>
                    <Row className="card-inner card-inner-md">
                        {file.cover && <Col lg={4}>
                        <img src={file.cover} className="card-img-left w-100 h-auto border rounded" alt="File Cover" style={{ marginTop: "15%", marginLeft: "15%", marginRight: "5%", marginBottom: "15%" }}/>
                        </Col>}
                        <Col lg={file.cover ? 8 : 12}>
                        <div className="card-inner w-500">
                            <h4 className="card-title">{file.name}</h4>
                            <h6 className="card-subtitle mb-2 text-muted">{file.author}</h6>
                            <p className="card-text">{file.abstract}</p>
                            <div className="card-text">
                            <Button className="btn btn-light" onClick={() => {getFile(file); setImportStatus(false)}}>Import</Button>
                            </div>
                        </div>
                        </Col>
                    </Row>
                    </div>
                ))}
            </div>
        }
    </React.Fragment>
  );
};

export default FileCard;