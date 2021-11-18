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
    if (localStorage.getItem('currentProfileStep') === null) {
      localStorage.setItem('currentProfileStep', 0)
    } else {
      console.log(`Current profile step: ${localStorage.getItem('currentProfileStep')}`)

      if (localStorage.getItem('currentProfileStep') > 0) {
        if (localStorage.getItem('currentProfileStep') == 8) {
          router.push('/onboarding/finish')
        } else {
          router.push(`/onboarding/${localStorage.getItem('currentProfileStep')}`)
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
            setName(doc.data().name)
          })
      } else {
        usersRefUnsubscribe && usersRefUnsubscribe()
      }
    })
  }, [])

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
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
          
          <p>Congratulations on taking the first step towards your well-being journey.</p>
          <p>Mooditude is designed by clinical psychologists and data-science experts using evidence based Cognitive Behavioral Therapy (CBT)  for measureable progress.</p>
          <p>Let’s start by personalizing Mooditude for you.</p>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                variant="contained" 
                onClick={() => router.push(`/onboarding/1`)}
              >
                PERSONALIZE MOODITUDE
              </Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}