import React from "react";
import EnglishFlag from "../../images/flags/english.png";
import SpanishFlag from "../../images/flags/spanish.png";
import FrenchFlag from "../../images/flags/french.png";
import TurkeyFlag from "../../images/flags/turkey.png";
import { Row, Col } from "../../components/Component";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Link } from "react-router-dom";

const AuthFooter = () => {
  return (
    <div className="nk-footer nk-auth-footer-full">
      <div className="container wide-lg">
        <Row className="g-3">
          <Col lg={6} className="order-lg-last">
            <ul className="nav nav-sm justify-content-center justify-content-lg-end">
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
          </Col>
          <Col lg="6">
            <div className="nk-block-content text-center text-lg-start">
              <p className="text-soft">&copy; 2024 SmartFavorites by <a href="https://github.com/Aki-Hoyue/SmartFavorites">Hoyue Group</a>.</p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default AuthFooter;
