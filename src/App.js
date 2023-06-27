import Header from "./Header";
import Sidebar from "./SideBar";
import Window from "./Window";

import { auth, provider } from './firebase';

import Modals from "./Modals";
import React, { useState } from "react"

function App() {

  const [uploading, setUploading] = useState([]);
  const [metaupload, setMetaUpload] = useState({});
  const [umMin, setUMmin] = useState(false);
  const [umClose, setUMclose] = useState(true);
  const [xUpload, setXupoad] = useState(false);

  const [dummy, setDummy] = useState(false);

  const [user, setUser] = useState();

  const [space, setSpace] = useState("my-drive");

  const [selects, setSelects] = useState([]);
  const [fOptions, setfoptions] = useState(false);

  const [usedMem, setUsedMem] = useState({str:"GB", byt:0});
  const [thereMem, setThereMem] = useState({str:"100MB", byt:100000000});


  const [userCard, setUserCard] = useState(false);

  const [searchPop, setSearchPop] = useState(false);
  const [searchAnswers, setSearchAnswers] = useState([]);

  const signIn= ()=> {
    auth.signInWithPopup(provider).then(({user}) => {
      setUser(user);
    }).catch(er => alert(er.message))
  }

  function formatBytes (num) {
    if(!num) return 0 + ' MB';
    const postfix = ['Bytes', 'KB', 'MB', 'GB'];
    const base = 1024;
    
    const i = Math.floor(Math.log(num) / Math.log(base));

    return parseFloat((num / Math.pow(base, i)).toFixed(0)) + " " + postfix[i];

}

  return user ? (
    <>
    <Modals modalId = "search_overlay" user={user}/>
    <Header user={user} setUser={setUser} space={[space, setSpace]} setUserCard = {setUserCard} searchSee = {[searchPop, setSearchPop]}/>
    <div className="App">
      <Sidebar uploaderLedge = {[uploading, setUploading]} 
               uploaderState = {[[umMin, setUMmin], [umClose,setUMclose]]}
               uploadDisable = {[xUpload, setXupoad]}
               dummy = {[dummy, setDummy]}
               metaUpload = {[metaupload, setMetaUpload]}
               user={user} setUser={setUser}
               space={[space, setSpace]}
               select = {[selects, setSelects]}
               fopts = {[fOptions, setfoptions]}
               usedMem = {usedMem}
               thereMem = {thereMem}/>
      <Window
      user={user} setUser={setUser}
      space={[space, setSpace]}
      select = {[selects, setSelects]}
      fopts = {[fOptions, setfoptions]}
      setUsedMem = {setUsedMem}
      setThereMem = {setThereMem}
      userCard = {userCard}
      setUserCard = {setUserCard}
      searchSee = {[searchPop, setSearchPop]}
      searchAns = {[searchAnswers, setSearchAnswers]}
      formatBytes = {formatBytes}/>
    </div>
    </> 
  ) : (
    <Modals user={[user,setUser]} modalId = "signIn" signer={signIn}/>
  );
}

export default App;
