import { Formik, Form } from 'formik'
import { Link } from "react-router-dom"
import * as Yup from "yup"
import DotLoader from "react-spinners/DotLoader"
import { useMediaQuery } from "react-responsive"
import React, { useState } from 'react'
import LoginInput from './LoginInput'
import Cookies from 'js-cookie'
import axios from 'axios'
// redux
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function LoginForm() {
    const dispatch = useDispatch(),
    navigate = useNavigate(),
    loginInfo = {
        email: '',
        password: '',
    },
    [login, setLogin] = useState(loginInfo),
    { email, password } = login,
    handleLogin = (e) => {
        const { name, value } = e.target 
        setLogin({...login, [name] : value})
    },
    validateLogin = Yup.object({
        email: Yup.string()
            .required('需要输入邮箱')
            .email('请输入有效的邮箱')
            .max(100),
        password: Yup.string()
            .required("需要填写密码")
            .min(6, "密码长度至少6位")
            .max(36, "密码长度最多36位"),
    }),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    loginSubmit = async () => {
        setLoading(true)
        const { data } = await axios.post('http://localhost:8000/login', {email, password})
        if (data['status_code'] === 200) 
        {
            dispatch({type: 'LOGIN', payload: data})
            Cookies.set('user', JSON.stringify(data))
            navigate('/mydrive')
        }
        else {
            setError(data['detail'])
        }
    },
    mobile = useMediaQuery({
        query: "(max-width: 820px)",
    })
    return (
        <>
            <Formik
                enableReinitialize
                initialValues={{
                    email,
                    password,
                }}
                validationSchema={validateLogin}
                onSubmit={() => {
                    loginSubmit()
                }}
            >
                {(formik) => (
                    <Form>
                        <LoginInput 
                            type = "text"
                            name = "email"
                            placeholder = " 请输入邮箱"
                            onChange = {handleLogin}
                            errorPosition = { !mobile ? "left" : "" }
                        />
                        <LoginInput 
                            type = "password"
                            name = "password"
                            placeholder = "请输入密码"
                            onChange = {handleLogin}
                            errorPosition = { !mobile ? "left" : "bottom" }
                        />
                        <Link to="/forgot" className="forgot_password">
                            忘记密码?
                        </Link>
                        <button type="submit" className="btn-primary">
                            <DotLoader color="#fff" loading={loading} size={30} />
                            {!loading && <span>登录</span>}
                        </button>
                    </Form>
                )}
            </Formik>
            <div className="error">
                {error && <span className="err">{error}</span>}
            </div>
        </>
    )
}

export default LoginForm