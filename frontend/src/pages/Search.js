import React, { useEffect } from "react";
import Body from "./components/Body";
import Search from "./views/Search";
import { useCookies } from 'react-cookie';
import { BlockTitle } from "../components/Component";
import Layout from "./components/Layout";

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
    <Layout title="Search Online">
      
      <Body searchOnline title={
          <BlockTitle page>Search Online</BlockTitle>
        }
      >
        <Search userInfo={cookies.userInfo}/>
      </Body>
    </Layout>
  );
};

export default FileManager;
