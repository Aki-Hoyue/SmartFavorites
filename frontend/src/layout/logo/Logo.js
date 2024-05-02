import React from "react";
import LogoLight2x from "../../images/logo-light2x.png";
import LogoDark2x from "../../images/logo-dark2x.png";
import Fav from "../../images/fav.png";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";

const Logo = ({to}) => {
  return (
    <Link to={to ? to : `${process.env.PUBLIC_URL}/`} className="logo-link">
      <Row>
        <Col md="3">
          <img className="logo-img w-100 h-auto" src={Fav} alt="logo" />
        </Col>
        <Col md="5">
          <h3 className="logo-text">SmartFavorites</h3>
        </Col>
      </Row>
    </Link>
  );
};

export default Logo;
