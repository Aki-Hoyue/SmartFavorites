import React, { useEffect } from "react";
import Body from "./components/Body";
import RSS from "./views/RSS";
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
    <Layout title="RSS">
      
      <Body rss title={
          <BlockTitle page>RSS Feeds</BlockTitle>
        }
      >
        <RSS />
      </Body>
    </Layout>
  );
};

export default FileManager;
