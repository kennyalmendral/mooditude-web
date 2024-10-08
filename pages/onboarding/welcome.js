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

export default function OnboardingWelcomePage(props) {
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
            if (snapshot.val() != null ) {
              if (
                (
                  snapshot.val().onboardingStep == 'accountCreated' ||
                  snapshot.val().onboardingStep == 0
                ) && 
                (localStorage.getItem(`${user.uid}_currentProfileStep`) != null)
              ) {
                if (localStorage.getItem(`${user.uid}_currentProfileStep`) > 0) {
                  props.loginLoaderHandler(true)
                  location.href = `/onboarding/${localStorage.getItem(`${user.uid}_currentProfileStep`)}`
                }
              } else if (snapshot.val().onboardingStep == 'profileCreated' || snapshot.val().onboardingStep == 1) {
                props.loginLoaderHandler(true)
                location.href = '/'
              } else if (snapshot.val().onboardingStep == 'tookAssessment' || snapshot.val().onboardingStep == 2) {
                props.loginLoaderHandler(true)
                location.href = '/assessment/report'
              }
            }
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
      router.push('/login')
    }
  }, [authUser, loading, router])

  const handlePersonalize = () => {
    localStorage.getItem(`${authUser.uid}_currentProfileStep`) == null && localStorage.setItem(`${authUser.uid}_currentProfileStep`, 0) 

    router.push(`/onboarding/1`)
  }

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
                onClick={handlePersonalize}
                // onClick={() => router.push(`/onboarding/1`)} 
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