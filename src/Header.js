import React from 'react'

import "./css/header.css"
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import AppsIcon from '@mui/icons-material/Apps';

import { Avatar } from '@mui/material';
import Modals from './Modals';

function Header (props) {
  return (
    <div className="header">
        <div className='header_logo' onClick={()=>window.location.reload()}>
            <img src = "https://i.pinimg.com/originals/59/e1/79/59e1794a7ba39592f23cc954ea5c0b10.png" alt = "Drive"/>
            <span>Drive</span>
        </div>

        <div className='header_search' onClick={()=>{document.getElementById("globalSearchBar").focus()}}> 
          <span><SearchIcon/></span>
            <input id="globalSearchBar" type="text" placeholder='Search in Drive'/>
          <span><TuneIcon/></span>
        </div>

        <div className='header_options'>
          <span>
            <HelpOutlineIcon/>
          </span>
          <span className='header_options_avatar'>
            <Avatar src={props.user.photoURL}/>
          </span>
        </div>
    </div>
  )
}

export default Header