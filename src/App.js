import Header from "./Header";
import Sidebar from "./SideBar";
import Window from "./Window";

import { storage, db, auth, provider } from './firebase';
import firebase from "firebase"

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

  const signIn= ()=> {
    auth.signInWithPopup(provider).then(({user}) => {
      setUser(user);
    }).catch(er => alert(er.message))
  }

  return user ? (
    <>
    <Modals modalId = "search_overlay" user={user}/>
    <Header user={user} setUser={setUser} space={[space, setSpace]}/>
    <div className="App">
      <Sidebar uploaderLedge = {[uploading, setUploading]} 
               uploaderState = {[[umMin, setUMmin], [umClose,setUMclose]]}
               uploadDisable = {[xUpload, setXupoad]}
               dummy = {[dummy, setDummy]}
               metaUpload = {[metaupload, setMetaUpload]}
               user={user} setUser={setUser}
               space={[space, setSpace]}/>
      <Window
      user={user} setUser={setUser}
      space={[space, setSpace]}/>
    </div>
    </> 
  ) : (
    <Modals user={[user,setUser]} modalId = "signIn" signer={signIn}/>
  );
}

export default App;
