import React, { useState } from "react";
import { Button } from "reactstrap";
import icons from "../components/Icons"
import { Icon, Col, Row } from "../../components/Component";

const OCRModal = ({ file, setOCRShow }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("eng");

  const handleOCR = async () => {
    setIsProcessing(true);
    setError("");
    try {
      const response = await fetch(`http://127.0.0.1:8000/ocr/${file.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'test@test.com',
            uid: '1',
            loginAuth: 'dGVzdEB0ZXN0LmNvbTE=',
            languages: language
        }),
      });
      const result = await response.json();
  
      if (result.status_code === 200) {
        setDownloadUrl(`http://127.0.0.1:8000${result["file_path"]}`);
        handleDownload();
      } else {
        setError(result.message || 'Error processing OCR');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.location.href = downloadUrl;
    }
  };

  const handleClose = () => {
    setOCRShow(false);
  };

  return (
    <React.Fragment>
    <div className="modal-content">
    <div className="modal-header">
        <div className="nk-file-title">
          <div className="nk-file-icon"><div className="nk-file-icon-type">{icons[file.icon]}</div></div>
          <div className="nk-file-name">
            <div className="nk-file-name-text">
              <span className="title">OCR {file.name}</span>
            </div>
            <div className="nk-file-name-sub">{file.type}</div>
          </div>
        </div>
        <a
          href="#close"
          onClick={(ev) => {
            ev.preventDefault();
            handleClose();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
      </div>
      <div className="modal-body">
        <Row>
        {file.cover && (
            <Col lg={3}>
            <img
                src={file.cover}
                alt="cover"
                className="nk-file-cover w-100 h-auto center-block border rounded"
                style={{ marginTop: "45%", marginLeft: "5%", marginRight: "5%", marginBottom: "45%" }}
            />
            </Col>
        )}
        <Col lg={9}>
        <div className="nk-file-details">
          <div className="nk-file-details-row">
            <div className="nk-file-details-col">File Name</div>
            <div className="nk-file-details-col">{file.name}</div>
          </div>
          <div className="nk-file-details-row">
            <div className="nk-file-details-col">Author</div>
            <div className="nk-file-details-col">{file.author}</div>
          </div>
          <div className="nk-file-details-row">
            <div className="nk-file-details-col">Abstract</div>
            <div className="nk-file-details-col">{file.abstract}</div>
          </div>
          <div className="nk-file-details-row">
            <div className="nk-file-details-col">Language</div>
            <select className="form-control" value={language} onChange={(e) => setLanguage(e.target.value)} >
              <option value="eng" default>English</option>
              <option value="chi">中文简体</option>
            </select>
          </div>
        </div>
        {error && <div className="alert alert-danger alert-icon"><em className="icon ni ni-cross-circle"></em><strong>OCR failed. </strong>{error}</div>}
        {!error && downloadUrl && (<div className="alert alert-success alert-icon"><em className="icon ni ni-check-circle"></em> <strong>OCR Successful!</strong>. Your can click Download button to download.</div>)}
        </Col>
        </Row>
        <div className="nk-modal-action mt-2 justify-end text-lg-end">
          <Button color="primary" onClick={handleOCR} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                <span> Processing...</span>
              </>
            ) : (
              'OCR'
            )}
          </Button>
          &nbsp; &nbsp;
          <Button color="primary" onClick={handleDownload} disabled={!downloadUrl}>
            Download
          </Button>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
};

export default OCRModal;
