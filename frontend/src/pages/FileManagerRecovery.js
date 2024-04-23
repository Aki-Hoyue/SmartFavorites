import React from "react";
import Body from "./app/components/Body";
import Recovery from "./app/views/Recovery";

import { BlockTitle } from "../components/Component";
import Layout from "./app/components/Layout";

const FileManager = () => {
  return (
    <Layout>
      <Body searchBar recoveryFilter
        title={
          <BlockTitle page>Recovery</BlockTitle>
        }
      >
        <Recovery />
      </Body>
    </Layout>
  );
};

export default FileManager;
