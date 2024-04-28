import React from "react";
import Body from "./components/Body";
import RSS from "./views/RSS";

import { BlockTitle } from "../components/Component";
import Layout from "./components/Layout";

const FileManager = () => {
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
