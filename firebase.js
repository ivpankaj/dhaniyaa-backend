// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDPypizcfYalaJ-IQtXxt60hm85x1lB4s",
  authDomain: "dhaniyaa.cookmytech.site",
  projectId: "cookmytech",
  storageBucket: "cookmytech.firebasestorage.app",
  messagingSenderId: "984972201120",
  appId: "1:984972201120:web:70a506d3dbf35d40aa0dc5",
  measurementId: "G-DJY2P46888"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);