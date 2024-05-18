import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, set, update } from 'firebase/database';
import Config from 'react-native-config';

const firebaseConfig = {
  apiKey: Config.API_KEY,
  authDomain: "electricityapp-c5246.firebaseapp.com",
  databaseURL: "https://electricityapp-c5246-default-rtdb.firebaseio.com",
  projectId: "electricityapp-c5246",
  storageBucket: "electricityapp-c5246.appspot.com",
  messagingSenderId: "584678556432",
  appId: "1:584678556432:web:758195b6fed5ae65315b95",
  measurementId: "G-YL4BX8REGB"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, push, set, update };

