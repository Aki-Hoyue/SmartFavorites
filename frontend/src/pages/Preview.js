import React, { useEffect } from "react";
import Layout from "./components/Layout";
import Body from "./components/Body";
import { BlockTitle } from "../components/Component";
import Render from "./views/Render";
import { useCookies } from 'react-cookie';

const Preview = () => {
    const [cookies] = useCookies(['userInfo']);
    useEffect(() => {
      const userInfo = cookies.userInfo ? cookies.userInfo : undefined;
      if (userInfo === undefined) {
        window.history.pushState("","",`${"/login"}`);
        window.location.reload();
      }
      
    });
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
