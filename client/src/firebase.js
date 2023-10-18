// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'men-real-estate.firebaseapp.com',
  projectId: 'men-real-estate',
  storageBucket: 'men-real-estate.appspot.com',
  messagingSenderId: '152678159609',
  appId: '1:152678159609:web:cdb95536390abf99e53e28',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
