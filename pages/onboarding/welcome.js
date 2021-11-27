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
            console.log(snapshot.val())

            if ((snapshot.val().onboardingStep == 0) && (localStorage.getItem('currentProfileStep') !== null)) {
              router.push(`/onboarding/${localStorage.getItem('currentProfileStep')}`)
            } else if (localStorage.getItem('currentProfileStep') == 8) {
              router.push('/')
            } else if (snapshot.val().onboardingStep == 1) {
              router.push('/')
            } else if (snapshot.val().onboardingStep == 2) {
              router.push('/assessment/report')
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
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  const handlePersonalize = () => {
    localStorage.getItem('currentProfileStep') === null && localStorage.setItem('currentProfileStep', 0) 

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
          
          <p>Congratulations on taking the first step towards your well-being journey.</p>
          <p>Mooditude is designed by clinical psychologists and data-science experts using evidence based Cognitive Behavioral Therapy (CBT)  for measureable progress.</p>
          <p>Let’s start by personalizing Mooditude for you.</p>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                variant="contained" 
                onClick={handlePersonalize}
                // onClick={() => router.push(`/onboarding/1`)}
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