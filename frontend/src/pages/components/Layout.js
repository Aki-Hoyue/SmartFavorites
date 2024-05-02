import React from "react";
import { Link } from "react-router-dom";
import Content from "../../layout/content/Content";
import Head from "../../layout/head/Head";
import FileManagerAside from "./Aside";
import { useFileManager } from "./Context";
import { Icon, BlockHead, BlockBetween, BlockTitle, BlockHeadContent } from "../../components/Component";
import VoiceAssistant from "./VoiceAssistant";

const FileManagerLayout = ({...props}) => {
  const {fileManager} = useFileManager();
  return (
    <>
      <Head title={props.title}></Head>
      <Content>

        <div className="nk-fmg">
          <FileManagerAside  />
          <div className="nk-fmg-body" style={{minHeight:`${fileManager.contentHeight}px`}}>
            {props.children}
          </div>
        </div>
      </Content>
      
    </>
  );
};

export default FileManagerLayout;
