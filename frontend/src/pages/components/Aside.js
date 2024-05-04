import React, { useRef, useEffect }  from "react";
import SimpleBar from "simplebar-react";
import data from "../Data";
import { Icon } from "../../components/Component";
import { Link } from "react-router-dom";
import { useFileManager, useFileManagerUpdate } from "./Context";

const FileManagerAside = ({...props}) =>  {
  const {fileManager} = useFileManager();
  const {fileManagerUpdate} = useFileManagerUpdate();

  const asideWrap = useRef(null)

  useEffect(() => {
    fileManagerUpdate.contentHeight(asideWrap.current.clientHeight + 10);
  }, [asideWrap.current]);

  return (
    <React.Fragment>
      <SimpleBar className={`nk-fmg-aside toggle-screen-lg ${fileManager.asideVisibility ? "content-active" : ""}`}>
        <div className="nk-fmg-aside-wrap">
          <div ref={asideWrap}>
            <SimpleBar className="nk-fmg-aside-top">
              <ul className="nk-fmg-menu">
                {data.navigation.map((item) => (
                  <li
                    key={item.id}
                    onClick={(ev) => {
                      ev.preventDefault();
                      fileManagerUpdate.asideHide();
                    }}
                    className={`${
                      window.location.pathname === `${process.env.PUBLIC_URL}${item.link}` ? "active" : ""
                    }`}
                  >
                    <Link className="nk-fmg-menu-item" to={`${process.env.PUBLIC_URL}${item.link}`}>
                      <Icon name={item.icon}></Icon>
                      <span className="nk-fmg-menu-text">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </SimpleBar>
          </div>
        </div>
      </SimpleBar>
      {fileManager.asideVisibility && <div className="toggle-overlay" 
      onClick={(ev) => {
        ev.preventDefault();
        fileManagerUpdate.asideVisibility();
      }}></div>}
    </React.Fragment>
  );
};

export default FileManagerAside;
