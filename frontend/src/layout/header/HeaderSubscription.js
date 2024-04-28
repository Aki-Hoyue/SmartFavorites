import React, { useState } from "react";
import classNames from "classnames";
import Logo from "../logo/Logo";
import User from "./dropdown/user/UserSubscription";
import Notification from "./dropdown/notification/Notification";
import Toggle from "../sidebar/Toggle";
import { Link } from "react-router-dom";
import { Icon } from "../../components/Component";
import { useFileManagerUpdate } from "../../pages/components/Context";
import { useTheme, useThemeUpdate } from '../provider/Theme';

const Header = ({ fixed, className, ...props }) => {
  const theme = useTheme();
  const themeUpdate = useThemeUpdate();
  const headerClass = classNames({
    "nk-header": true,
    "nk-header-fixed": fixed,
    [`is-light`]: theme.header === "white",
    [`is-${theme.header}`]: theme.header !== "white" && theme.header !== "light",
    [`${className}`]: className,
  });

  const {fileManagerUpdate} = useFileManagerUpdate();

  return (
    <div className={headerClass}>
      <div className="container-lg wide-xl">
        <div className="nk-header-wrap">
          <div className="nk-header-brand">
            <Logo to={`${process.env.PUBLIC_URL}/subscription`} />
          </div>
          <div className="nk-header-tools">
            <ul className="nk-quick-nav">
              <li className="user-dropdown">
                <User />
              </li>
              <li className="notification-dropdown">
                <Notification />
              </li>
              <li className="d-lg-none">
                <a
                  href="#menu"
                  onClick={(ev) => {
                      ev.preventDefault();
                      fileManagerUpdate.asideVisibility();
                  }}
                  className="btn btn-trigger btn-icon toggle"
                  >
                      <Icon name="menu-alt-r"></Icon>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
