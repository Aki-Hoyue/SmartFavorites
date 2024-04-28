import React, { useLayoutEffect } from "react";
import { Routes,Route, useLocation } from "react-router-dom";

import Home from "../pages/Home";
import Files from "../pages/Files";
import Search from "../pages/Search";
import Starred from "../pages/Starred";
import Settings from "../pages/Settings";
import RSS from "../pages/RSS"
import Preview from "../pages/Preview";
import Error404Classic from "../pages/error/404-classic";
import Error404Modern from "../pages/error/404-modern";
import Error504Modern from "../pages/error/504-modern";
import Error504Classic from "../pages/error/504-classic";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Success from "../pages/auth/Success";

import Layout from "../layout/Index";
import LayoutApp from "../layout/Index-app";
import LayoutNoSidebar from "../layout/Index-nosidebar";
import RSSPage from "../pages/views/RSS";

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
          <Route path="auth-success" element={<Success />}></Route>
          <Route path="auth-reset" element={<ForgotPassword />}></Route>
          <Route path="register" element={<Register />}></Route>
          <Route path="login" element={<Login />}></Route>

          <Route path="errors">
            <Route path="404-modern" element={<Error404Modern />}></Route>
            <Route path="404-classic" element={<Error404Classic />}></Route>
            <Route path="504-modern" element={<Error504Modern />}></Route>
            <Route path="504-classic" element={<Error504Classic />}></Route>
          </Route>
          <Route path="*" element={<Error404Modern />}></Route>
        </Route>

      </Routes>
  );
};
export default Pages;
