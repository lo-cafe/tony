import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDlRxMykrt9bzk8t5GfQChFu5oLWZaubx4",
  authDomain: "the-old-man-a7d71.firebaseapp.com",
  projectId: "the-old-man-a7d71",
  storageBucket: "the-old-man-a7d71.appspot.com",
  messagingSenderId: "1081320118670",
  appId: "1:1081320118670:web:d84ecbf7ade672a2482cdf"
};

export const initFirebase = () => initializeApp(firebaseConfig);
