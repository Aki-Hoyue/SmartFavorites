import React from "react";
import LogoLight2x from "../../images/logo2x.png";
import LogoDark2x from "../../images/logo-dark2x.png";
import { Link } from "react-router-dom";

const Logo = ({to}) => {
  return (
    <Link to={to ? to : `${process.env.PUBLIC_URL}/`} className="logo-link">
      <h3 className="logo-text">SmartFavorites</h3>
    </Link>
  );
};

export default Logo;
