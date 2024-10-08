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

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [name, setName] = useState('')
  
  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentProfileStep`) === null) {
      localStorage.setItem(`${authUser.uid}_currentProfileStep`, 0)
    } else {
      if (authUser && localStorage.getItem(`${authUser.uid}_currentProfileStep`) > 0) {
        if (localStorage.getItem(`${authUser.uid}_currentProfileStep`) == 8) {
          router.push('/onboarding/finish')
        } else {
          router.push(`/onboarding/${localStorage.getItem(`${authUser.uid}_currentProfileStep`)}`)
        }
      }
    }

    let usersRef
    let usersRefUnsubscribe

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        usersRef = firebaseStore.collection('Users').doc(user.uid)

        usersRefUnsubscribe = usersRef
          .get()
          .then(doc => {
            doc.data() && setName(doc.data().name)
          })
      } else {
        usersRefUnsubscribe && usersRefUnsubscribe()
      }
    })
  }, [])

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    let usersRef
    let usersRefUnsubscribe

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        usersRef = firebaseStore.collection('Users')

        usersRefUnsubscribe = usersRef
          .where('uid', '==', user.uid)
          .onSnapshot(querySnapshot => {
            querySnapshot.docs.map(doc => {
              setName(doc.data().name)
            })
          })
      } else {
        usersRefUnsubscribe && usersRefUnsubscribe()
      }
    })
  }, [firebaseStore, firebaseAuth])

  return (
    <Layout title={`Welcome | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={`${styles.onboarding_inner_wrapper} ${styles.welcome_page}`}>
          <div>
            <img src="/welcome.png" alt="" className={styles.onboarding_inner_logo}/>
          </div>
          
          {name && (
            <h1>Welcome, {name}</h1>  
          )}

          {!name && (
            <h1>Welcome!</h1>  
          )}
          
          <p>You&apos;re officially a Moodituder! 🎉</p>
          <p>Get ready to experience significant improvement in your mental wellbeing ✨</p>
          <p>Now, it&apos;s time to customize Mooditude to best fit YOU.</p>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                variant="contained" 
                onClick={() => router.push(`/onboarding/1`)} 
                style={{ fontWeight: '700' }}
              >
                LET'S CUSTOMIZE
              </Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}