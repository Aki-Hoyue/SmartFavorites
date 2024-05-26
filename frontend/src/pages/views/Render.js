import React, { useEffect, useState } from 'react';
import { set } from 'react-hook-form';
import Toast from '../components/Toast';
import { useLocation } from 'react-router-dom';
import { Icon } from '../../components/Component';
import { useCookies } from 'react-cookie';

const Render = () => {
    const location = useLocation();
    const { fileId, fileName } = location.state?.fileInfo ? location.state?.fileInfo : '';
    const [fileScr, setFileScr] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [cookies] = useCookies(['userInfo']);
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

    const loadFiles = async () => {
        try {
            const response = await fetch(`http://localhost:8000/findPath/${fileId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: "test@test.com",
                uid: "1",
                loginAuth: "dGVzdEB0ZXN0LmNvbTE=",
            }),
            });
            const result = await response.json();
            if(result["status_code"] !== 200) {
                console.error('Load file failed:', result["detail"]);
                setToast('Load file failed: ' + result["detail"], 'cross-circle');
            }
            else {
                if(result["path"].startsWith("http"))
                    setFileScr(result["path"]);
                else
                    setFileScr("http://localhost:8000" + result["path"]);
            }
        }
        catch (error) {
            console.error('Load file failed:', error);
            setToast('Load file failed: ' + error, 'cross-circle');
        }
        
    }

    useEffect(() => {
        const userInfo = cookies.userInfo ? cookies.userInfo : undefined;
        if (userInfo === undefined) {
            window.history.pushState("","",`${"/login"}`);
            window.location.reload();
        }
        if(fileId === undefined) {
            setError(true);
        }
        else {
            loadFiles();
        }
    }, [fileId]);

    return (
        <div>
            {showToast && <Toast text={toastText} icon={toastIcon} showToast={showToast} setShowToast={setShowToast} replay={toastReplay} setReplay={setToastReplay}></Toast>}
            <div className="d-flex justify-content-between">
                <h5 className="nk-fmg-title">{fileName}</h5>
                <button className="btn btn-dim btn-outline-primary" onClick={() => window.history.back()}><Icon name="arrow-left"> </Icon>Go Back</button>
            </div>
            {isLoading && <div className="d-flex justify-content-center"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>}
            {error && <div className="d-flex justify-content-center"><div className="alert alert-warning" role="alert">File Not Found</div></div>}
            {!error && <iframe src={`https://view.xdocin.com/view?src=${fileScr}`} frameBorder="0" width="100%" height="1130px" onLoad={() => setIsLoading(false)} style={{display: isLoading ? 'none' : 'block'}}></iframe>}
        </div>
    )
}

export default Render;