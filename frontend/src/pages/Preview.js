import React from "react";
import Layout from "./components/Layout";
import Body from "./components/Body";
import { BlockTitle } from "../components/Component";
import Render from "./views/Render";

const Preview = () => {
    return (
        <Layout title="Preview">
            <Body title={
                    <BlockTitle page>Preview</BlockTitle>
                  }
            >
                <Render />
                </Body>
        </Layout>
    )
}

export default Preview;
