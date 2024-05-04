import React, { useState, useEffect } from "react";
import UserAvatar from "../../../../components/user/UserAvatar";
import { DropdownToggle, DropdownMenu, Dropdown } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { LinkList, LinkItem } from "../../../../components/links/Links";
import { useTheme, useThemeUpdate } from "../../../provider/Theme";
import { useCookies } from 'react-cookie';

const User = () => {
  const [cookies, , removeCookie] = useCookies(['userInfo']);
  const theme = useTheme();
  const themeUpdate = useThemeUpdate();
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const toggle = () => {
    themeUpdate.sidebarHide();
    setOpen((prevState) => !prevState)
  };

  const signOut = () => {
      removeCookie('userInfo', { path: '/' });
      window.history.pushState("","",`${"/login"}`);
      window.location.reload();
  };

  useEffect(() => {
    const userInfo = cookies.userInfo ? cookies.userInfo : undefined;
    if (userInfo === undefined) {
      window.history.pushState("","",`${"/login"}`);
      window.location.reload();
    }
    else {
      setAvatar(userInfo["avatar"]);
      setUsername(userInfo["name"]);
      setEmail(userInfo["email"]);
    }
  }, [cookies]);

  return (
    <Dropdown isOpen={open} className="user-dropdown" toggle={toggle}>
      <DropdownToggle
        tag="a"
        href="#toggle"
        className="dropdown-toggle"
        onClick={(ev) => {
          ev.preventDefault();
        }}
      >
        <div className="user-toggle">
          <UserAvatar image={avatar} className="sm" icon={avatar ? "" : "user-alt"} />
        </div>
      </DropdownToggle>
      <DropdownMenu end className="dropdown-menu-md dropdown-menu-s1">
        <div className="dropdown-inner user-card-wrap bg-lighter d-none d-md-block">
          <div className="user-card sm">
            <UserAvatar image={avatar} className="sm" icon={"user-alt"} />
            <div className="user-info">
              <span className="lead-text">{username}</span>
              <span className="sub-text">{email}</span>
            </div>
          </div>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <LinkItem link="/settings" icon="setting-alt" onClick={toggle}>
              Setting
            </LinkItem>
            <li>
              <a className={`dark-switch ${theme.skin === 'dark' ? 'active' : ''}`} href="#" 
              onClick={(ev) => {
                ev.preventDefault();
                themeUpdate.skin(theme.skin === 'dark' ? 'light' : 'dark');
              }}>
                {theme.skin === 'dark' ? 
                  <><em className="icon ni ni-sun"></em><span>Light Mode</span></> 
                  : 
                  <><em className="icon ni ni-moon"></em><span>Dark Mode</span></>
                }
              </a>
            </li>
          </LinkList>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <a href="#signout" onClick={signOut}>
              <Icon name="signout"></Icon>
              <span>Sign Out</span>
            </a>
          </LinkList>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default User;
