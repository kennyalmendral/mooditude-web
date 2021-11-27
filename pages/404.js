import {useEffect} from 'react';
import Router from 'next/router';
import Firebase from 'lib/Firebase'
const firebaseAuth = Firebase.auth()

export default function Custom404() {

  useEffect(() => {

    

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        Router.push('/')
      }else{
        Router.push('/auth/login')
      }
    })
  })

  return <h1>404 - Page Not Found</h1>
}