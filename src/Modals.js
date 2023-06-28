import { Avatar, Modal } from '@mui/material'
import React, { useRef, useState } from 'react'
import { storage, db } from './firebase';
import firebase from "firebase"

import "./css/modals.css"


import UploadFileIcon from '@mui/icons-material/UploadFile';

import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { Close } from '@mui/icons-material';

import LogoutIcon from '@mui/icons-material/Logout';

function Modals (props) {
    const [isShown, setIsShown] = useState([false, -1]);
    const [ipShown, setIpShown] = useState(false);

    const [newFolderModal, setNewFolderModal] = useState(false);
    const [newFolderPop, setNewFolderPop] = useState(true);

    // Sharing Handling

    const stopSelectProcess = ()=>{
        props.setSelects([]);
    };

    const handleShareClick = () => {
        let x = document.getElementById("inputFieldShareF").value.split(",");
        let y = props.selects;
        if(x.length && x[0].length) {
            y.forEach(t => {
                db.collection("files_db").doc(t.id)
                .update({shared : [...t.data.shared, ...x]
                        .filter((value, index, array)=>array.indexOf(value) === index)})
            })
            stopSelectProcess();
        }
        
        props.setSharePop(false);
    };

    const shareProcess = () => {
        props.setSharePop(true);
        props.setfoptions(false);
    };

    // Star Handling

    const starProcess = () => {
        props.selects.forEach(t => {
            if(t.data.user == props.user.email)
            db.collection("files_db").doc(t.id) 
            .update({starred : !t.data.starred});
        });

        stopSelectProcess();
        props.setfoptions(false);
    };
    
    // Rename Handling

    const renameProcess = () => {
        props.setRenamePop(true);

        props.setfoptions(false);
    };

    const handleRename = () => {
        let x = document.getElementById("inputFieldShareF").value;
        let y = props.selects;
        y.forEach(t => {
            if(t.data.user == props.user.email)
            db.collection("files_db").doc(t.id)
            .update({filename : x});
        });

        stopSelectProcess();
        props.setRenamePop(false);
        props.setfoptions(false);
    };
    
    const downloadProcess = () => {
        props.selects.forEach(x => window.open(x.data.fileURL + "?download", "_blank")); 
    };

    const removeProcess = () => {
        props.setTrashPop(true);
        if(props.space == "trash") props.setDeletePop(true);
        props.setfoptions(false);
    };
    const handleRemove = () => {
        let y = props.selects;
        if(props.deletePop) 
            y.forEach(t => {
                if(t.data.user == props.userName) db.collection("files_db").doc(t.id)
                .update({deleted : true});
            });
        else 
            y.forEach(t => {
                if(t.data.user == props.userName) db.collection("files_db").doc(t.id)
                .update({trashed : true});
                else
                db.collection("files_db").doc(t.id) 
                .update({shared : t.data.shared.filter(s => s != props.userName)});
            });

        props.setTrashPop(false);
        props.setDeletePop(false);
        stopSelectProcess();
        props.setfoptions(false);
    };

    const handleRestore = () => {
        let y = props.selects;
        y.forEach(t => {
            db.collection("files_db").doc(t.id)
            .update({trashed : false, deleted : false});
        });
        stopSelectProcess();
        props.setfoptions(false);
    }

    const uploadFile = useRef(null);
    const onUploadFile=()=> {
        uploadFile.current.click();
        setNewFolderModal(false); 
    };

    const exitModals = (cF) => {
        if(props.newuploadDeactivated) props.newuploadDeactivated[1](false)
        if(cF) cF();
    }

    const handleUploadedToFrame=(e)=> {
        if(e.target.files.length != 0) {
            let collected_set = props.usedMem.byt;
            let temp = [...e.target.files].map(t => {
                
                collected_set += t.size;
                if(collected_set <= props.thereMem.byt)
                return {
                    uploadStatus:'inprogress',
                    file:t
                }
                collected_set -= t.size;
                return {
                    uploadStatus:'cancelled',
                    file:t
                };
            })
            temp = temp.filter(t => t);
            temp = [...props.uploaderLedge[0], ...temp];
            if(props.uploaderState[1][0]) temp = temp.filter(t => t.uploadStatus == 'inprogress')
            props.uploaderLedge[1](temp);
            props.uploaderState[1][1](false);
            props.uploadDisable[1](true);

            function lastCall () {
                props.uploadDisable[1](false);
                db.collection("files_db").where("def", "==", true).get().then(t => props.metaUpload[1](t.size))
            }
           
            temp.forEach((t, i) => {
                if(t.uploadStatus == 'inprogress')
                        db.collection("files_db").where("def", "==", true).get().then(p => {
                            let x = t.file.name + props.user.email + new Date().toUTCString();
                            storage.ref(`files/${x}`)
                            .put(t.file)
                            .then(snapshot=>{
                                storage.ref("files").child(x).getDownloadURL().then(url => {
                                    db.collection("files_db").add({
                                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                        lastaccessed: null,
                                        filename: t.file.name,
                                        fileinstorage : x,
                                        fileURL: (temp.link = url),
                                        size: snapshot._delegate.bytesTransferred,
                                        user: props.user.email,
                                        dir: (temp.dir = []),
                                        shared: [],
                                        shared_on:null,
                                        def: true,
                                        type: t.file.type,
                                        folder: false,
                                        starred: false,
                                        trashed: false,
                                        trashed_on:null
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
        }
    }

    const handleUploadStatus_header_close = ()=> {
        props.uploaderState[1][1](true);
    }

    const enterHandle = (e, type) => {
        if(e.keyCode == 13)
        if(type == "share") {
            handleShareClick();
        } else if (type == "rename") {
            handleRename();
        }
    }

    function fileViewerRenderMatcher () {
        switch(props.fileView.type.split('/')[1]) {
            case 'png': case'jpeg': case'jpg': return (<img src={props.fileView.fileURL} style={{margin:"auto", alignContent:"center", maxWidth:"90%", maxHeight:"90%"}}/>);
            default : return (<embed width="90%" height="90%" style={{margin:"auto", alignContent:"center"}} src={props.fileView.fileURL + "?#zoom=50&scrollbar=1&toolbar=1"} type={props.fileView.type}/>)
        }
    }
    
    const searchAction = (text) => {
        let x = [];
        db.collection('files_db').get().then(snap => {
            
            snap.forEach(doc => {
                let docdata = doc.data();
                if((docdata.user == props.user.email || docdata.shared.includes(props.user.email)) && !docdata.trashed && docdata.filename.toLowerCase().includes(text.trim().toLowerCase())) {
                    x.push(docdata);
                }
            })
            props.setSearchAnswers(x);
            
        })
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
                    onBlur={()=>setIpShown(false)}
                    autocomplete="off" />
                </div>
                <div className='cfp_buttons'>
                    <div className='cfp_button_enter' 
                    onClick={()=>{setNewFolderModal(false); exitModals()}}>
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
                        <span>Uploading {props.uploaderLedge[0].filter(t=>t.uploadStatus=='inprogress' || t.uploadStatus == 'copying').length} files</span>
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
                                        {(isShown[1] == i && isShown[0] && t.uploadStatus == "completed" && t.uploadStatus == "cancelled")? (<FolderOpenIcon id="inner_uploadStatus_element_progress" onClick={()=>{}}/>) 
                                        : (t.uploadStatus == 'completed' ? <CheckCircleIcon id="inner_uploadStatus_element_progress"/> 
                                                                        : (t.uploadStatus == 'cancelled' ? <Close/> : <LoopOutlinedIcon id="inner_uploadStatus_element_progress"/> ))}
                                    </div>
                                </div>
                            );
                        })
                    } 
                </div>
                ) : (<p/>)}
            </div>); break;
        case "fOptions" : returnee = (
            <div className={props.space == "trash" ? `f_select_pop_trash` : (props.selects.length == 1) ? 'f_select_pop_rename' : 'f_select_pop_non_rename'}>
            <div className='f_select_whitespace'/>
            { props.space == "trash" ? "" : 
                <>
                <div className='f_select_share' onClick={shareProcess}>
                    <span className='f_select_image'>
                        <PersonAddRoundedIcon/>
                    </span>
                    <span className='f_select_option'>
                        Share
                    </span>
                </div>
                <div className='f_select_star' onClick={starProcess}>
                    <span className='f_select_image'>
                        <StarBorderOutlinedIcon/>
                    </span>
                    <span className='f_select_option'>
                        Star
                    </span>
                </div>
                {(props.selects.length == 1) ? <div className='f_select_rename' onClick={renameProcess}>
                    <span className='f_select_image'>
                        <DriveFileRenameOutlineOutlinedIcon/>
                    </span>
                    <span className='f_select_option'>
                        Rename
                    </span>
                </div> : ""}
                <hr className='seperator_on_options'/>
                <div className='f_select_download' onClick={downloadProcess}>
                    <span className='f_select_image'>
                        <OpenInNewIcon/>
                    </span>
                    <span className='f_select_option'>
                        Open
                    </span>
                </div>
                <hr className='seperator_on_options'/> 
                </>
            }
            <div className='f_select_file_remove' onClick={removeProcess}>
                <span className='f_make_image'>
                    <DeleteIcon/>
                </span>
                <span className='f_select_option'>
                    Remove
                </span>
            </div>
            {props.space == "trash" ? <div className='f_select_file_remove' onClick={handleRestore}>
                <span className='f_make_image'>
                    <RestoreIcon/>
                </span>
                <span className='f_select_option'>
                    Restore
                </span>
            </div> : ""}
            </div>); break;

        case "trashConfirm" : returnee = (
            <>
            <div className='confirmDeletePopUp'></div>
            <div className='confirmDeletePopUp_Popup'>
                <div className='cdp_prompt'>
                    <span>{props.deletePop ? "Delete Forever ?" : "Send to Trash ?"}</span>
                </div>
                <div className='cdp_message'>
                    <span>{props.selects.length} Item(s) will be {props.deletePop ? "Deleted forever and cannot be recovered, Continue ?" : "Sent to Trash, Continue ?"}</span>
                </div>
                <div className='cdp_buttons'>
                    <div className='cdp_button_cancel' onClick={()=>props.setTrashPop(false) + props.setDeletePop(false)}>
                        <span>Cancel</span>
                    </div>
                    <div className='cdp_button_confirm' onClick={handleRemove}>
                        <span>{props.deletePop ? "Delete Forever" : "Yes"}</span>
                    </div>
                </div>
            </div>
            </>
        ); break;
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
                <>
                <div className='userSwitchOverlay' onClick={()=>props.setUserCard(false)}/>
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
                    <div className='userSwitch_Logout' onClick={()=>window.location.reload()}>
                        <LogoutIcon/>
                        <span>Log Out</span>
                    </div>
                    <div className='userSwitch_bottompad'/>
                </div>
                </>
        ); break;
        case "sharePop" : returnee = (
        <>
            <div className='share_overlay' onClick={()=>props.setSharePop(false)}>

            </div>
            <div className='share_pop'>
                <div className='share_text'>
                    Share {props.selects?.length} files with : 
                </div>
                <div className={('cfp_input' + (ipShown ? (()=>{return(" cfp_input_highlighted")})(): ""))} 
                onClick={()=>document.getElementById("inputFieldShareF").focus()}>
                    <input id="inputFieldShareF" 
                           type="text" defaultValue="" 
                           onFocus={(e)=>{e.target.select(); setIpShown(true);}} 
                           onBlur={()=>setIpShown(false)}
                           onKeyDown={(e)=>enterHandle(e, "share")}
                           autofocus autocomplete="off" />
                </div>
                <div className='share_buttons'>
                    <div className='share_btn_cancel' onClick={()=>props.setSharePop(false)}>
                        Cancel
                    </div>
                    <div className='share_btn_share' onClick={handleShareClick}>
                        Share
                    </div>
                </div>
                <div className='share_warning'>
                    Can't Share To Yourself
                </div>
                
            </div>
        </>); break;
        case "renamePop" : returnee = (
            <> 
            <div className='share_overlay' onClick={()=>props.setRenamePop(false)}/>
            <div className='share_pop'>
                <div className='share_text'>
                    Rename "{props.selects ? props.selects[0].data.filename : ""}" to : 
                </div>
                <div className={('cfp_input' + (ipShown ? (()=>{return(" cfp_input_highlighted")})(): ""))} 
                onClick={()=>document.getElementById("inputFieldShareF").focus()}>
                    <input id="inputFieldShareF" 
                           type="text" 
                           onFocus={(e)=>{e.target.select(); setIpShown(true);}} 
                           onBlur={()=>setIpShown(false)}
                           onKeyDown={(e)=>enterHandle(e, "rename")}
                           autofocus autocomplete="off" /> 
                </div>
                <div className='share_buttons'>
                    <div className='share_btn_cancel' onClick={()=>props.setRenamePop(false)}>
                        Cancel
                    </div>
                    <div className='share_btn_share' onClick={() => handleRename()}>
                        Rename
                    </div>
                </div>
            </div>
            </>
        ); break;
        case "search_preview" : 
        searchAction(props.searchPop);
        returnee = (
        <>
            <div className='search_overlay' onClick={() => props.setSearchPop(false)}/>
            <div className='search_pop'>
                <div className='f_make_whitespace'/>
                {
                    (props.searchAnswers.length > 5 ? props.searchAnswers.filter((t, i) => i < 5) : [...props.searchAnswers, ...Array.apply(null, new Array(5 - props.searchAnswers.length))]).map(t => {
                        return (
                            <>
                                <div className={'search_items_item' + (!t ? ' search_items_item_deactivated' : '')} onClick={()=>t?props.setFileView(t):null}>
                                    <div className='search_items_icon'>
                                        {t ? props.fileIcons(t, true) : ""}
                                    </div>
                                    <div className='search_items_name'>
                                        {t ? t.filename : ""}
                                    </div>
                                </div>
                            </>
                        )
                    })
                }
                <div className='f_make_whitespace'/>
            </div>
        </>); break;
        case "search_options" : returnee = (
        <>

        </>); break;
        case "fileViewer" : returnee = (
            <>
                <div className = "file_viewer_overlay" onClick={()=>props.setFileView(null)}/>
                <div className = "file_viewer">
                    <span className = "file_viewer_object">
                        {fileViewerRenderMatcher()}
                    </span>
                </div>
                
            </>
        ); break;
        default : returnee = "";
    }
    
    return returnee;
}

export default Modals