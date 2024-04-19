import React, { useState } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { Formik, Form } from 'formik'
import * as Yup from "yup"
import RegisterInput from './RegisterInput'
import { useMediaQuery } from 'react-responsive'
import axios from 'axios'
import DotLoader from 'react-spinners/DotLoader'
import Cookies from 'js-cookie'
import Registered from './Registered'

function RegisterForm({ setVisible }) {
    // const dispatch = useDispatch(),
    let user_data = null

    // constants
    const userInfo = {
            username: '',
            email: '',
            password: '',
        },
        [user, setUser] = useState(userInfo),
        {
            username,
            email,
            password,
        } = user,
        handleRegister = e => {
            const { name, value } = e.target
            setUser({ ...user, [name]: value })
            console.log(user)
        },
        // use yup to validate the inputs
        validateRegister = Yup.object({
            username: Yup.string()
                .required('需要输入用户名')
                .min(2, '用户名长度至少2个字符')
                .max(16, '用户名长度最多16个字符'),
            email: Yup.string()
                .required("用于登录和重置密码的邮箱地址")
                .email('请输入有效的邮箱地址'),
            password: Yup.string()
                .required("需要输入密码")
                .min(6, "密码长度至少6个字符")
                .max(36, "密码长度最多36个字符"),
        }),
        [error, setError] = useState(''),
        [success, setSuccess] = useState(''),
        [loading, setLoading] = useState(''),
        registerSubimit = async () => {
            try {
                setLoading(true)
                const { data } = await axios.post('http://localhost:8000/register',{username, email, password})
                //console.log(username, email, password)
                setError('')
                setSuccess(data.message)
                // storing the data in cookies for us to use in redux, even after the page refresh
                const { message, ...rest } = data
                user_data = rest
                // saving user data to use for activation 
                Cookies.set('user', JSON.stringify(rest))
            } catch(err) {
                setLoading(false)
                setSuccess('')
                setError(err.response.data.message)
            }
        },
        mobile = useMediaQuery({
            query: "(max-width: 820px)",
        })

    // end constants

    return (
        <div className='register_page'>
            <div className="register">
                <div className="register_header">
                    <h2 className='header_text'>注册</h2>
                    <div 
                        className="register_close"
                        onClick={() => {setVisible(false)}}
                    >
                        <CloseRoundedIcon />
                        </div>
                </div>
                <Formik 
                    enableReinitialize
                    initialValues={{
                        username,
                        email,
                        password,
                    }}
                    validationSchema = {validateRegister}
                    onSubmit = {() => {
                        registerSubimit()
                    }}
                >
                    {(formik) => (
                        <Form className='register_form'>
                            <RegisterInput 
                                type = "text"
                                name = "username"
                                placeholder = "请输入用户名"
                                onChange = {handleRegister}
                                errorPosition = { !mobile ? "right" : "bottom" }
                            />
                            <RegisterInput 
                                type = "text"
                                name = "email"
                                placeholder = "请输入邮箱"
                                onChange = {handleRegister}
                                errorPosition = { !mobile ? "left" : "bottom" }
                            />
                            <RegisterInput 
                                type = "password"
                                name = "password"
                                placeholder = "请输入密码"
                                onChange = {handleRegister}
                                errorPosition = { !mobile ? "right" : "bottom" }
                            />
                            <button type="submit" className='btn-primary'>
                                <DotLoader color="#fff" loading={loading} size={30} />
                                {!loading && <span>注册</span>}
                            </button>
                        </Form>
                    )}
                </Formik>
                {success && <Registered email={email} rest={user_data} />}
                <div className="error">
                    {error && <span className="err">{error}</span>}
                </div>
            </div>
        </div>
    )
}

export default RegisterForm