import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [name, setName] = useState('')
  
  useEffect(() => {
    let usersRef
    let unsubscribe

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        firebaseDatabase
          .ref()
          .child('users')
          .child(user.uid)
          .on('value', snapshot => {

          }, error => {
            console.log(error)
          })

        usersRef = firebaseStore.collection('Users').doc(user.uid)

        unsubscribe = usersRef
          .get()
          .then(doc => {

            doc.data() && setName(doc.data().name)
          })
      } else {
        unsubscribe && unsubscribe()
      }
    })
  }, [])

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])



  return (
    <Layout title={`Welcome | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={`${styles.onboarding_inner_wrapper} ${styles.welcome_page}`}>

          
          {name && (
            <h1>Welcome, {name}</h1>  
          )}

          {!name && (
            <h1>Welcome!</h1>  
          )}
          
          <div className={styles.download_app_wrap}>
            <h4>Download</h4>
            <p>For the full experience download Mooditude’s mobile app and login with your credentials. </p>

            <div className={styles.app_btns}>
              <a href="#">
                <img src="/Apple.png" alt="" />
              </a>  

              <a href="#">
                <img src="/Android.png" alt="" />
              </a>  
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}