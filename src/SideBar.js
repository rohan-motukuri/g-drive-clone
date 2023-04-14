import React from 'react'
import "./css/sidebar.css"

import AddIcon from '@mui/icons-material/Add';
import StorageIcon from '@mui/icons-material/SaveOutlined';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

import Modals from './Modals';
import { useState } from 'react';

function SideBar(props) {
    const [newBtnModal, newBtnModalShown] = useState(false);
  return (
    <div className='sidebar'>
        <Modals modalId="uploading" uploaderLedge = {props.uploaderLedge} 
                uploaderState = {props.uploaderState} dummy = {props.dummy}
                user={props.user} setUser={props.setUser}/>
        <div className = 'sidebar_button' >
            
            <button id="newbtn" 
                    onClick={(e)=>{e.preventDefault();newBtnModalShown(true);}}>
                <AddIcon/>
                <span>New</span>
            </button>
            {
                newBtnModal ? 
                <Modals modalId="newupload" 
                        newuploadDeactivated={[newBtnModal, newBtnModalShown]}
                        uploaderLedge = {props.uploaderLedge}
                        uploadDisable = {props.uploadDisable}
                        uploaderState = {props.uploaderState}
                        dummy = {props.dummy}
                        metaUpload = {props.metaUpload}
                        user={props.user} setUser={props.setUser}
                /> : ""
            
            }
        </div>

        <div className='sidebar_options'>
            <div className={'sidebar_option ' + (props.space[0] == "my-drive" ? 'sidebar_option_active' : "")} onClick={()=>props.space[1]("my-drive")}>
                <StorageIcon/>
                <span>My Drive</span>
            </div>
            <div className={'sidebar_option ' + (props.space[0] == "shared" ? 'sidebar_option_active' : "")} onClick={()=>props.space[1]("shared")}>
                <ShareIcon/>
                <span>Shared with me</span>
            </div>
            <div className={'sidebar_option ' + (props.space[0] == "recent" ? 'sidebar_option_active' : "")} onClick={()=>props.space[1]("recent")}>
                <QueryBuilderIcon/>
                <span>Recent</span>
            </div>
            <div className={'sidebar_option ' + (props.space[0] == "starred" ? 'sidebar_option_active' : "")} onClick={()=>props.space[1]("starred")}>
                <StarBorderIcon/>
                <span>Starred</span>
            </div>
            <div className={'sidebar_option ' + (props.space[0] == "trash" ? 'sidebar_option_active' : "")} onClick={()=>props.space[1]("trash")}>
                <DeleteIcon/>
                <span>Trash</span>
            </div>
            <div className={'sidebar_option ' + (props.space[0] == "storage" ? 'sidebar_option_active' : "")} onClick={()=>props.space[1]("storage")}>
                <CloudQueueIcon/>
                <span>Storage</span>
            </div>
            <div className="storage_progressbar">
                <progress size="tiny" value="50" max="100"/>
                <span>x GB of y GB used</span>
            </div>
        </div>
    </div>
  )
}

export default SideBar