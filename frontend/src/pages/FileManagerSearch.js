import React from "react";
import Body from "./components/Body";
import Search from "./views/Search";

import { BlockTitle } from "../components/Component";
import Layout from "./components/Layout";

const FileManager = () => {
  return (
    <Layout title="Search Online">
      
      <Body searchOnline title={
          <BlockTitle page>Search Online</BlockTitle>
        }
      >
        <Search />
      </Body>
    </Layout>
  );
};

export default FileManager;
