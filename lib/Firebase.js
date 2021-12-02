import Firebase from 'Firebase/app'
import 'Firebase/auth'
import 'Firebase/firestore'
import 'Firebase/database'
import 'Firebase/functions'

// const firebaseConfig = {
//   apiKey: 'AIzaSyDKgGgsC5Fkv3jxKiSCJtMP9CHtSJFjniA',
//   authDomain: 'moody-cb6aa.firebaseapp.com',
//   databaseURL: 'https://moody-cb6aa.firebaseio.com',
//   projectId: "moody-cb6aa",
//   storageBucket: "moody-cb6aa.appspot.com",
//   messagingSenderId: "192768199854",
//   appId: "1:192768199854:web:49351e206e78d51273f13f",
//   measurementId: "G-0BCRMC810J"
// }

const firebaseConfig = {
  apiKey: 'AIzaSyAo3hvhWT6BFurFr6ws4ERzVnb4L17M2OU',
  authDomain: 'mooditudetesting.firebaseapp.com',
  databaseURL: 'https://mooditudetesting.firebaseio.com',
  projectId: 'mooditudetesting',
  storageBucket: 'mooditudetesting.appspot.com',
  messagingSenderId: '339470281547',
  appId: '1:339470281547:web:c34cc0932ac0520abb96ce',
  measurementId: 'G-86LJ68EB55'
}

if (!Firebase.apps.length) {
  Firebase.initializeApp(firebaseConfig)
}

export default Firebase