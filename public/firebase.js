import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBfF_Gfn_YaIHfHVCpaA6IdUjDVNlDQTjg",
    authDomain: "sphera-6778e.firebaseapp.com",
    projectId: "sphera-6778e",
    storageBucket: "sphera-6778e.firebasestorage.app",
    messagingSenderId: "851527615297",
    appId: "1:851527615297:web:9ea78e42c27b3585e5d7c0",
    measurementId: "G-985XZJ9V0S"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);