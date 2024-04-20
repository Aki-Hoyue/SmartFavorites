import { Link } from 'react-router-dom';

export default function Registered() {
    return (
        <div className='registered'>
            <p className='registered_status'>已完成注册</p>
            <p className='registered_text'>
                <Link to="/login">返回登录页面</Link>
            </p>
        </div>
    )
}