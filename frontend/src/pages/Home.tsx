import React from 'react'
import Navbar from '../components/Navbar'
import SearchIcon from '@mui/icons-material/Search';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import {IconArrowBigUp, IconArrowBigDown, IconMessageCircle, IconArrowBigUpFilled, IconArrowBigDownFilled} from '@tabler/icons-react';
import { Chip } from '@mui/material';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollRestoration, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

type Post = {
    id: number;
    title: string;
    description: string;
    upvotes: any;
    downvotes: any;
    metadata: {
        user: {
            id: number;
            name: string;
        }
        tags: any;
    }
    comments: any;
    created_at: string;
}

function Home() {
    const [data, Setdata] = useState<Post[]>([]);
    const navigate = useNavigate();
    const token = Cookies.get('token');
    const [username, setUsername] = useState('');
    const [user_id, setUser_id] = useState(-1);
    // get all posts from backend
    useEffect(() => {
        
        const fetchPosts = async () => {
            try {

                const res = await fetch("http://192.168.200.224:8080/getAllPosts", {
                    method: 'GET',
                    headers: {
                       'Content-Type': 'application/json',
                    }
                });
        
                if (!res.ok) {
                    console.error('Error fetching posts');
                }
                const data = await res.json();
                if (data.statusCode === 200) {
                    Setdata(data.payload);
                }
                console.log(data.payload);
            } catch (error) {
                console.error('Error fetching posts', error);
            }
        }
        const fetchUser = async () => {
            try {
                const res = await fetch('http://192.168.200.224:8080/getUserInfo', {
                    method: 'GET',
                    headers: {
                        "Authorization": token
                    }
                })
                const data = await res.json()
                if (data.statusCode === 200) {
                    console.log(data.payload);
                    setUsername(data.payload.username);
                    setUser_id(data.payload.user_id);
                }
            }
            catch(error) {
                console.error(error)
            }
        }
        fetchUser()
        fetchPosts();
    }, []);
    
    const HandleVotePost = async (post:any, user_id:number, vote_type:string) => {
        const SendInfo = async (vote:string )=> {

            try {
                const res = await fetch("http://192.168.200.224:8080/HandleVotePost", {
                    method: 'POST',
                    headers: {
                        'Authorization': token
                    },
                    body: JSON.stringify({
                        postid: post.id,
                        userid: user_id,
                        votetype: vote
                    })
                    
                });
                const json_data = await res.json() 
                if (json_data.statusCode != 200) {
                    console.log('Access token incorrect');
                    return
                }
                for (let i=0; i < data.length; i++) {
                    if (data[i].id === post.id) {
                        if (vote === 'upvote') {
                            data[i].upvotes[user_id] = true;
                            delete data[i].downvotes[user_id];
                        } else if (vote === 'downvote') {
                            data[i].downvotes[user_id] = true;
                            delete data[i].upvotes[user_id];
                        } else if (vote === 'removeupvote') {
                            delete data[i].upvotes[user_id];
                        } else if (vote === 'removedownvote') {
                            delete data[i].downvotes[user_id];
                        } else {
                            console.error('Invalid vote type');
                        }
                        break
                    }
                }
                Setdata([...data]);
            }
            catch (error) {
                console.error('Error voting post', error);
            }
        }

        if (vote_type === 'upvote') {
            if (user_id in post.downvotes) {
                await SendInfo("removedownvote");
            } 
            await SendInfo("upvote");
        } else if (vote_type === 'downvote') {
            if (user_id in post.upvotes) {
                await SendInfo("removeupvote");
            } 
            await SendInfo("downvote");
        } else {
            await SendInfo(vote_type);
        }
    }

    return (
        <div className='bg-darkGray text-white min-h-screen'>
            <ScrollRestoration />
            <Navbar />
            <div className='flex flex-col justify-center w-full max-w-7xl mx-auto h-full'>
                <div className='w-full mx-auto mt-5'>
                    <SearchIcon className='absolute mt-[13px] ml-4 text-gray-500'/>
                    <input type='text' placeholder='Search for anything' className='w-full max-w-[350px] lg:max-w-[650px] h-12 p-4 border-2 border-sky-700 rounded-full bg-darkGray hover:bg-lightGray hover:border-sky-600 text-white pl-12 focus:outline-none'/>
                </div> 
                <div className='flex flex-col mt-10 justify-center items-center mb-10'>
                    {data?.map((post, index) => (
                        <div className='w-full max-w-[95dvw] lg:max-w-[900px] '>
                            <Divider className='bg-gray-700'/>
                            <div className='max-h-[300px] my-1 pb-3 rounded-3xl hover:bg-lightGray p-1' onClick={(e) => {
                                if (!e.defaultPrevented) {
                                    navigate(`/post/${post.id}`)}
                                } 
                            }>
                                <div className='flex flex-row justify-between pt-2 items-start'>
                                    <div className="flex flex-row ">
                                        <div className='text-md font-bold text-gray-400 lg:text-xl text-left mx-5 overflow-wrap line-clamp-2'>{post.title}</div>
                                    </div>
                                    <div className='text-xs text-gray-400 px-5'>@{post.metadata.user.name}</div> 
                                </div>

                                <div className='text-s text-left mx-5 mt-2 line-clamp-4 text-gray-300'>{post.description}</div>
                                {post.metadata.tags && (
                                    <div className='flex flex-row mx-5 mt-2 text-lightGray'>
                                        {post.metadata.tags.map((tag: any) => (
                                           <Chip key={tag.id} label={tag.name} className='m-1' variant="outlined" color="info" size='small' /> 
                                        ))}
                                    </div>
                                )}
                                <div className='flex flex-row justify-between items-center'>
                                    <div className='flex flex-row justify-center items-center'>
                                        <div className="flex w-fit rounded-full px-1 py-0.5 mx-5 mt-2 items-center justify-center bg-lightGray shadow-sm" onClick={(e) => {e.preventDefault()}}>
                                            <div>
                                                <IconButton aria-label="upvote" color="warning" onClick={() => console.log(post.id)} >
                                                { user_id in (post?.upvotes || {}) ? (
                                                    <IconArrowBigUpFilled size={18} className="text-orange-700" onClick={() => {HandleVotePost(post, user_id, "removeupvote")}}/>
                                                    ) : (
                                                        <IconArrowBigUp size={18} className="text-gray-500 hover:text-orange-700" onClick={() =>{HandleVotePost(post, user_id, "upvote")}}/>
                                                    )
                                                }
                                                </IconButton>
                                            </div>
                                            <div className="text-xs text-gray-300 font-bold mr-2 font-extrabold ">{Object.keys(post.upvotes).length - Object.keys(post.downvotes).length}</div>
                                            <Divider orientation="vertical" variant='middle' flexItem className='bg-gray-400' />
                                            <div>
                                                {user_id in (post?.downvotes || {}) ? (
                                                    <IconButton aria-label="comments" color="secondary" onClick={() => HandleVotePost(post, user_id, "removedownvote")} >
                                                        <IconArrowBigDownFilled size={18} className='text-violet-500'/>
                                                    </IconButton>
                                                    ) : (
                                                        <IconButton aria-label="comments" color="secondary" onClick={() =>HandleVotePost(post, user_id, "downvote")} >
                                                            <IconArrowBigDown className="text-gray-500 hover:text-violet-500" size={18} />
                                                        </IconButton>
                                                )}
                                            </div>
                                        </div>
                                        <div className='flex rounded-full px-2 py-2 mt-2 items-center justify-center bg-lightGray shadow-sm text-xs text-gray-400 hover:bg-darkGray' onClick={(e) => {e.preventDefault()}}>
                                            <IconMessageCircle size={19} className='ml-1'/>
                                                <div className='mx-2 font-extrabold'>{Object.keys(post?.comments || {}).length}</div>
                                        </div>
                                    </div>
                                    <div className='px-5'>
                                        <div className='text-xs text-gray-400'>{formatDistanceToNow(new Date(post.created_at), {addSuffix: false})} ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}                    
                </div>
            </div>
        </div>
    )
}

export default Home