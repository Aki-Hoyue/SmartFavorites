import React from "react";
import { Link } from "react-router-dom";
import VoiceAssistant from "../../pages/components/VoiceAssistant";

const Footer = () => {
  return (
    <>
    <VoiceAssistant />
    <div className="nk-footer">
      <div className="container-fluid">
        <div className="nk-footer-wrap">
          <div className="nk-footer-copyright">
            {" "}
            <p className="text-soft">&copy; 2024 SmartFavorites by <a href="https://github.com/Aki-Hoyue/SmartFavorites">Hoyue Group</a>.</p>
          </div>
          <div className="nk-footer-links">
            <ul className="nav nav-sm">
              <li className="nav-item">
                <Link to={`${process.env.PUBLIC_URL}/documents`} className="nav-link">
                  Documents
                </Link>
              </li>
              <li className="nav-item">
                <Link to={`https://hoyue.fun`} className="nav-link">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
export default Footer;
