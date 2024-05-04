import React, { useLayoutEffect } from "react";
import { Routes,Route, useLocation } from "react-router-dom";

import Home from "../pages/Home";
import Files from "../pages/Files";
import Search from "../pages/Search";
import Starred from "../pages/Starred";
import Settings from "../pages/Settings";
import RSS from "../pages/RSS"
import Preview from "../pages/Preview";
import Error404 from "../pages/error/404";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import LayoutApp from "../layout/Index-app";
import LayoutNoSidebar from "../layout/Index-nosidebar";

const Pages = () => {
  const location = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
      <Routes>
        
        <Route path={`${process.env.PUBLIC_URL}`} element={<LayoutApp />}>
          <Route index element={<Home />}></Route>
          <Route path="files" element={<Files />}></Route>
          <Route path="starred" element={<Starred />}></Route>
          <Route path="search" element={<Search />}></Route>
          <Route path="rss" element={<RSS />}></Route>
          <Route path="settings" element={<Settings />}></Route>
          <Route path="preview" element={<Preview />}></Route>
        </Route>

        <Route path={`${process.env.PUBLIC_URL}`} element={<LayoutNoSidebar />}>
          <Route path="register" element={<Register />}></Route>
          <Route path="login" element={<Login />}></Route>

        
        <Route path="*" element={<Error404 />}></Route>
        </Route>

      </Routes>
  );
};
export default Pages;
