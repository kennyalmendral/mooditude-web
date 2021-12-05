import { useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import Firebase from 'lib/Firebase'

const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()

export default function Home() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  // useEffect(() => {
  //   firebaseAuth.onAuthStateChanged(user => {
  //     if (user) {
  //       firebaseDatabase
  //         .ref()
  //         .child('users')
  //         .child(user.uid)
  //         .on('value', snapshot => {
  //           console.log(snapshot.val())

  //           if ((snapshot.val().onboardingStep == 'profileCreated') && (authUser && localStorage.getItem(`${authUser.uid}_currentAssessmentStep`) !== null)) {
  //             router.push(`/assessment/${localStorage.getItem(`${authUser.uid}_currentAssessmentStep`)}`)
  //           } else if (snapshot.val().onboardingStep == 'tookAssessment') {
  //             router.push('/assessment/report')
  //           }
  //         }, error => {
  //           console.log(error)
  //         })
  //     }
  //   })
  // }, [])

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  const handleFind = () => {
    localStorage.getItem(`${authUser.uid}_currentAssessmentStep`) === null && localStorage.setItem(`${authUser.uid}_currentAssessmentStep`, 0) 

    router.push('/assessment')
  }

  return (
    <Layout title={`Get Started | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={`${styles.onboarding_inner_wrapper} ${styles.get_started_page}`}>
          <div>
            <img src="/get-started.png" alt="" className={styles.onboarding_inner_logo}/>
          </div>
          <h1>Let’s find out your <br/>well-being score</h1>  
          
          <p>The next step in our journey is to assess the pulse of your mental wellbeing. It will show your risk of mental health conditions. We use this score in guiding your towards appropriate actions and show progress over time.</p>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                variant="contained"
                onClick={handleFind}
              >FIND YOUR WELLBEING SCORE</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}