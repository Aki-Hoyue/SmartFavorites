import React, { useEffect } from "react";
import Body from "./components/Body";
import AllFiles from "./views/AllFiles";
import { BlockTitle } from "../components/Component";
import Layout from "./components/Layout";
import { useCookies } from 'react-cookie';

const FileManager = () => {
  const [cookies] = useCookies(['userInfo']);
   useEffect(() => {
      const userInfo = cookies.userInfo ? cookies.userInfo : undefined;
      if (userInfo === undefined) {
        window.history.pushState("","",`${"/login"}`);
        window.location.reload();
      }
      
    });
  return (
    <Layout title="Files">
      <Body searchBar viewFilter
        title={
          <BlockTitle page>Files</BlockTitle>
        }
      >
        <AllFiles userInfo={cookies.userInfo}/>
      </Body>
    </Layout>
  );
};

export default FileManager;
