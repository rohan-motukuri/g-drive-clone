import { Avatar, Modal } from '@mui/material'
import React, { useRef, useState } from 'react'
import { storage, db } from './firebase';
import firebase from "firebase"

import "./css/modals.css"

import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConstructionOutlined, SoapRounded } from '@mui/icons-material';

import LogoutIcon from '@mui/icons-material/Logout';

function Modals (props) {
    const [isShown, setIsShown] = useState([false, -1]);
    const [ipShown, setIpShown] = useState(false);

    const [newFolderModal, setNewFolderModal] = useState(false);
    const [newFolderPop, setNewFolderPop] = useState(true);

    const [sharetoemailInput, setSharetoemailInput] = useState("");

    const [dummy, setDummy] = useState(false);

    // Sharing Handling

    const stopSelectProcess = ()=>{
        props.setSelects([]);
    };

    const handleShareIpChange = (e) => {
        setSharetoemailInput(e.target.value);
    };

    const handleShareClick = () => {
        props.setProceedShare(sharetoemailInput);
        props.setSharePop(false);
    };

    const shareProcess = ()=> {
        props.setSharePop(true);

        if(props.proceedShare.length) {
            props.selects.forEach(t => {
                db.collection("files_db").doc(t.id)
                .update({shared : [...t.data.shared, props.proceedShare]
                        .filter((value, index, array)=>array.indexOf(value) === index)})
            })
        }

        stopSelectProcess();
        props.setfoptions(false);
    };

    // Star Handling

    const starProcess = () => {
        props.selects.forEach(t => {
            db.collection("files_db").doc(t.id)
            .update({starred : !t.data.starred})
        });

        // stopSelectProcess();
        // props.setfoptions(false);
    };
    
    // Rename Handling

    const renameProcess = () => {};

    const getLinkProcess = ()=> {};
    const moveToProcess = () => {};
    
    const copyProcess = () => {};
    const downloadProcess = () => {};
    const removeProcess = () => {};

    const uploadFile = useRef(null);
    const onUploadFile=()=> { // https://www.youtube.com/watch?v=0AS9Gfd1j5s
        uploadFile.current.click();
        setNewFolderModal(false); 
    };

    const exitModals = (cF) => {
        if(props.newuploadDeactivated) props.newuploadDeactivated[1](false)
        if(cF) cF();
    }

    const handleUploadedToFrame=(e)=> {
        if(e.target.files.length != 0) {
            let temp = [...e.target.files].map(t => {
                return {
                    uploadStatus:'inprogress',
                    file:t
                }
                // if(t.uploadStatus == "inprogress") {
                //     storage.ref(`files/${t.file.name}`)
                //     .put(t.file)
                //     .then(snapshot=>{
                //         storage.ref("files").child(t.file.name).getDownloadURL().then(url => {
                //             db.collection("files_db").add({
                //                 timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                //                 filename: t.file.name,
                //                 fileURL: url,
                //                 size: snapshot._delegate.bytesTransferred,
                //                 user: 'me',
                //                 shared: []
                //             })
                            
                //         })
                //         t.uploadStatus = "completed";
                //         setDummy(!dummy);
                //     });
                // }
            }) 
            temp = [...props.uploaderLedge[0], ...temp];
            if(props.uploaderState[1][0]) temp = temp.filter(t => t.uploadStatus != 'completed')
            props.uploaderLedge[1]((temp));
            props.uploaderState[1][1](false);
            props.uploadDisable[1](true);

            function lastCall () {
                props.uploadDisable[1](false);
                db.collection("files_db").where("def", "==", true).get().then(t => props.metaUpload[1](t.size))
            }
           
            temp.forEach((t, i) => {
                if(t.uploadStatus != 'completed')
                        db.collection("files_db").where("def", "==", true).get().then(p => {
                            storage.ref(`files/${p.size}`)
                            .put(t.file)
                            .then(snapshot=>{
                                storage.ref("files").child(p.size+"").getDownloadURL().then(url => {
                                    db.collection("files_db").add({
                                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                        lastaccessed: null,
                                        filename: t.file.name,
                                        fileURL: (temp.link = url),
                                        size: snapshot._delegate.bytesTransferred,
                                        user: props.user.email,
                                        dir: (temp.dir = []),
                                        shared: [],
                                        shared_on:[],
                                        def: true,
                                        type: t.file.type,
                                        folder: false,
                                        starred: false,
                                        trashed: false,
                                        trashed_on:[]
                                    })
                                    
                                })
                                t.uploadStatus = "completed";
                                props.uploaderLedge[1](temp);
    
                                if(i == temp.length - 1) {
                                    lastCall();
                                }
                            }) 
                        })
                else if(i == temp.length - 1) lastCall();
            })

            exitModals();
            // props.uploaderLedge[1]([[...props.uploaderLedge[0][0], ...[...e.target.files]].map(t=>{
            //     if(!t.uploadStatus) return {
            //         uploadStatus:'inprogress',
            //         file:t
            //     }
            //     return t;
            // }), {...props.uploaderLedge[0][1], close:!true}]);
        }
    }

    const handleUploadStatus_header_close = ()=> {
        props.uploaderState[1][1](true);
    }

    let returnee = "";

    switch(props.modalId) {
        case 'newupload' : 
        if(props.uploadDisable[0]) return ""
        return (props.newuploadDeactivated[0]) && 
        (<>
        {(newFolderModal ? (
        <>
            <div className='createFolderPopUp' onClick={()=>{setNewFolderModal(false); exitModals()}}></div>
            <div className='createFolderPopUp_Popup'>
                <div className='cfp_prompt'>
                    <span>New Folder</span>
                </div>
                <div className={('cfp_input' + (ipShown ? (()=>{return(" cfp_input_highlighted")})(): ""))} 
                onClick={()=>document.getElementById("inputFieldCreateFolder").focus()}>
                    <input id="inputFieldCreateFolder" 
                    type="text" defaultValue="Untitled Folder" 
                    onFocus={(e)=>{e.target.select(); setIpShown(true);}} 
                    onBlur={()=>setIpShown(false)}/>
                </div>
                <div className='cfp_buttons'>
                    <div className='cfp_button_enter' 
                    onClick={()=>{/*First, Upload and call uploading Modal and then...*/setNewFolderModal(false); exitModals()}}>
                        <span>Enter</span>
                    </div>
                    <div className='cfp_button_cancel' 
                    onClick={()=>{setNewFolderModal(false); exitModals()}}>
                        <span>Cancel</span>
                    </div>
                </div>
            </div>
        </>):true)}
        {(newFolderPop) ? 
        <>
        <div className='f_make_pop'>
            <div className='f_make_whitespace'/>
            <div className='f_make_folder_create' 
                 onClick={()=>{setNewFolderPop(false); setNewFolderModal(true);}}>
                <span className='f_make_image'>
                    <CreateNewFolderOutlinedIcon/>
                </span>
                <span className='f_make_option'>
                    Create Folder
                </span>
            </div>
            <hr/>
            <input type="file" ref={uploadFile} style={{display: 'none'}}
            onChange={handleUploadedToFrame} multiple={true}/>    
            <div className='f_make_file_upload'
            onClick={onUploadFile}>
                <span className='f_make_image'>
                    
                    <UploadFileIcon/>
                </span>
                <span className='f_make_option'>
                    Upload File
                </span>
            </div>
        </div>
        <div id="f_make_pop_overlay" 
        onClick={()=>{setNewFolderPop(false); exitModals()}}>
        </div></>:""}</>);break;
        case "uploading" : returnee = (
            !(props.uploaderLedge[0].length && !props.uploaderState[1][0])) ? "" : (
            <div className={`uploadStatus ${(props.uploaderState[0][0] ? 'uploadStatus_min' : '' )}`} >
                <div className={`uploadStatus_header`}>
                    <div className='uploadStatus_header_display'>
                        <span>Uploading {props.uploaderLedge[0].filter(t=>t.uploadStatus!='completed').length} files</span>
                    </div>
                    <div className='uploadStatus_header_buttons'>
                        <div className='uploadStatus_header_pop' onClick={()=>props.uploaderState[0][1](!props.uploaderState[0][0])}>
                            {(!props.uploaderState[0][0] ? <CloseFullscreenIcon/> : <OpenInFullIcon/>)}
                        </div>
                        <div className='uploadStatus_header_close' onClick={handleUploadStatus_header_close}>
                            <CloseIcon/>
                        </div>
                    </div>
                </div>
                {props.dummy[0] ? "" : ""}
                {!props.uploaderState[0][0] ? (
                    <div className='uploadStatus_body' id="uploadStatus_body">
                    {
                        props.uploaderLedge[0].map((t, i) => {
                            return (
                                <div key={i} className='uploadStatus_element' 
                                onMouseEnter={()=>setIsShown([true, i])}
                                onMouseLeave={()=>setIsShown([false, i])}>
                                    <div className='uploadStatus_element_icon'>
                                        <InsertDriveFileIcon/>
                                    </div>
                                    <div className='uploadStatus_element_name'>
                                        <span>{t.file.name}</span>
                                    </div>
                                    <div className='uploadStatus_element_progress' onClick={()=>document.getElementById("inner_uploadStatus_element_progress").focus()}>
                                        {(isShown[1] == i && isShown[0] && t.uploadStatus == "completed")? (<FolderOpenIcon id="inner_uploadStatus_element_progress" onClick={()=>{}}/>) 
                                        : (t.uploadStatus == 'completed' ? <CheckCircleIcon id="inner_uploadStatus_element_progress"/> 
                                                                        : <LoopOutlinedIcon id="inner_uploadStatus_element_progress"/>)}
                                    </div>
                                </div>
                            );
                        })
                    } 
                </div>
                ) : (<p/>)}
            </div>); break;
        case "fOptions" : {
            console.log("Hereeee")
        }
        returnee = (
            <div className='f_select_pop'>
            <div className='f_select_whitespace'/>
            <div className='f_select_share' onClick={shareProcess}>
                <span className='f_select_image'>
                    <PersonAddRoundedIcon/>
                </span>
                <span className='f_select_option'>
                    Share
                </span>
            </div>
            {/* <div className='f_select_link' onClick={getLinkProcess}>
                <span className='f_select_image'>
                    <InsertLinkRoundedIcon/>
                </span>
                <span className='f_select_option'>
                    Get Link
                </span>
            </div>
            <div className='f_select_move' onClick={moveToProcess}>
                <span className='f_select_image'>
                    <DriveFileMoveOutlinedIcon/>
                </span>
                <span className='f_select_option'>
                    Move To
                </span>
            </div> */}
            <div className='f_select_star' onClick={starProcess}>
                <span className='f_select_image'>
                    <StarBorderOutlinedIcon/>
                </span>
                <span className='f_select_option'>
                    Star
                </span>
            </div>
            <div className='f_select_rename' onClick={renameProcess}>
                <span className='f_select_image'>
                    <DriveFileRenameOutlineOutlinedIcon/>
                </span>
                <span className='f_select_option'>
                    Rename
                </span>
            </div>
            <hr/>
            <div className='f_select_copy' onClick={copyProcess}>
                <span className='f_select_image'>
                    <ContentCopyOutlinedIcon/>
                </span>
                <span className='f_select_option'>
                    Make a Copy
                </span>
            </div>
            <div className='f_select_download' onClick={downloadProcess}>
                <span className='f_select_image'>
                    <FileDownloadOutlinedIcon/>
                </span>
                <span className='f_select_option'>
                    Download
                </span>
            </div>
            <hr/>
            <div className='f_select_file_remove' onClick={removeProcess}>
                <span className='f_make_image'>
                    <DeleteIcon/>
                </span>
                <span className='f_select_option'>
                    Remove
                </span>
            </div>
            </div>); break;
        case "deleteConfim" : returnee = (
        <div className='confirmDeletePopUp'>    
        <div className='confirmDeletePopUp_Popup'>
            <div className='cdp_prompt'>
                <span>Delete Forever?</span>
            </div>
            <div className='cdp_message'>
                <span>{2} Items will be deleted forever and cannot be recovered, Still continue ?</span>
            </div>
            <div className='cdp_buttons'>
                <div className='cdp_button_cancel'>
                    <span>Cancel</span>
                </div>
                <div className='cdp_button_confirm'>
                    <span>Delete Forever</span>
                </div>
            </div>
        </div>
        </div>); break;
        case "signIn" : returnee = (
            <>
                <div className='signInPop'>
                    <div className='signInPop_logo' onClick={()=>window.location.reload()}>
                        <img src = "https://i.pinimg.com/originals/59/e1/79/59e1794a7ba39592f23cc954ea5c0b10.png" alt = "Drive"/>
                        <span>Drive</span>
                    </div>
                    <div className='signInPop_Button' onClick={props.signer}>
                        <span>Go To Drive (Clone)</span>
                    </div>  
                </div>
            </>
        ); break;
        case "userChanges" : returnee = (
                <div className='userSwitchOverlay'>
                    <div className='userSwitch_Popup'>
                        <div className='userSwitch_CurUserFlex'>
                            <div className='userSwitch_Icon'>
                                    <Avatar src={props.user.photoURL} sx={{ width: "50px", height: "50px", bgcolor: "pink"}}/>
                            </div>
                            <div className='userSwitch_Details'>
                                <div className='userSwitch_Details_Name'>
                                    {props.user.displayName}
                                </div>
                                <div className='userSwitch_Details_Mail'>
                                    {props.user.email}
                                </div>
                            </div>
                        </div>
                        <div className='userSwitch_Logout'>
                            <LogoutIcon/>
                            <span>Log Out</span>
                        </div>
                        <div className='userSwitch_bottompad'/>
                    </div>
                </div>
        ); break;
        case "sharePop" : returnee = (
        <>
            <div className='share_overlay' onClick={()=>props.setSharePop(false)}>

            </div>
            <div className='share_pop'>
                <div className='share_text'>
                    Share {props.shareFiles?.map(t => `"${props.shareFiles}"`)} with : 
                </div>
                <div className={('cfp_input' + (ipShown ? (()=>{return(" cfp_input_highlighted")})(): ""))} 
                onClick={()=>document.getElementById("inputFieldShareF").focus()}>
                    <input id="inputFieldShareF" 
                           type="text" defaultValue="" 
                           onFocus={(e)=>{e.target.select(); setIpShown(true);}} 
                           onBlur={()=>setIpShown(false)}
                           onChange={handleShareIpChange}/>
                </div>
                <div className='share_buttons'>
                    <div className='share_btn_cancel' onClick={()=>props.setSharePop(false)}>
                        Cancel
                    </div>
                    <div className='share_btn_share' onClick={() => handleShareClick()}>
                        Share
                    </div>
                </div>
                <div className='share_warning'>
                    Can't Share To Yourself
                </div>
            </div>
        </>); break;
        case "search_preview" : returnee = (
        <>
            <div className='search_overlay'/>
            <div className='search_pop'>
                <div className='search_items_window'>
                    {
                        [].map(t => {
                            return (
                                <>
                                    <div className='search_items_item'>
                                        <div className='search_items_icon'>

                                        </div>
                                        <div className='search_items_name'>
                                            {t.data.filename}
                                        </div>
                                    </div>
                                </>
                            )
                        })
                    }
                </div>
            </div>
        </>); break;
        case "search_options" : returnee = (
        <>

        </>); break;
        default : returnee = "";
    }
    
    return returnee;
}

export default Modals


// function Modals(modalID) {
//     const [openFmake, setFmake] = useState(false);

//     const handlefMakeClose = () => {
//         setFmake(false);
//     }
//   switch (modalID) {
//     case 0 : break;
//     case 1 : break;
//     default : return (<p>Invalid Modal ID</p>)
//   }
    
// }