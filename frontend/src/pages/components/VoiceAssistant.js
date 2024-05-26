import React, { useState, useRef, useEffect } from 'react';
import { Button, Col, PopoverHeader, PopoverBody, Popover } from 'reactstrap';
import { Icon } from "../../components/Component";
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { set } from 'react-hook-form';
import { useFileManager, useFileManagerUpdate } from "./Context";

const VoiceAssistant = () => {
    const [cookies] = useCookies(['userInfo']);
    const [hasAudio, setHasAudio] = useState("");
    const [isDisable, setIsDisable] = useState(false);
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const [voiceOutputText, setVoiceOutputText] = useState('Recording...');
    const [popoverOpen, setPopoverOpen] = useState(false);
    const audioRef = useRef(null);
    const {fileManagerUpdate} = useFileManagerUpdate();
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const togglePopover = () => {
        setPopoverOpen(!popoverOpen);
    };

    const closePopoverAfterDelay = (delay = 7500) => {
        setTimeout(() => {
            setPopoverOpen(false);
        }, delay);
    };

    const startRecording = async () => {
        setPopoverOpen(true);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log('Your browser does not support audio recording.');
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = sendAudio;
        mediaRecorderRef.current.start();

        setRecording(true);

        setTimeout(() => {
            stopRecording();
        }, 5000);
    };

    const stopRecording = async (state=false) => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const sendAudio = async () => {
        setIsDisable(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const cstream = streamRef.current;
        if (cstream) {
            cstream.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setVoiceOutputText('Analyzing...');
        const formData = new FormData();
        formData.append("email", cookies.userInfo.email);
        formData.append("uid", cookies.userInfo.uid);
        formData.append("loginAuth", cookies.userInfo.loginAuth);
        formData.append('voice', audioBlob);

        try {
            const response = await fetch('http://127.0.0.1:8000/voiceTransform', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setVoiceOutputText(`Your input is: '${data["text"]}'<br />Ai Analyzing...`);
            analyzeText(data["text"]);
            console.log(data);
        } catch (error) {
            console.error('Error sending audio:', error);
            setVoiceOutputText(`Error sending audio: ${error}`);
        }
    };

    const analyzeText = async (text) => {
        const formData = new FormData();
        formData.append("email", cookies.userInfo.email);
        formData.append("uid", cookies.userInfo.uid);
        formData.append("loginAuth", cookies.userInfo.loginAuth);
        formData.append('text', text);
        const response = await fetch('http://127.0.0.1:8000/voiceAnalysis', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (data["status_code"] !== 200 && data["status_code"] !== 201) {
            setVoiceOutputText(`Error analyzing text: ${data["detail"]}`);
            console.error('Error analyzing text:', data["detail"]);
            setIsDisable(false);
            return;
        }
        setIsDisable(false);
        console.log(data);
        if (data["status_code"] == 200){
            setVoiceOutputText(`${data["state"]["text"]}`);
            voiceOperation(data["state"]);
        }
        else 
            setVoiceOutputText(`${data["text"]}`);
        
        if (hasAudio) {
            setHasAudio(`http://127.0.0.1:8000/tts_files/Response.mp3?${new Date().getTime()}`);
            if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            }
        }
        else {
            setHasAudio(`http://127.0.0.1:8000/tts_files/Response.mp3?${new Date().getTime()}`);
        }
        closePopoverAfterDelay();
    }

    const voiceOperation = async (state) => {
        console.log(state);
        switch (state["operation"]) {
            case 0:
                const fileInfo = {
                    fileId: state["fileid"],
                    fileName: state["filename"],
                  };
                navigate('/preview', { replace: true, state: {fileInfo: fileInfo} });
                break;
            case 1:
                fileManagerUpdate.toTrash(state["fileid"], true);
                break;
            case 2:
                navigate('/', { replace: true, state: {ocr: state["fileid"]} });
                break;
            case 3:
                const articleLink = document.createElement("a");
                articleLink.href = state["link"];
                articleLink.target = "_blank";
                articleLink.click();
                break;
            case 4:
                navigate('/search', { replace: true, state: {title: state["keyword"]} });
                break;
            case 5:
                navigate('/', { replace: true, state: {tts: state["fileid"]} });
                break;
            default:
                break;
        }
    }

    return (
        <div className="voice-assistant-container">
            <Col className='text-center text-lg-end'>
                <Button
                    id="VoiceAssistantClick"
                    className='btn btn-round btn-icon btn-lg btn-primary'
                    color='primary'
                    onClick={() => {
                        setVoiceOutputText('Recording...');
                        if(!recording){
                            startRecording();
                            setPopoverOpen(true);
                        }
                        else {
                            stopRecording();
                        }
                        
                    }}
                    disabled={isDisable}
                >
                    {!recording && <Icon name="mic"></Icon>}
                    {recording && <Icon name="forward"></Icon>}
                </Button>
                {hasAudio && <audio ref={audioRef} style={{ display: 'none' }} src={hasAudio} autoPlay />}
                <Popover
                    placement="left"
                    target="VoiceAssistantClick"
                    isOpen={popoverOpen}
                    toggle={togglePopover}
                >
                    <PopoverHeader>
                        <div id="voiceOutputHeader">Voice Assistant
                        <a id="voiceOutputClose" href="#close" className="close text-end" onClick={togglePopover}>
                            <Icon name="cross-sm"></Icon>
                        </a></div>
                        
                    </PopoverHeader>
                    <PopoverBody>
                        <div id="voiceOutputText" dangerouslySetInnerHTML={{ __html: voiceOutputText }} />
                    </PopoverBody>
                </Popover>
            </Col>
        </div>
    );
};

export default VoiceAssistant;
