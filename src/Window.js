import { height } from '@mui/system';
import React, { useState, useEffect } from 'react'
import "./css/window.css"

import ListIcon from '@mui/icons-material/List';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';

import Modals from './Modals';

import { db } from './firebase';


function Window(props) {
    
    const [curDir, setCurDir] = useState("");
    const [grid, setGrid] = useState(true);
    const [selects, setSelects] = useState([]);
    const [selectView, setSelectView] = useState([]);
    const space = props.space[0];
    const [files, setFiles] = useState([]);

    const handleSelects=(e)=> {
        let indexToDelete;
        if((indexToDelete = selects.findIndex(t => t == e)) != -1) {
            selects.splice(indexToDelete, 1);
            setSelects(selects)
            // document.getElementById(e).setAttribute('checked', false);
        }
        else {
            setSelects([...selects, e])
            document.getElementById(e).setAttribute('checked', true);
        };
    }

    const sortByLex=(a, b) => {
        if (a.data.filename < b.data.filename) {
          return -1;
        }
        if (a.data.filename > b.data.filename) {
          return 1;
        }
        return 0;
      }

    function formatBytes (num) {
        if(!num) return 0 + ' MB';
        const postfix = ['Bytes', 'KB', 'MB', 'GB'];
        const base = 1024;
        
        const i = Math.floor(Math.log(num) / Math.log(base));

        return parseFloat((num / Math.pow(base, i)).toFixed(0)) + " " + postfix[i];

    }

    function file_card_preview(t) {
        const img=(url)=>(<img src={url}/>);

        switch(t.data.type.split("/")?.at(1)) {
            case 'img' : {
                return img(t.data.fileURL);
            } 
            case 'pdf' : {
                return img("https://st3.depositphotos.com/11870586/14682/v/450/depositphotos_146824281-stock-illustration-pdf-file-icon-pdf-format.jpg");
            } 
            case 'vnd.openxmlformats-officedocument.wordprocessingml.document' : {
                return img("https://th.bing.com/th/id/OIP.n7-TJXBm-P2-7xMtEvbAkgHaHa?pid=ImgDet&w=768&h=768&rs=1");
            }
            default : return img("https://i.stack.imgur.com/zl3or.png")
        }
    }

    useEffect(() => {
      db.collection('files_db').onSnapshot(snap => {
        setFiles(snap.docs.map(file => ({
            id:file.id,
            data:file.data()
        })))
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
                                className={'window_box_card_texts' + ((selects.includes(Name+t.id)) ? " window_boxes_activated" : "")}
                                onMouseEnter={()=>setSelectView([t.id + Name, true, selects.includes(Name+t.id)])}
                                onMouseLeave={()=>setSelectView([t.id + Name, false])}>
                                    <span className='window_box_icon' onClick={()=>{if(Name != "Suggested")handleSelects(Name+t.id);setSelectView([t.id + Name, true, !selectView[2]]);}}>
                                        {Name != "Suggested" && selectView[1] && selectView[0] == t.id + Name ?<input id={Name+t.id} type="checkbox" checked={selectView[2]}/>:<InsertDriveFileIcon/>}
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
                                className={'window_box_card_file window_box_card' + ((selects.includes(Name+t.id)) ? " window_boxes_activated" : "")}
                                onMouseEnter={()=>setSelectView([t.id + Name, true, selects.includes(Name+t.id)])}
                                onMouseLeave={()=>setSelectView([t.id + Name, false])}
                                >
                                <div className='window_box_card_texts'>
                                    <span className='window_box_icon' onClick={()=>{if(Name != "Suggested")handleSelects(Name+t.id);setSelectView([t.id + Name, true, !selectView[2]]);}}>
                                        {Name != "Suggested" && selectView[1] && selectView[0] == t.id + Name ?<input id={Name+t.id} type="checkbox" checked={selectView[2]}/>:<InsertDriveFileIcon/>}
                                    </span>
                                    <span className={'window_box_name'} 
                                    style={{overflow : 'clip',...((Name == "Suggested") ? {width : 180+"px", marginRight:"10px"} : {})}}>
                                        {t.data.filename}
                                    </span>
                                    {(!(Name == "Suggested")) ? <span className='window_box_options'>
                                        <MoreVertIcon/>
                                    </span> : ""}
                                </div>
                                <span className='window_box_preview'>
                                    {
                                        file_card_preview(t)
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
                                className={'window_box_list' + ((selects.includes(Name+t.id)) ? " window_boxes_activated" : "")}
                                onMouseEnter={()=>setSelectView([t.id + Name, true, selects.includes(Name+t.id)])}
                                onMouseLeave={()=>setSelectView([t.id + Name, false])}>
                                <div className='window_box_list_texts'>
                                    <span className='window_box_icon' onClick={()=>{handleSelects(Name+t.id);setSelectView([t.id + Name, true, !selectView[2]]);}}>
                                        {selectView[1] && selectView[0] == t.id + Name  ? <input id={Name+t.id} type="checkbox" checked={selectView[2]}/> : ((t.data.folder)? <FolderIcon/> : <InsertDriveFileIcon/>)}
                                    </span>
                                    <span className='window_box_name' style={{overflow : 'clip'}}>
                                        {t.data.filename}
                                    </span>
                                    <span className='window_box_owner' style={{overflow : 'clip'}}>
                                        {t.data.user == props.user.email && space == "my-drive" ? "Me" : props.user.displayName}
                                    </span>
                                    <span className='window_box_modified' >
                                        {new Date(t.data.timestamp?.seconds * 1000).toUTCString()}
                                    </span>
                                    <span className='window_box_size'>
                                        {formatBytes(t.data.size)}
                                    </span>
                                    <span className='window_box_options'>
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
                    sectionDisplay("Suggested", files.filter(t => !t.data.folder && t.data.user == props.user.email && !t.data.trashed)
                    .sort((a, b) => b.data.timestamp - a.data.timestamp), true),
                    
                    ((files.findIndex(t => t.data.folder && !t.data.trashed) != -1) ? 
                        sectionDisplay("Folders", files.filter(t => t.data.folder && !t.data.trashed)
                            .sort(sortByLex), grid):null),
                    
                    ((files.findIndex(t => !t.data.folder ) != -1) ? 
                        sectionDisplay("Files", files.filter(t=>!t.data.folder & !t.data.trashed)
                            .sort(sortByLex), grid):null)
                    // (<>
                    //     <div className='tableHeadings' style={{display:"grid", gridTemplateColumns:"45% 10% 30% 15%"}}>
                    //         <span>Name</span>
                    //         <span>Owner</span>
                    //         <span>Uploaded</span>
                    //         <span>Size</span>
                    //     </div>
                    // </>)
                ]
            } break;
            case "shared" : {
                return [

                    sectionDisplay("Suggested", files
                        .filter(t => t.data.user != props.user.email 
                                    && !t.data.trashed
                                    && t.data.shared?.includes(props.user.email))
                        .sort((a, b) => b.data.timestamp - a.data.timestamp), true),

                    sectionDisplay("Files", files
                        .filter(t => t.data.user != props.user.email 
                                    && !t.data.trashed
                                    && t.data.shared?.includes(props.user.email))
                        .sort(sortByLex), grid)
                        
                ];
            } break;
            case "recent" : {
                return [
                    sectionDisplay("Recent", files
                        .filter(t => t.data.user == props.user.email && !t.data.trashed)
                        .sort(sortByLex)
                        .sort((a, b) => b.data.lastaccessed - a.data.lastaccesseds), grid)
                ];
            } break;
            case "starred" : {
                return [
                    sectionDisplay("Starred", files
                        .filter(t => t.data.user == props.user.email && t.data.starred && !t.data.trashed)
                        .sort(sortByLex), grid)
                ];
            } break;
            case "trash" : {
                return [
                    sectionDisplay("Trash", files
                        .filter(t => t.data.user == props.user.email && t.data.trashed)
                        .sort(sortByLex), false)
                ];
            } break;
            case "storage" : {
                return [
                    sectionDisplay("Storage", files
                        .filter(t => t.data.user == props.user.email)
                        .sort(sortByLex), false)
                ];
            } break;
        }
    }

    return (
    <div style={{width:100+"%"}}>
      <div className='window_header'>
          <div className='window_header_heading'>
            {(space == "my-drive") ? (<>
                <span>
                    My Drive
                </span>
                    <ArrowForwardIosOutlinedIcon/>
                <span>
                    POT Folder
                </span>
            </>) : (space[0].toUpperCase() + space.substr(1))}
              
          </div>
          {(space != "trash" && space != "storage") ? <div className='window_header_viewbutton' onClick={()=>setGrid(!grid)}>
              {grid ? <ListIcon/> : <CalendarViewMonthIcon/>}
          </div> : null}
      </div>
      <div className='main-window'>
          <div className='window_body'>
            {   
                spacesDisplay()
            }
            
                        {/* <span className='window_section_boxes window_section_boxes_card'>
                            <div className='window_boxes_activated window_box_card_file window_box_card'>
                                <div className='window_box_card_texts'>
                                    <span className='window_box_icon' onClick={()=>{}}>
                                        {false?<InsertDriveFileIcon/>:<input id="checkbox1" type="checkbox"/>}
                                    </span>
                                    <span className='window_box_name'>
                                        filenew.pdf
                                    </span>
                                    <span className='window_box_options'>
                                        <MoreVertIcon/>
                                    </span>
                                </div>
                                <span className='window_box_preview'>
                                    <img src="https://icc.govt.nz/wp-content/uploads/2019/03/forms-banner.jpg"/>
                                </span>
                            </div> 
                            <div className='window_box_card_file window_box_card'>
                                <div className='window_box_card_texts'>
                                    <span className='window_box_icon'>
                                        {false?<InsertDriveFileIcon/>:<input type="checkbox"/>}
                                    </span>
                                    <span className='window_box_name'>
                                        filenew.pdf
                                    </span>
                                    <span className='window_box_options'>
                                        <MoreVertIcon/>
                                    </span>
                                </div>
                                <span className='window_box_preview'>
                                    <img src="https://icc.govt.nz/wp-content/uploads/2019/03/forms-banner.jpg"/>
                                </span>
                            </div> 
                            <div className='window_box_card_folder window_box_card'>
                                <div className='window_box_card_texts'>
                                    <span className='window_box_icon'>
                                        {false?<InsertDriveFileIcon/>:<input type="checkbox"/>}
                                    </span>
                                    <span className='window_box_name'>
                                        filenew.pdf
                                    </span>
                                    <span className='window_box_options'>
                                        <MoreVertIcon/>
                                    </span>
                                </div>
                            </div>
                        </span> */}
            {/* <div className='window_section'>
                <span className='window_section_title'> 
                    Today
                </span>
                <span className='window_section_boxes window_section_boxes_list'>
                    <div className='window_box_list window_boxes_activated'>
                        <div className='window_box_list_texts'>
                            <span className='window_box_icon'>
                                {false?<InsertDriveFileIcon/>:<input type="checkbox"/>}
                            </span>
                            <span className='window_box_name'>
                                filenew.pdf
                            </span>
                            <span className='window_box_owner'>
                                me
                            </span>
                            <span className='window_box_modified'>
                                Deb 20, 2023 me
                            </span>
                            <span className='window_box_size'>
                                ---
                            </span>
                            <span className='window_box_options'>
                                <MoreVertIcon/>
                            </span>
                        </div>
                    </div>
                    <div className='window_box_list'>
                        <div className='window_box_list_texts'>
                            <span className='window_box_icon'>
                                <InsertDriveFileIcon/>
                            </span>
                            <span className='window_box_name'>
                                filenew.pdf
                            </span>
                            <span className='window_box_owner'>
                                me
                            </span>
                            <span className='window_box_modified'>
                                Deb 20, 2023 me
                            </span>
                            <span className='window_box_size'>
                                ---
                            </span>
                            <span className='window_box_options'>
                                <MoreVertIcon/>
                            </span>
                        </div>
                    </div>
                </span>
            </div> */}
        </div>
      </div>
    </div>
  );
}

export default Window;