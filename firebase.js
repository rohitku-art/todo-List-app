//import { initializeApp } from "

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

 export const firebaseConfig = {
  apiKey: "AIzaSyDEzsAUzMyWPVECEKHDoy72r3b5ONxCQr8",
  authDomain: "todo-list-app-84a70.firebaseapp.com",
  projectId: "todo-list-app-84a70",
  storageBucket: "todo-list-app-84a70.firebasestorage.app",
  messagingSenderId: "979121455962",
  appId: "1:979121455962:web:47e6f423c0db7a0474a963"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };