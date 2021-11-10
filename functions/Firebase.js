import Firebase from 'Firebase/app'
import 'Firebase/auth'

const firebaseCredentials = {
  apiKey: "AIzaSyAo3hvhWT6BFurFr6ws4ERzVnb4L17M2OU",
  authDomain: "mooditudetrial.web.app",
  projectId: "mooditudetesting"
}

if (!Firebase.apps.length) {
  Firebase.initializeApp(firebaseCredentials)
}

export default Firebase 