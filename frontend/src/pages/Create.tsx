import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useState } from 'react'
import { Divider } from '@mui/material'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function Create() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [chosen, setChosen] = useState<string[]>([])
  const token = Cookies.get('token')
  const [username, setUsername] = useState('')
  const [user_id, setUser_id] = useState(-1)
  const navigate = useNavigate();
  const handleChange = (event: SelectChangeEvent<typeof chosen>) => {
    const {
      target: { value },
    } = event;
    setChosen(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  const fetchUser = async () => {
    try {
        const res = await fetch('http://localhost:8080/getUserInfo', {
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

useEffect(()=> {
  fetchUser()
})

  const handlePost = async () => {
    try {
      const res = await fetch('http://localhost:8080/createPost', {
        method: "POST",
        headers: {
          "Authorization": token
        },
        body: JSON.stringify({
          userid: user_id,
          title: title,
          tags: chosen,
          description: text 
        })
      })
      navigate("/")
      
    }
    catch(error) {
      console.log(error)
    }
  }
  const tags = ['Open', 'Closed', 'Pending', 'Resolved', 'Unresolved', 'Blocked', 'Not Blocked', 'High', 'Medium', 'Low', 'Critical', 'Major', 'Minor', 'Trivial', 'Bug', 'Feature', 'Enhancement', 'Documentation', 'Duplicate', 'Invalid', 'Wontfix', 'Question', 'Help'] 
  return (
    <div className='bg-darkGray text-white min-h-screen'>
        <Navbar />
        <div className='flex flex-col justify-center w-full max-w-5xl mx-auto h-full'>
            <div className='mt-5 mx-4'>
              <div className='text-left font-sans text-2xl font-bold tracking-wide text-gray-300'>Create post</div>
              <div className='flex flex-col mt-7'>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className='w-full max-w-3xl p-3 rounded-2xl focus:outline-none focus:border-sky-500 bg-lightGray text-lg font-sans border-2 border-gray-500' placeholder='Title*' />
                <div className='mt-5 flex'>
                <FormControl sx={{
                    width: 250,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        border: "2px solid #6B7280",
                      },
                      "&:hover fieldset": {
                        borderColor: "#D1D5DB", 
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#0EA5E9", 
                      },
                    },
                    "& .MuiInputBase-root": {
                      backgroundColor: "#1B1E22",
                      borderRadius: "1rem",
                    },
                  }}>
                  <InputLabel id="demo-multiple-chip-label">Tags</InputLabel>
                  <Select
                    labelId="demo-multiple-chip-label"
                    id="demo-multiple-chip"
                    multiple
                    value={chosen}
                    onChange={handleChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} className='m-1' variant="outlined" color="info" size='small' /> 
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {tags.map((tag) => (
                      <MenuItem
                        key={tag}
                        value={tag}
                      >
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                </div>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    className='w-full p-4 border border-gray-500 rounded-2xl mt-10 bg-lightGray focus:outline-none focus:border-gray-400'
                    autoFocus
                    placeholder='Body'
                ></textarea>
                <div className='flex justify-end mt-2'>
                    <div className='bg-sky-600 p-2 px-4 rounded-3xl hover:bg-sky-500' onClick={handlePost}>Post</div>
                </div>
              </div>

            </div>
        </div>
    </div>
  )
}

export default Create