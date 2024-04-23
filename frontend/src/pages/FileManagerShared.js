import React from "react";
import Body from "./app/components/Body";
import Shared from "./app/views/Shared";
import { BlockTitle } from "../components/Component";
import Layout from "./app/components/Layout";

const FileManager = () => {
  return (
    <Layout>
      <Body searchBar 
        title={
          <BlockTitle page>Shared</BlockTitle>
        }
      >
        <Shared />
      </Body>
    </Layout>
  );
};

export default FileManager;
