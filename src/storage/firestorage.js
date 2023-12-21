// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkdnvoFUAMUO1qvGlnSCrhuR-fKOeTbz8",
  authDomain: "firma-digital-25ba6.firebaseapp.com",
  projectId: "firma-digital-25ba6",
  storageBucket: "firma-digital-25ba6.appspot.com",
  messagingSenderId: "1057396328269",
  appId: "1:1057396328269:web:55538af7c0477423d9d904"
};

// Initialize Firebase
const appfirebase = initializeApp(firebaseConfig);

export default appfirebase;