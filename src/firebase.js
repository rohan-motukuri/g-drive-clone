import firebase from "firebase"

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API,
  authDomain: "appclone-gdrive-ver1.firebaseapp.com",
  projectId: "appclone-gdrive-ver1",
  storageBucket: "appclone-gdrive-ver1.appspot.com",
  messagingSenderId: "406437409826",
  appId: "1:406437409826:web:f077d09e513e74b1ea867b"
};

  const firebaseApp = firebase.initializeApp(firebaseConfig);

  const db = firebaseApp.firestore();
  const storage = firebase.storage();
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  export {db, storage, auth, provider};