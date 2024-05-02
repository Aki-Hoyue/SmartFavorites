import React, { useEffect } from "react";
import Body from "./components/Body";
import Home from "./views/Home";
import Layout from "./components/Layout";
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
    <Layout title="Home">
      <Body searchBar 
        title={
          <BlockTitle page>Home</BlockTitle>
        }
      >
        <Home />
      </Body>
    </Layout>
  );
};

export default FileManager;
