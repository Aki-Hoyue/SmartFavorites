import React, { useState } from "react";
import { Icon, Col, Row } from "../../components/Component";
import icons from "../components/Icons"
import { set } from "react-hook-form";
import { useFileManager, useFileManagerUpdate } from "../components/Context";

const Details = ({ file, toggle, triggerDelete, triggerDownload }) => {
  const {fileManagerUpdate} = useFileManagerUpdate();
  const [modifyMode, setModifyMode] = useState(false);
  const [emptyName, setEmptyName] = useState(false);

  const modifyInfo = async (filename, author, abstract, cover=file.cover) => {
    if(filename == file.name && author == file.author && abstract == file.abstract && cover == file.cover) {
      setModifyMode(false);
      return;
    }
    
    if (filename == "") {
      setEmptyName(true);
      return;
    }
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/modifyFiles/${file.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: "test@test.com",
          uid: "1",
          loginAuth: "dGVzdEB0ZXN0LmNvbTE=",
          filename: filename,
          author: author,
          abstract: abstract,
          cover: cover
        })
      });
      const result = await response.json();
      if (result["status_code"] !== 200) {
        console.error('Modify failed:', result);
        setModifyMode(false);
      }
      else {
        setEmptyName(false);
        setModifyMode(false);
        if (cover != file.cover) {
          document.getElementById(`cover-${file.id}`).src = cover
        }
        fileManagerUpdate.modifyFile(file.id, filename, author, abstract, cover);
      }

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <React.Fragment>
      <div className="modal-header align-center">
        <div className="nk-file-title">
          <div className="nk-file-icon"><div className="nk-file-icon-type">{icons[file.icon]}</div></div>
          <div className="nk-file-name">
            <div className="nk-file-name-text">
              <span className="title">{file.name}</span>
            </div>
            <div className="nk-file-name-sub">{file.type}</div>
          </div>
        </div>
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
      </div>
      <Row>
      {(file.type === "TXT" || file.type === "PDF") && file.cover && (
        <Col lg={3}>
          <img
            id={"cover-" + file.id}
            src={file.cover}
            alt="cover"
            className="nk-file-cover w-100 h-auto center-block border rounded"
            style={{ marginTop: "45%", marginLeft: "15%", marginRight: "15%", marginBottom: "45%" }}
          />
        </Col>
      )}
      <Col lg={((file.type === "TXT" || file.type === "PDF") && file.cover) ? 9 : 12}>
        <div className="modal-body">
          <div className="nk-file-details">
            <div className="nk-file-details-row">
              <div className="nk-file-details-col">File ID</div>
              <div className="nk-file-details-col">{file.id}</div>
            </div>
            <div className="nk-file-details-row">
              <div className="nk-file-details-col">File Name</div>
              {!modifyMode && <div className="nk-file-details-col">{file.name}</div>}
              {modifyMode && <input id="file-name-input" type="text" className="form-control" defaultValue={file.name} onKeyDown={(ev) => ev.key === 'Enter' && modifyInfo(ev.target.value, document.getElementById("file-author").value, document.getElementById("file-abstract").value)}/>}
              {emptyName && <span className="text-danger">This field is required</span>}
            </div>
            <div className="nk-file-details-row">
              <div className="nk-file-details-col">File Type</div>
              <div className="nk-file-details-col">{file.type}</div>
            </div>
            <div className="nk-file-details-row">
              <div className="nk-file-details-col">Starred</div>
              <div className="nk-file-details-col">{file.starred ? 'Yes' : 'No'}</div>
            </div>
            <div className="nk-file-details-row">
              <div className="nk-file-details-col">Author</div>
              {!modifyMode && <div className="nk-file-details-col">{file.author}</div>}
              {modifyMode && <input id="file-author" type="text" className="form-control" defaultValue={file.author} onKeyDown={(ev) => ev.key === 'Enter' && modifyInfo(document.getElementById("file-name").value, ev.target.value, document.getElementById("file-abstract").value)} />}
            </div>
            <div className="nk-file-details-row">
              <div className="nk-file-details-col">Abstract</div>
              {!modifyMode && <div className="nk-file-details-col">{file.abstract}</div>}
              {modifyMode && <textarea id="file-abstract" className="form-control" defaultValue={file.abstract} />}
            </div>
            {modifyMode && (file.type === "TXT" || file.type === "PDF") && <>
              <div className="nk-file-details-row">
                <div className="nk-file-details-col">Cover</div>
                <input id="file-cover" type="text" className="form-control" defaultValue={file.cover}></input>
              </div>
            </>
            }
          </div>
        </div>
      </Col>
      </Row>
      <div className="modal-footer modal-footer-stretch bg-light">
        <div className="modal-footer-between">
          <div className="g">
          </div>
          <div className="g">
            <ul className="btn-toolbar g-3">
              {(file.type === "TXT" || file.type === "PDF") &&<li>
                <a
                  href="/search"
                  className="btn btn-secondary"
                >
                  Search Book Infomation
                </a>
              </li>}
              <li>
                <a
                  href="#modify"
                  onClick={(ev) => {
                    ev.preventDefault();
                    if(modifyMode){
                      if(modifyMode && (file.type === "TXT" || file.type === "PDF"))
                        modifyInfo(document.getElementById("file-name-input").value, document.getElementById("file-author").value, document.getElementById("file-abstract").value, document.getElementById("file-cover").value);
                      else 
                        modifyInfo(document.getElementById("file-name-input").value, document.getElementById("file-author").value, document.getElementById("file-abstract").value);
                    }
                    else
                      setModifyMode(true);
                  }}
                  className="btn btn-info"
                >
                  {modifyMode && <span>Save</span>}
                  {!modifyMode && <span>Modify</span>}
                </a>
              </li>
              <li>
                <a
                  href="#delete"
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggle();
                    triggerDelete(file);
                  }}
                  className="btn btn-danger"
                >
                  Delete
                </a>
              </li>
              <li>
                <a
                  href="download"
                  onClick={(ev) => {
                    ev.preventDefault();
                    triggerDownload(file);
                  }}
                  className="btn btn-primary"
                >
                  Download
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Details;
