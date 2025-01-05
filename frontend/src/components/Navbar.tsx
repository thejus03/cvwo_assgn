import React from 'react'
import Button from '@mui/material/Button'
import LockIcon from '@mui/icons-material/Lock';
import PestControlOutlinedIcon from '@mui/icons-material/PestControlOutlined';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './Login';

function Navbar() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);
    return (
        <div className='w-full h-fit pb-3 pt-3 flex justify-center items-center sticky top-0 bg-darkGray z-50'>
            <div className='flex flex-row w-full max-w-6xl px-4 h-full justify-between'>
                <div className='ml-3 flex items-center ' onClick={() => navigate(`/`)}>
                    <PestControlOutlinedIcon fontSize='large' className='text-sky-500'/>
                    <div className='ml-2 text-md lg:text-3xl font-bold text-white font-mono underline decoration-sky-500'>Bugs & Suggestions</div>
                </div>
                <Button variant='outlined' color='warning' onClick={() => setIsLogin(!isLogin)} startIcon={<LockIcon />} >Login </Button>
                {isLogin && (
                    <Login />
                )}
            </div>
        </div>
    )
}

export default Navbar