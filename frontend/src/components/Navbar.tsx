import React, { useEffect } from 'react'
import Button from '@mui/material/Button'
import LockIcon from '@mui/icons-material/Lock';
import PestControlOutlinedIcon from '@mui/icons-material/PestControlOutlined';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Cookies from 'js-cookie';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { Avatar, ListItem, ListItemIcon, ListItemText, MenuList, Paper } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';

type user = {
    username?: string;
    user_id?: number;
    exp?: number;
    iat?: string;
}

function Navbar() {
    const [user_info, setUserinfo] = useState<user>({});
    const token = Cookies.get('token');
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (e: any) => {
    setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => {
    setAnchorEl(null);
    };
    const getUser  = async () => {
        try {
            const res = await fetch('http://localhost:8080/getUserInfo', {
                method: 'GET',
                headers: {
                    "Authorization": token
                }
            })
            const data = await res.json()
            setUserinfo(data.payload)
        }
        catch(error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (token) {
            getUser()
        }
        console.log('token', token)
    }, [token])

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const validate = async () => {
        try {
            const res = await fetch('http://localhost:8080/validateUser', {
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
                if (data.statusCode === 200) {
                    Cookies.set('token', data.payload)
                    setIsLogin(false)
                    window.location.reload();
                } else {
                    alert('Invalid credentials')
                    setUsername('')
                    setPassword('')
                }
            }
        }
        catch(error) {
            console.log(error)
        }
    }

    const handleLogOff = () => {
        Cookies.remove('token')
        window.location.reload()
    }


    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);
    return (
        <div className='w-full h-fit pb-3 pt-3 flex justify-center items-center sticky top-0 bg-darkGray z-50'>
            <div className='flex flex-row w-full max-w-6xl px-4 h-full justify-between'>
                <div className='ml-3 flex items-center ' onClick={() => navigate(`/`)}>
                    <PestControlOutlinedIcon fontSize='large' className='text-sky-500'/>
                    <div className='ml-2 text-md lg:text-3xl font-bold text-white font-mono underline decoration-sky-500'>Bugs & Suggestions</div>
                </div>
                {Object.keys(user_info).length > 0 ? (
                    <div>
                        <div className='flex flex-row justify-between items-end'>

                            <div>
                                <IconButton onClick={() => navigate('/create')} >
                                    <AddIcon color='warning' sx={{ fontSize: 34}}/>
                                </IconButton>
                            </div>
                            <div>
                                <div className='flex items-center' id="basic-menu" onClick={handleMenuOpen}>
                                    <Avatar
                                        sx={{ width: 40, height: 40 }}
                                        alt={user_info?.username}
                                        src="/broken-image.jpg"
                                        className='border-2 border-sky-500 mb-2'
                                        />
                                    
                                </div>
                                
                                <Paper elevation={3} square={false}>

                                    <Menu
                                        id="basic-menu"
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        MenuListProps={{
                                        'aria-labelledby': 'basic-button', 
                                        }}
                                    >
                                        <MenuList className='bg-lightGray focus:outline-none'>
                                            <MenuItem className='bg-gray-300'>
                                            <div className='italic text-gray-400 '>
                                                @{user_info.username}
                                            </div>
                                            </MenuItem>
                                            <MenuItem onClick={handleLogOff}>

                                                <ListItemIcon>
                                                    <LockIcon fontSize="small" color='error'/>
                                                </ListItemIcon>
                                                <ListItemText className='font-extrabold text-gray-400'>
                                                    Logout
                                                </ListItemText>
                                            
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </Paper>
                    </div>
                        </div>
                    </div>
                ):(
                    <>
                        <Button variant='outlined' color='warning' onClick={() => setIsLogin(!isLogin)} startIcon={<LockIcon />} >Login </Button>
                        {isLogin && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="w-full max-w-[90%] lg:max-w-md  bg-darkGray rounded-xl p-6 w-96">
                                    <div className='flex justify-end'>
                                        <IconButton onClick={() => setIsLogin(!isLogin)} >
                                            <CloseIcon color='warning'/>
                                        </IconButton>
                                    </div>
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
                            
                        )}
                    </>    
                )}
            </div>
        </div>
    )
}

export default Navbar