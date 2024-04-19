import React, { useEffect, useState } from 'react'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import logincomplete from '../../images/login_complete.svg'
import Cookies from 'js-cookie'
import api from '../../api/api'
import Firestore from '../../helpers/Firestore'


export default function Registered({ email, rest }) {
    const [message, setMessage] = useState(''),
        [error, setError] = useState(''),
        user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
        sendVerification = async () => {
            try {
                const { data } = await api.post('/sendverification', {}, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    }
                })
                setMessage(data.message)
            } catch (err) {
                
                setError(err.response.data.message)
            }
        }

    useEffect(() => {
        // create a firestore collection for storage
        let task = Firestore('set', user.username, {
            capacity: 150000000,
            inUse: 0,
        })
        if(!task) {
            console.log('there was an error in firestore')
        }
        // eslint-disable-next-line
    }, [])    
    
    return (
        <div className='registered'>
        <div className="registered_logo">
                <AddToDriveIcon className='logo_icon' />
                <span className="text">网盘</span>
            </div>
            <div className="registered_ilustration">
                <img src={logincomplete} alt="thank you" />
            </div>
            <p className='registered_text'>
                <span>已完成注册</span>
                <span>我们已向您的邮箱发送了一封验证邮件，请注意查收</span>
                <span><small>{email}</small></span>
            </p>
            {!message && (
                <p className="re-send-email">
                    <span>未收到验证邮件？</span>
                    <a 
                        href="#resend"
                        onClick={() => {sendVerification()}}
                    > 重新发送验证邮件</a>
                    <br />
                </p>
            )}
            {message && (
                <p className="re-send-email" style={{textAlign: 'center'}}>
                    <span><small>我们已向您的邮箱重新发送了一封验证邮件，30分钟内有效</small></span>
                    <br />
                    <span><small>若您仍未收到验证邮件，请检查是否被归为垃圾邮件，或稍后尝试重新登录</small></span>
                    <br />
                    <span><small><a href="/login">登录</a></small></span>
                </p>
            )}
            {error && (
                 <p className="re-send-email" style={{textAlign: 'center', color: '#E56A6A90'}}>
                    <span><small>{error}</small></span>
                    <br />
                    <span><small><a href="/login">登录</a></small></span>
                </p>
            )}
        </div>
    )
}
