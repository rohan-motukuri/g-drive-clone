import React from 'react'

import "./css/header.css"
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { Avatar } from '@mui/material';

function Header (props) {
  const handleSearch = () => {
    document.getElementById("globalSearchBar").focus();
    
  }

  const searchRealTime = (e) => {
    props.searchSee[1](e.target.value);
  }

  return (
    <div className="header">
        <div className='header_logo' onClick={()=>props.space[0] != "my-drive" ? props.space[1]("my-drive") : window.location.reload()}>
            <img src = "https://i.pinimg.com/originals/59/e1/79/59e1794a7ba39592f23cc954ea5c0b10.png" alt = "Drive"/>
            <span>Drive</span>
        </div>

        <div className= {'header_search' + (props.searchSee[0] ? " header_search_pressed" : '')} onClick={handleSearch}> 
          <span><SearchIcon/></span>
            <input id="globalSearchBar" type="text" placeholder='Search in Drive'
                  onChange={searchRealTime}/>
          <span><TuneIcon/></span>
        </div>

        <div className='header_options'>
          <span onClick={()=>window.open("https://github.com/rohan-motukuri/g-drive-clone#readme", "_blank")}>
            <HelpOutlineIcon/>
          </span>
          <span className='header_options_avatar' onClick={()=>props.setUserCard(true)}>
            <Avatar src={props.user.photoURL}/>
          </span>
        </div>
    </div>
  )
}

export default Header