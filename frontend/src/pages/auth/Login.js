import React, { useState, useEffect } from "react";
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
import { Form, Spinner, Alert } from "reactstrap";
import { set, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useCookies } from 'react-cookie';


const Login = () => {
  const [loading, setLoading] = useState(false);
  const [passState, setPassState] = useState(false);
  const [errorVal, setError] = useState("");
  const [cookie, setCookie] = useCookies(['userInfo']);
  const [successVal, setSuccessVal] = useState("");

  const onFormSubmit = async (formData) => {
    setLoading(true);
    try{
        const respone = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          setSuccessVal(`Successfully logged in. Welcome ${data['username']}, let go to the home page...`);
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
          }, 3000);
        }
        setLoading(false);
    }
    catch(e){
        console.error(e);
    }
  }

  useEffect(() => {
    const userInfo = cookie.userInfo ? cookie.userInfo : undefined;
    if (userInfo !== undefined) {
      window.history.pushState("","",`/`);
      window.location.reload();
    }
  });

  const {  register, handleSubmit, formState: { errors } } = useForm();

  return <>
    <Head title="Login" />
      <Block className="nk-block-middle nk-auth-body  wide-xs">
        <div className="brand-logo pb-4 text-center">
          <Link to={process.env.PUBLIC_URL + "/"} className="logo-link">
            <img className="logo-dark logo-img logo-img-lg" src={Logo} alt="logo" />
            <img className="logo-light logo-img logo-img-lg" src={LogoDark} alt="logo-dark" />
          </Link>
        </div>

        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h4">Sign-In</BlockTitle>
              <BlockDes>
                <p>Login to the SmartFavorites system.</p>
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
          <Form className="is-alter" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="Email">
                  Email
                </label>
              </div>
              <div className="form-control-wrap">
                <input
                  type="text"
                  id="Email"
                  {...register('email', { required: "This field is required" })}
                  placeholder="Enter your email address"
                  className="form-control-lg form-control" />
                {errors.email && <span className="invalid">{errors.email.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="Password">
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
                  id="Password"
                  {...register('password', { required: "This field is required" })}
                  placeholder="Enter your password"
                  className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`} />
                {errors.password && <span className="invalid">{errors.password.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <Button size="lg" className="btn-block" type="submit" color="primary">
                {loading ? <Spinner size="sm" color="light" /> : "Sign in"}
              </Button>
            </div>
          </Form>
          <div className="form-note-s2 text-center pt-4">
            New on our platform? <Link to={`${process.env.PUBLIC_URL}/register`}>Create an account</Link>
          </div>
        </PreviewCard>
      </Block>
      <AuthFooter />
  </>;
};
export default Login;
