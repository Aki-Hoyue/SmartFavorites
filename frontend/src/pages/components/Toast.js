import React, { useEffect, useState } from 'react';
import { Icon } from '../../components/Component';

const Toast = ({ text, icon = "alert-circle", showToast, setShowToast, time = 3, replay, setReplay }) => {
  const [progress, setProgress] = useState(100);
  const [currentText, setCurrentText] = useState(text);
  const [currentIcon, setCurrentIcon] = useState(icon);

  useEffect(() => {
    if (text !== currentText) {
      setCurrentText(text);
      setCurrentIcon(icon);
      setProgress(100);
    }
  }, [text, currentText]);

  useEffect(() => {
    let progressInterval;
    if (showToast) {
      setProgress(100);
      const intervalTime = (time / 100) * 1000;
      progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress <= 0) {
            clearInterval(progressInterval);
            setShowToast(false);
            return 100;
          }
          return prevProgress - 1;
        });
      }, intervalTime);
    } else {
      setProgress(100);
      setCurrentText('');
    }
    if (replay) {
      setCurrentText(text);
      setCurrentIcon(icon);
      setProgress(100);
      setReplay(false);
    }
    return () => clearInterval(progressInterval);
  }, [showToast, time, setShowToast, replay, setReplay, text, icon]);

  return (
    <React.Fragment>
      <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', top: '50px', width: '100%', right: '0' }}>
        <div className='toast-container position-absolute top-0 end-0 p-3'>
          <div className="toast show" style={{ opacity: showToast ? 1 : 0 }}>
            <div className="toast-header">
              <strong className="me-auto text-primary">Info</strong>
              <button type="button" className="close" data-dismiss="toast" aria-label="Close" onClick={() => setShowToast(false)}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="toast-body">
              <Icon name={currentIcon}></Icon>
              <span className={currentIcon == 'cross-circle' ? `text-danger` : ``}>{currentText}</span>
            </div>
            <div style={{ height: '5px', width: `${progress}%`, backgroundColor: 'lightblue' }}></div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Toast;
