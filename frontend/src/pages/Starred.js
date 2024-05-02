import React, { useEffect } from "react";
import Body from "./components/Body";
import Layout from "./components/Layout";
import Starred from "./views/Starred";
import { useCookies } from 'react-cookie';

import { BlockTitle } from "../components/Component";
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
    <Layout title="Starred">
      <Body searchBar 
        title={
          <BlockTitle page>Starred</BlockTitle>
        }
      >
        <Starred />
      </Body>
    </Layout>
  );
};

export default FileManager;
