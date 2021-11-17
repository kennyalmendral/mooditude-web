import Firebase from 'Firebase/app'
import 'Firebase/auth'
import 'Firebase/firestore'

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