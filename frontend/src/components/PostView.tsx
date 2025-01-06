import React, { useRef } from 'react'
import Navbar from './Navbar';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Chip, Divider } from '@mui/material';
import {IconArrowBigUp, IconArrowBigDown, IconMessageCircle, IconArrowBigUpFilled, IconArrowBigDownFilled, IconArrowLeft } from '@tabler/icons-react';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Cookies from 'js-cookie';

type Post = {
    id?: number;
    title?: string;
    description?: string;
    upvotes?: any;
    downvotes?: any;
    metadata?: {
        user?: {
            id: number;
            name: string;
        }
        tags?: any;
    }
    comments?: any;
    created_at?: string;
}

type Comment = {
    id?: number;
    user_id?: number;
    created_at?: string;
    description?: string;
    reply_id?: number;
    metadata?: {
        user?: {
            id: number;
            name: string;
        }
    }
}

function PostView() {
    const { postid } = useParams();
    const [post, setPost] = useState<Post>({});
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentState, setCommentState] = useState(true);
    const [text, setText] = useState('');
    const [reply, setReply] = useState<Comment>({});
    const [edit, setEdit] = useState<Comment>({});
    const navigate = useNavigate(); 
    const token = Cookies.get('token')
    const [username, setUsername] = useState('');
    const [user_id, setUser_id] = useState(-1);

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
                
                const data = await res.json() 
                if (data.statusCode != 200) {
                    console.log('Access token incorrect');
                    return
                }
               
                if (vote === 'upvote') {
                    post.upvotes[user_id] = true;
                    delete post.downvotes[user_id];
                } else if (vote === 'downvote') {
                    post.downvotes[user_id] = true;
                    delete post.upvotes[user_id];
                } else if (vote === 'removeupvote') {
                    delete post.upvotes[user_id];
                } else if (vote === 'removedownvote') {
                    delete post.downvotes[user_id];
                } else {
                    console.error('Invalid vote type');
                }

                setPost({...post});
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
    const fetchPost = async () => {
        try{
            const res = await fetch(`http://192.168.200.224:8080/getPostByID`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({id: postid}),
            });
            const data  = await res.json();
            console.log(data.payload)
            setPost(data.payload);
            setComments(data.payload.comments);
        }
        catch(err) {
            console.error(err);
        }
    }
    
    useEffect(() => {
        fetchUser();
        fetchPost(); 
        setTimeout(() => {
            document.getElementById('scroller')?.scrollIntoView();
            window.scrollTo(0,0)
        }, 100)
    }, []);

    const clickComment = () => {
        if (token === undefined) {
            console.log('not logged in')
            return 
        }
        setCommentState(!commentState);
        setReply({});
        setEdit({});
    }

    const handleComment = async () => {
        
        try {
            if (Object.keys(edit).length > 0) {
                const res = await fetch("http://192.168.200.224:8080/updateComment", {
                    method: 'POST',
                    headers: {
                        'Authorization': token,
                    },
                    body: JSON.stringify({
                        id: edit.id,
                        description: text
                    })
                });
                // Basically update the comments in the array if id matches
                setComments(comments.map((c: any) => c.id === edit.id ? {...c, description: text} : c));
            } else {

                const res = await fetch("http://192.168.200.224:8080/createComment", {
                    method: 'POST',
                    headers: {
                        'Authorization': token,
                    },
                    body: JSON.stringify({
                        postid: post.id,
                        user_id: 2,
                        description: text,
                        replyid: reply.id || -1
                    })
                });
                const data = await res.json();
                setComments(data.payload);
            }
        }
        catch (error) {
            console.error('Error creating comment', error);
        }
    }

    const handleReply = (reply_id: number)=> {
        var replied_comment = comments.find((c: any) => c.id === reply_id);
        setReply(replied_comment);
        setCommentState(false);
    }

    const handleDelete = async (comment_id: number) => {
        try {
            const res = await fetch("http://192.168.200.224:8080/deleteComment",{
                method: 'POST',
                headers: {                
                    "Authorization": token
                },
                body: JSON.stringify({id: comment_id})
            })
            if (res.ok) {
                setComments(comments.filter((c: any) => c.id !== comment_id));
            }
        }
        catch(error) {
            console.error('Error deleting comment', error)
        }
    }

    const handleEdit = (comment_id: number) => {
        var comment = comments.find((c: any) => c.id === comment_id);
        setEdit(comment);
        setText(comment.description);
        setCommentState(false);
    }
    return (
        <div className='bg-darkGray text-white min-h-screen' id='scroller'>
            <Navbar />
            <div className='flex flex-col justify-center w-full max-w-5xl mx-auto h-full'>
                <div className='mt-7 flex flex-col items-start px-5 pb-10'>
                    <div className='flex flex-row items-center'>
                        <div className='mr-1'>
                            <IconButton aria-label="comments" color="info" onClick={() => navigate("/")} >
                                <IconArrowLeft size={20} className='text-gray-300'/>
                            </IconButton>
                        </div>
                        <div className='text-xs text-left text-gray-400'>Posted by @{post?.metadata?.user?.name}</div>
                        <div className='mx-1.5 text-gray-400'>•</div>
                        <div className='text-xs text-left text-gray-400'>{formatDistanceToNow(new Date(post?.created_at || 0), {addSuffix: false})} ago</div>
                    </div>
                    <div className='text-left text-lg lg:text-3xl font-bold  mb-5 tracking-wide'>{post?.title}</div>
                    <div>
                        {post?.metadata?.tags && (
                            <div className='flex flex-row  mt-2 text-lightGray'>
                                {post.metadata.tags.map((tag: any) => (
                                    <Chip key={tag.id} label={tag.name} className='m-1' variant="filled" color="info" size='small' /> 
                                ))}
                            </div>
                        )}
                        <div className='text-gray-300 mt-2 text-left text-md'>{post?.description}</div>
                    </div>
                    <div className='flex flex-row items-center w-full mt-10 mb-5'>
                        <div className="flex w-fit rounded-full px-1 py-0.5  items-center justify-center bg-lightGray shadow-s mr-4" onClick={(e) => {e.preventDefault()}}>
                        <div>
                            <IconButton aria-label="upvote" color="warning" onClick={() => console.log(post?.id)} >
                                {user_id in (post?.upvotes || {}) ? (
                                    <IconArrowBigUpFilled size={18} className="text-orange-700" onClick={() => {HandleVotePost(post, user_id, "removeupvote")}}/>
                                    ) : (
                                        <IconArrowBigUp size={18} className="text-gray-500 hover:text-orange-700" onClick={() =>{HandleVotePost(post, user_id, "upvote")}}/>
                                    )
                                }
                            </IconButton>
                        </div>
                        <div className="text-xs text-gray-300 font-bold mr-2">{Object.keys(post?.upvotes || {}).length - Object.keys(post?.downvotes || {}).length}</div>
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
                        <div className='flex rounded-full px-2 py-2 items-center justify-center bg-lightGray shadow-sm text-xs text-gray-400' onClick={(e) => {e.preventDefault()}}>
                            <IconMessageCircle size={19} className='ml-1'/>
                            <div className='mx-2 font-extrabold'>{Object.keys(comments || {}).length }</div>
                        </div>
                    </div>
                    <Divider orientation="horizontal" variant='middle' flexItem className='bg-gray-700'></Divider>
                    <div className='w-full mt-6'>
                        <div className='w-full mx-auto flex justify-center'>
                            {commentState ? (
                                <div onClick={() => clickComment()} className='w-full h-12 py-3 px-3 border border-gray-600 rounded-full bg-darkGray text-gray-400  text-left hover:border-gray-500'>Add a comment</div>
                            ) : (
                                <div className='w-full flex flex-col border border-gray-600 rounded-3xl p-2'>
                                    {Object.keys(reply).length > 0 && (
                                        <div className='flex flex-row items-center mt-2 bg-gray-800 rounded-md'>
                                            <Divider orientation='vertical' variant='fullWidth' flexItem className='bg-sky-400 pl-1' />
                                            <div className='flex flex-col ml-2 '>
                                                <div className='text-gray-400 text-left text-xs pt-1'>Replying to @{reply?.metadata?.user?.name}</div>
                                                <div className='text-gray-300 text-left text-s py-1 line-clamp-2'>{reply?.description}</div>
                                            </div>
                                        </div>
                                    )}
                                    {Object.keys(edit).length > 0 && (
                                        <div className='flex flex-row items-center mt-2 bg-gray-800 rounded-md'>
                                            <Divider orientation='vertical' variant='fullWidth' flexItem className='bg-sky-400 pl-1' />
                                            <div className='flex flex-col ml-2 '>
                                                <div className='text-gray-400 text-left text-xs pt-1 italic'>Editing</div>
                                                <div className='text-gray-300 text-left text-s py-1 line-clamp-2'>{edit?.description}</div>
                                            </div>
                                        </div>
                                    )}
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        rows={2}
                                        className='w-full p-4 bg-darkGray focus:outline-none focus:border-gray-400'
                                        autoFocus
                                    ></textarea>
                                    <div className='flex flex-row justify-between mt-2 items-center'>
                                        <div className='rounded-full p-1 px-3 bg-zinc-800 text-s hover:bg-zinc-700' onClick={() => {clickComment(); setText('')}}>Cancel</div>
                                        <div className='rounded-full p-1 px-3 bg-sky-800 text-s hover:bg-sky-700' onClick={() => {handleComment(); clickComment(); setText('')}}>Comment</div>
                                    </div>
                                </div>
                            )}
                        </div> 
                    </div>
                    <div className='w-full'>
                        {Object.keys(comments || {}).length === 0  ? (
                            <div className='flex flex-row items-start mt-16 justify-start'>
                                <img src='/thinking-snoo.png' alt='empty' className='w-[75px]'/>
                                <div className='flex flex-col'>
                                    <div className='text-gray-300 mt-5 text-left text-md mx-10 lg:text-xl font-bold'>Be the first to comment!</div>
                                    <div className='text-gray-300 mt-2 text-left text-xs mx-10 lg:text-md'>Nobody has responded to this post yet</div>
                                </div>
                            </div>
                        ) : (

                            <div className='flex flex-col w-full mt-10'>
                                {comments.map((comment: any) => {
                                    var replyComment: Comment = null;
                                    if (comment.reply_id !== -1) {
                                        replyComment = comments.find((c: any) => c.id === comment.reply_id);
                                    }

                                    return (
                                        <div className='w-full mb-4'>
                                            <div className='flex flex-row justify-between items-center'>
                                                <div className='flex flex-row items-center'>
                                                    <div className='text-left text-sky-500 underline underline-offset-8 '>@{comment.metadata.user.name}</div>
                                                    <div className='mx-1.5 text-gray-400'>•</div>
                                                    <div className='text-xs text-left text-gray-400'>{formatDistanceToNow(new Date(comment.created_at), {addSuffix: false})} ago</div>
                                                    <div className='mx-1.5 text-gray-400'>•</div>
                                                </div>
                                                <div className='flex flex-row'>
                                                    {comment.user_id === user_id && (
                                                        <>
                                                            <IconButton aria-label="comments"  color="info" onClick={() =>handleDelete(comment.id)} >
                                                                <DeleteIcon className='text-gray-400 hover:text-gray-300'/>
                                                            </IconButton>
                                                            <IconButton aria-label="comments"  color="info" onClick={() =>handleEdit(comment.id)} >
                                                                <EditIcon className='text-gray-400 hover:text-gray-300'/>
                                                            </IconButton>
                                                        </>

                                                    )}
                                                    <IconButton aria-label="comments"  color="info" onClick={() => handleReply(comment.id)} >
                                                        <ReplyIcon className='text-gray-400 hover:text-gray-300'/>
                                                    </IconButton>
                                                </div>
                                            </div>
                                            { comment.reply_id !== -1 && replyComment &&(

                                                    <div className='flex flex-row items-center mt-2 bg-gray-800 rounded-md'>
                                                        <Divider orientation='vertical' variant='fullWidth' flexItem className='bg-sky-400 pl-1' />
                                                        <div className='flex flex-col ml-2 '>
                                                            <div className='text-gray-400 text-left text-xs pt-1'>Replying to @{replyComment?.metadata?.user?.name}</div>
                                                            <div className='text-gray-300 text-left text-s py-1 line-clamp-2'>{replyComment?.description}</div>
                                                        </div>
                                                    </div>
                                            )}
                                            { comment.reply_id !== -1 && !replyComment && (

                                                    <div className='flex flex-row items-center mt-2 bg-gray-800 rounded-md'>
                                                        <Divider orientation='vertical' variant='fullWidth' flexItem className='bg-sky-400 pl-1' />
                                                        <div className='flex flex-col ml-2 '>
                                                            <div className='text-gray-400 text-left text-xs pt-1'>Replying to someone</div>
                                                            <div className='text-gray-300 text-left text-s py-1 font-extrabold tracking-wider'>[deleted]</div>
                                                        </div>
                                                    </div>
                                            )}
                                            <div className='text-gray-300 text-left mt-3'>{comment.description}</div>
                                        </div>
                                    )
                                })}
                            </div>

                        )}
                    </div>
                </div>
            </div>
        </div>
    )

}
export default PostView;