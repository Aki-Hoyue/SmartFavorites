import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../images/logo-light.png";
import LogoDark from "../../images/logo-dark.png";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import {
  Block,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockTitle,
  Button,
  Icon,
  PreviewCard,
} from "../../components/Component";
import { Spinner, Alert } from "reactstrap";
import { set, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useCookies } from 'react-cookie';

const Register = () => {
  const [successVal, setSuccessVal] = useState("");
  const [passState, setPassState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorVal, setError] = useState("");
  const [cookie, setCookie] = useCookies(['userInfo']);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  
  const handleFormSubmit = async (formData) => {
    setLoading(true);
    try{
      const respone = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }),
      });
      const data = await respone.json();
      if (data['status_code'] !== 200) {
        setSuccessVal("");
        setError(`Cannot login with credentials: ${data['detail']}`);
        console.error(data['detail']);
      }
      else {
        setError("");
        setSuccessVal(`Successfully registered. Welcome ${data['username']}, let go to the home page...`);
        const userinfo = {
          name: data['username'],
          email: data['email'],
          uid: String(data['uid']),
          avatar: data['avatar'],
          loginAuth: data['auth']
        }
        const days = 3;
        setCookie('userInfo', JSON.stringify(userinfo), { path: '/', maxAge: days * 24 * 60 * 60 });
        setTimeout(() => {
          window.history.pushState(`${"/"}`,data['detail'],`${"/"}`);
          window.location.reload();
        }, 5000);
      }
      setLoading(false);
  }
  catch(e){
      console.error(e);
  }
  };

  useEffect(() => {
    const userInfo = cookie.userInfo ? cookie.userInfo : undefined;
    if (userInfo !== undefined) {
      window.history.pushState("","",`/`);
      window.location.reload();
    }
  });

  return <>
    <Head title="Register" />
      <Block className="nk-block-middle nk-auth-body  wide-xs">
        <div className="brand-logo pb-4 text-center">
          <Link to={`${process.env.PUBLIC_URL}/`} className="logo-link">
            <img className="logo-dark logo-img logo-img-lg" src={Logo} alt="logo" />
            <img className="logo-light logo-img logo-img-lg" src={LogoDark} alt="logo-dark" />
          </Link>
        </div>
        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h4">Register</BlockTitle>
              <BlockDes>
                <p>Create A New Account</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>
          {successVal && (
            <div class="alert alert-success alert-icon mb-3">
              <em class="icon ni ni-check-circle"></em> 
              {successVal}
            </div>
          )}
          {errorVal && (
            <div className="mb-3">
              <Alert color="danger" className="alert-icon">
                <Icon name="alert-circle" /> {errorVal}
              </Alert>
            </div>
          )}
          <form className="is-alter" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <div className="form-control-wrap">
                <input
                  type="text"
                  id="username"
                  {...register('username', { required: true })}
                  placeholder="Enter your Username"
                  className="form-control-lg form-control" />
                {errors.username && <p className="invalid">This field is required</p>}
              </div>
            </div>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
              </div>
              <div className="form-control-wrap">
                <input
                  type="text"
                  bssize="lg"
                  id="email"
                  {...register('email', { required: true })}
                  className="form-control-lg form-control"
                  placeholder="Enter your email address" />
                {errors.email && <p className="invalid">This field is required</p>}
              </div>
            </div>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="form-control-wrap">
                <a
                  href="#password"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setPassState(!passState);
                  }}
                  className={`form-icon lg form-icon-right passcode-switch ${passState ? "is-hidden" : "is-shown"}`}
                >
                  <Icon name="eye" className="passcode-icon icon-show"></Icon>

                  <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                </a>
                <input
                  type={passState ? "text" : "password"}
                  id="password"
                  {...register('password', { required: "This field is required" })}
                  placeholder="Enter your password"
                  className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`} />
                {errors.password && <span className="invalid">{errors.password.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <Button type="submit" color="primary" size="lg" className="btn-block">
                {loading ? <Spinner size="sm" color="light" /> : "Register"}
              </Button>
            </div>
          </form>
          <div className="form-note-s2 text-center pt-4">
            {" "}
            Already have an account?{" "}
            <Link to={`${process.env.PUBLIC_URL}/login`}>
              <strong>Sign in instead</strong>
            </Link>
          </div>
        </PreviewCard>
      </Block>
      <AuthFooter />
  </>;
};
export default Register;
