import React, { useEffect, useState, useRef } from 'react';
import { set } from 'react-hook-form';
import { Icon } from '../../components/Component';
import { Col } from 'reactstrap';
import { useCookies } from 'react-cookie';

const TTSModal = ({ id, setTTSShow, startNow }) => {
    const [cookies] = useCookies(['userInfo']);
    const [voice, setVoice] = useState('zh-CN-XiaoxiaoNeural');
    const [isProcessing, setIsProcessing] = useState(false);
    const [audioSrc, setAudioSrc] = useState('');
    const [error, setError] = useState('');
    const [textContent, setTextContent] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const audioRef = useRef(null);

    const handleTTSClick = async () => {
        if (textContent === '')
            return;
        setIsProcessing(true);
        setError('');
        try {
            const response = await fetch('http://127.0.0.1:8000/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: cookies.userInfo.email,
                    uid: cookies.userInfo.uid,
                    loginAuth: cookies.userInfo.loginAuth,
                    text: textContent,
                    voice: voice,
                }),
            });
            const data = await response.json();
            if (data.status_code === 200) {
                console.log(data.data);
                setAudioSrc(`http://127.0.0.1:8000/tts_files/TTSResult.mp3?${new Date().getTime()}`);
                setIsPlaying(true);
                setIsEnd(false);
            } else {
                setError(data.message || 'Error processing your request');
            }
        } catch (error) {
            setError('Network error');
        } finally {
            setIsProcessing(false);
        }
    };

    const getTextContent = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/getText/${id}?email=${cookies.userInfo.email}&uid=${cookies.userInfo.uid}&loginAuth=${cookies.userInfo.loginAuth}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (data["status_code"] === 200) {
                setTextContent(data["data"]);
            } else {
                console.log(data);
                setError(data["detail"] || 'Content Fetch Error');
            }
        } catch (error) {
            console.error(error);
            setError('Content Fetch Error');
        }
    }

    const replayAudio = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            setIsPlaying(true);
            setIsEnd(false);
        }
    };

    const stopPlay = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }

    const continuePlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }

    useEffect(() => {
        getTextContent();
    }, []);

    useEffect(() => {
        if (startNow) {
            handleTTSClick();
        }
    }, [startNow==true]);

    return (
        <React.Fragment>
        <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">Text-to-Speech</h5>
                <a href="#close" className="close" onClick={() => setTTSShow(false)}>
                    <Icon name="cross-sm"></Icon>
                </a>
            </div>
            <div className="modal-body">
                <div className="row">
                    <div className="text-content">
                        <p className="content-text mb-0">Texts:</p>
                            <textarea className="form-control" value={textContent} onChange={(e) => setTextContent(e.target.value)}></textarea>
                        </div>
                        {error && <div className="alert alert-fill alert-danger alert-icon"><em className="icon ni ni-cross-circle"></em> {error}</div>}

                    <div>
                            <p className="content-text mt-3 mb-0">Select Voice:</p>
                            <select className="form-control" value={voice} onChange={(e) => setVoice(e.target.value)}>
                                <option value="zh-CN-XiaoxiaoNeural" default>[普通话][Female]晓晓</option>
                                <option value="zh-CN-XiaoyiNeural">[普通话][Female]晓依</option>
                                <option value="zh-CN-YunjianNeural">[普通话][Male]云健</option>
                                <option value="zh-CN-YunxiNeural">[普通话][Mmale]云希</option>
                                <option value="zh-HK-HiuMaanNeural">[广东话][Female]晓曼</option>
                                <option value="zh-HK-WanLungNeural">[广东话][Male]云龙</option>
                                <option value="en-US-MichelleNeural">[English][Female]Michelle</option>
                                <option value="en-US-JennyNeural">[English][Female]Jenny</option>
                                <option value="en-US-SteffanNeural">[English][Male]Steffan</option>
                                <option value="en-GB-RyanNeural">[English][Male]Ryan</option>

                            </select>
                        </div>
                        {audioSrc && <audio ref={audioRef} src={audioSrc} onEnded={() => setIsEnd(true) && setIsPlaying(false)} autoPlay />}
                        <div className="mt-3 text-center text-lg-end">
                            <button className="btn btn-primary" onClick={handleTTSClick} disabled={isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                        <span> Processing...</span>
                                    </>
                                ) : (
                                    'TTS'
                                )}
                            </button>
                            &nbsp; &nbsp;
                            {audioSrc && <><button className="btn btn-success" onClick={replayAudio} disabled={isProcessing}>Replay</button> &nbsp; &nbsp;</>}
                            {audioSrc && !isEnd && <button className="btn btn-secondary" onClick={(isPlaying)? stopPlay : continuePlay} disabled={isProcessing}>{isPlaying ? 'Stop' : 'Continue'}</button>}
                        </div>
                </div>
            </div>
        </div>
    </React.Fragment>
    );
};

export default TTSModal;