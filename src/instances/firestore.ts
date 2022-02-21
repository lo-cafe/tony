// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBR46OYZDPSgnSboum6Svc-t1i4ubrJ7KQ',
  authDomain: 'oceanos-pdv.firebaseapp.com',
  projectId: 'oceanos-pdv',
  storageBucket: 'oceanos-pdv.appspot.com',
  messagingSenderId: '199028220857',
  appId: '1:199028220857:web:365dbb873a5d2e1c194c68',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export default firestore;
