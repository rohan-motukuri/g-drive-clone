import React, { useState, useEffect } from 'react'
import "./css/window.css"

import ListIcon from '@mui/icons-material/List';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import StarIcon from '@mui/icons-material/Star';

import Modals from './Modals';

import { db } from './firebase';

function Window(props) {

    const [grid, setGrid] = useState(true);
    
    const [selectView, setSelectView] = useState([]);
    const space = props.space[0];
    const [files, setFiles] = useState([]);

    
    const [sharePop, setSharePop] = useState(false);
    const [proceedShare, setProceedShare] = useState("");
    const [renamePop, setRenamePop] = useState(false);
    const [trashPop, setTrashPop] = useState(false);
    const [deletePop, setDeletePop] = useState(false);

    const [fileView, setFileView] = useState(null);

    const [pdfIcon, pngIcon, jpgIcon, txtIcon, docIcon] = [<img src={require("./icons/pdf_alt.png")}/>, <img src={require("./icons/img_alt.png")}/>, <img src={require("./icons/img_alt.png")}/>, <img src={require("./icons/txt_alt.png")}/>, <img src={require("./icons/doc_alt.png")}/>]

    const isEqualOrShared = (t) => {
        return (t.user == props.user.email) || t.shared.includes(props.user.email);
    }

    const handleIndividualFileSelectForOptions = (e) => {
        if(props.select[0].findIndex(t => t.id == e.id) == -1) props.select[1]([...props.select[0], e])
        document.getElementById("SelectsEligible" + e.id).setAttribute('checked', true);

        props.fopts[1](true);
    }

    const handleSelects=(e)=> {
        let indexToDelete;
        if((indexToDelete = props.select[0].findIndex(t => t.id == e.id)) != -1) {
            props.select[0].splice(indexToDelete, 1);
            props.select[1](props.select[0])
        }
        else {
            props.select[1]([...props.select[0], e])
            document.getElementById("SelectsEligible" + e.id).setAttribute('checked', true);
        };
        if(props.select[0].length == 0) props.fopts[1](false);
    }

    const sortByLex = (a, b) => {
        if (a.data.filename < b.data.filename) {
            return -1;
        }
        if (a.data.filename > b.data.filename) {
            return 1;
        }
        return 0;
    }

    const sortBySize = (a, b) => {
        if (a.data.size < b.data.size) {
            return 1;
        }
        if (a.data.size > b.data.size) {
            return -1;
        }
        return 0;
    }

    function file_card_preview(t, icon) {
        const img=(url)=>(<img src={url}/>);

        switch(t.type.split("/")?.at(1)) {
            case 'png' : {
                return icon ? pngIcon : img(t.fileURL);
            }
            case 'jpg' : case 'jpeg' : {
                return icon ? jpgIcon : img(t.fileURL);
            } 

            case 'plain' : {
                return icon ? txtIcon : img("https://i.stack.imgur.com/zl3or.png");
            }
            case 'pdf' : {
                return icon ? pdfIcon : img("https://st3.depositphotos.com/11870586/14682/v/450/depositphotos_146824281-stock-illustration-pdf-file-icon-pdf-format.jpg");
            } 
            case 'vnd.openxmlformats-officedocument.wordprocessingml.document' : {
                return icon ? docIcon : img("https://th.bing.com/th/id/OIP.n7-TJXBm-P2-7xMtEvbAkgHaHa?pid=ImgDet&w=768&h=768&rs=1");
            }
            default : return icon ? <InsertDriveFileIcon/> : img("https://i.stack.imgur.com/zl3or.png")
        }
    }

    useEffect(() => {
      db.collection('files_db').onSnapshot(snap => {
        setFiles(snap.docs.map(file => isEqualOrShared(file.data()) && !file.data().deleted ? ({
            id:file.id,
            data:file.data()
        }) : null).filter(t => t));
        let x = 0;
        snap.docs.forEach(file => {
            let z = file.data();
            if(z.user == props.user.email && !z.deleted)
            props.setUsedMem({str:props.formatBytes(x += z.size), byt:x});
        });
      })
    }, [])
    
    const sectionDisplay=(Name, Boxes, Grid, ListViewArrangments = [null, null], ExtraHeaderAfterSection = null, ExtraHeadersBeforeSection = null)=> {
        return (
        <>
        <div className='window_section'>
        <span className='window_section_title'> 
            {Name}
        </span> 
        {(Grid) ? (
            <span className={'window_section_boxes window_section_boxes_card' + ((Name == "Suggested") ? " window_section_boxes_card_scroll" : "")}>
                {
                    Boxes.map((t, i) => {
                        if(t.data.folder) {
                            return <>
                                <div key={"folder"+Name+i+t.data.dir+grid} 
                                className={'window_box_card_texts' + ((props.select[0].findIndex(selected => selected.id == t.id) != -1) ? " window_boxes_activated" : "")}
                                onMouseEnter={()=>setSelectView([t.id + Name, true, props.select[0].findIndex(selected => selected.id == t.id) != -1])}
                                onMouseLeave={()=>setSelectView([t.id + Name, false])}>
                                    <span className='window_box_icon' onClick={()=>{if(Name != "Suggested")handleSelects();setSelectView([t.id + Name, true, !selectView[2]]);}}>
                                        {Name != "Suggested" && selectView[1] && selectView[0] == t.id + Name ?<input id={"SelectsEligible"+t.id} type="checkbox" checked={selectView[2]} readOnly/>:file_card_preview(t.data, true)}
                                    </span>
                                    <span className='window_box_name' style={{overflow : 'clip',...((Name == "Suggested") ? {width : 180+"px", marginRight:"10px"} : {})}}>
                                    {t.data.filename}
                                    </span>
                                    <span className='window_box_options'>
                                        <MoreVertIcon/>
                                    </span>
                                </div>
                            </>
                        }
                        return <>
                            <div key={"files"+Name+i+t.data.dir+grid} 
                                className={'window_box_card_file window_box_card' + ((props.select[0].findIndex(selected => selected.id == t.id) != -1) ? " window_boxes_activated" : "")}
                                onMouseEnter={()=>setSelectView([t.id + Name, true, props.select[0].findIndex(selected => selected.id == t.id) != -1])}
                                onMouseLeave={()=>setSelectView([t.id + Name, false])}
                                onDoubleClick={()=>setFileView(t.data)}
                                >
                                <div className='window_box_card_texts' >
                                    <span className='window_box_icon' onClick={()=>{if(Name != "Suggested")handleSelects(t);setSelectView([t.id + Name, true, !selectView[2]]);}}>
                                        {Name != "Suggested" && selectView[1] && selectView[0] == t.id + Name ?<input id={"SelectsEligible"+t.id} type="checkbox" checked={selectView[2]} readOnly/>:file_card_preview(t.data, true)}
                                    </span>
                                    <span className={'window_box_name'} 
                                    style={{overflow : 'clip',...((Name == "Suggested") ? {width : 180+"px", marginRight:"10px"} : {})}}>
                                        {t.data.filename}
                                    </span>
                                    <span className='window_box_starredIndicator'>
                                        {Name != "Suggested" && t.data.starred && t.data.user == props.user.email ? <StarIcon/> : ""}
                                    </span>
                                    {(!(Name == "Suggested")) ? <span className='window_box_options' onClick={()=>handleIndividualFileSelectForOptions(t)}>
                                        <MoreVertIcon/>
                                    </span> : ""}
                                </div>
                                <span className='window_box_preview'>
                                    {
                                        file_card_preview(t.data)
                                    }
                                </span>
                            </div> 
                        </>
                    })
                }
            </span>
        ) : (
            <span className='window_section_boxes window_section_boxes_list'>
                {ExtraHeaderAfterSection}
                {
                    Boxes.map((t, i) => {
                        return <>
                            <div key={"files"+Name+i+t.data.dir+grid}  
                                className={'window_box_list' + ((props.select[0].findIndex(selected => selected.id == t.id) != -1) ? " window_boxes_activated" : "")}
                                onMouseEnter={()=>setSelectView([t.id + Name, true, props.select[0].findIndex(selected => selected.id == t.id) != -1])}
                                onMouseLeave={()=>setSelectView([t.id + Name, false])}>
                                <div className='window_box_list_texts' onDoubleClick={()=>setFileView(t.data)}>
                                    <span className='window_box_icon' onClick={()=>{handleSelects(t);setSelectView([t.id + Name, true, !selectView[2]]);}}>
                                        {selectView[1] && selectView[0] == t.id + Name  ? <input id={"SelectsEligible" + t.id} type="checkbox" checked={selectView[2]} readOnly/> : ((t.data.folder)? <FolderIcon/> : file_card_preview(t.data, true))}
                                    </span>
                                    <span className='window_box_name' style={{overflowX : 'clip', overflowY : 'hidden', display:'block', height:'20px'}}>
                                        {t.data.filename}
                                    </span>
                                    <span className='window_box_owner' style={{overflowX : 'clip', overflowY : 'hidden', display:'block', height:'20px'}}>
                                        {t.data.user == props.user.email && space == "my-drive" ? "Me" : t.data.user}
                                    </span>
                                    <span className='window_box_modified' style={{overflowX : 'clip', overflowY : 'hidden', display:'block', height:'20px'}}>
                                        {new Date(t.data.timestamp?.seconds * 1000).toUTCString()}
                                    </span>
                                    <span className='window_box_starredIndicator'>
                                        {t.data.starred && t.data.user == props.user.email && space != "trash"? <StarIcon/> : ""}
                                    </span>
                                    <span className='window_box_size' style={{overflowX : 'clip', overflowY : 'hidden', display:'block', height:'20px'}}>
                                        {props.formatBytes(t.data.size)}
                                    </span>
                                    <span className='window_box_options' onClick={()=>handleIndividualFileSelectForOptions(t)}>
                                        <MoreVertIcon/>
                                    </span>
                                </div>
                            </div>
                        </>
                    })
                }
            </span>
        )
        }
        </div>
        </>
        )
    }

    const spacesDisplay=()=> {
        switch(space) {
            case "my-drive" : {
                return [
                    sectionDisplay("Suggested", files.filter((t, i) => !t.data.folder && isEqualOrShared(t.data) && !t.data.trashed && !t.data.deleted && i < 20)
                    .sort((a, b) => b.data.timestamp - a.data.timestamp), true),
                    
                    ((files.findIndex(t => t.data.folder && !t.data.trashed) != -1) ? 
                        sectionDisplay("Folders", files.filter(t => t.data.folder && !t.data.trashed && !t.data.deleted && isEqualOrShared(t.data))
                            .sort(sortByLex), grid):null),
                    
                    ((files.findIndex(t => !t.data.folder ) != -1) ? 
                        sectionDisplay("Files", files.filter(t=>!t.data.folder & !t.data.trashed && !t.data.deleted && isEqualOrShared(t.data))
                            .sort(sortByLex), grid):null)
                ]
            } break;
            case "shared" : {
                return [

                    sectionDisplay("Files", files
                        .filter(t => t.data.user != props.user.email 
                                    && !t.data.trashed
                                    && t.data.shared?.includes(props.user.email)
                                    && !t.data.deleted)
                        .sort(sortByLex), grid)
                        
                ];
            } break;
            case "recent" : {
                return [
                    sectionDisplay("Recent", files
                        .filter(t => t.data.user == props.user.email && !t.data.trashed && !t.data.deleted)
                        .sort(sortByLex)
                        .sort((a, b) => b.data.lastaccessed - a.data.lastaccesseds), grid)
                ];
            } break;
            case "starred" : {
                return [
                    sectionDisplay("Starred", files
                        .filter(t => t.data.user == props.user.email && t.data.starred && !t.data.trashed && !t.data.deleted)
                        .sort(sortByLex), grid)
                ];
            } break;
            case "trash" : {
                return [
                    sectionDisplay("Trash", files
                        .filter(t => t.data.user == props.user.email && t.data.trashed && !t.data.deleted)
                        .sort(sortByLex), false)
                ];
            } break;
            case "storage" : {
                return [
                    sectionDisplay("Storage", files
                        .filter(t => t.data.user == props.user.email && !t.data.trashed)
                        .sort(sortBySize), false)
                ];
            } break;
        }
    }

    return (
    <div style={{width:100+"%"}}>
      {
        props.fopts[0] ? <Modals modalId = "fOptions" selects = {props.select[0]} user={props.user} setSelects = {props.select[1]} setfoptions = {props.fopts[1]} setSharePop = {setSharePop} proceedShare = {proceedShare} setRenamePop={setRenamePop} space = {space} trashPop = {trashPop} setTrashPop = {setTrashPop}
deletePop = {deletePop} setDeletePop = {setDeletePop} />: ""
      } {
        sharePop ? <Modals modalId = "sharePop" selects = {props.select[0]} setSelects = {props.select[1]} setSharePop = {setSharePop} setProceedShare = {setProceedShare}/> : ""
      } {
        renamePop ? <Modals modalId = "renamePop" user={props.user} selects = {props.select[0]} setSelects = {props.select[1]} setRenamePop = {setRenamePop} setfoptions = {props.fopts[1]}/>: ""
      } {
        trashPop ? <Modals modalId = "trashConfirm" selects = {props.select[0]} setSelects = {props.select[1]} trashPop = {trashPop} setTrashPop = {setTrashPop} setfoptions = {props.fopts[1]} deletePop = {deletePop} setDeletePop = {setDeletePop} userName = {props.user.email}/> : ""
      } {
        props.userCard ? <Modals modalId = "userChanges" setSelects = {props.select[1]} setUserCard = {props.setUserCard} user={props.user} setfoptions = {props.fopts[1]} setUser = {props.setUser}/> : ""
      } {
        fileView ? <Modals modalId = "fileViewer" fileView = {fileView} setFileView = {setFileView}/> : ""
      } {
        props.searchSee[0] ? <Modals modalId = "search_preview" thereMem = {props.thereMem} user={props.user} selects = {props.select[0]} searchPop = {props.searchSee[0]} setSearchPop = {props.searchSee[1]} fileIcons = {file_card_preview} fileView = {fileView} setFileView = {setFileView} searchAnswers = {props.searchAns[0]} setSearchAnswers = {props.searchAns[1]}/> : ""
      }
      <div className='window_header'>
          <div className='window_header_heading'>
            {(space == "my-drive") ? (<>
                <span>
                    My Drive
                </span>
            </>) : <span>{space[0].toUpperCase() + space.substr(1)}</span>}
              
          </div>
          <div className="window_header_buttons">
            {
                (props.select[0].length ? <span className='window_header_buttons_options' onClick={()=>props.fopts[1](!props.fopts[0])}>
                <MoreVertIcon/>
            </span> : "")
            }
            {(space != "trash" && space != "storage") ? <div className='window_header_viewbutton' onClick={()=>setGrid(!grid)}>
                {grid ? <ListIcon/> : <CalendarViewMonthIcon/>}
            </div> : null}
          </div>

      </div>
      <div className='main-window'>
          <div className='window_body'>
            {   
                spacesDisplay()
            }
        </div>
      </div>
    </div>
  );
}

export default Window;