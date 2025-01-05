import LockIcon from '@mui/icons-material/Lock';
import Button from '@mui/material/Button'
import { useState } from 'react';
import Cookies from 'js-cookie';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const validate = async () => {
        try {
            console.log(username)
            console.log(password)
            const res = await fetch('http://192.168.200.224:8080/validateUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: username,
                    password: password}),
            })
            if (res.ok) {
                const data = await res.json();
                Cookies.set('token', data.payload)
            }
        }
        catch(error) {
            console.log(error)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="w-full max-w-[90%] lg:max-w-md  bg-darkGray rounded-xl p-6 w-96">
                <div className="text-2xl font-bold mb-4 text-gray-400">Welcome back,</div>
                <div className='mx-3 mt-4'>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className='w-full p-2 rounded-xl focus:outline-none bg-lightGray text-sky-600 focus' placeholder='Username' />
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className='w-full p-2 rounded-xl focus:outline-none bg-lightGray text-sky-600 mt-7' placeholder='Password' />
                </div>
                <div className='mt-5'>
                    <Button variant='outlined' onClick={validate} color='warning' startIcon={<LockIcon />} >Login </Button>
                </div>
                <div className='h-[2px] mt-5 w-full bg-white'></div>
                <div className='mt-5 text-center text-gray-400'>Don't have an account? <span className='text-sky-500 cursor-pointer'>Sign up</span></div>
            </div>
        </div>

  )
}

export default Login