import Firebase from 'Firebase/app'
import 'Firebase/auth'

const firebaseCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
}

if (!Firebase.apps.length) {
  Firebase.initializeApp(firebaseCredentials)
}

export default Firebase