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
      router.push('/login')
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
          
          <h1>Assess Your Mental<br/>Health</h1>  
          
          <p>The next step in our journey is to assess the pulse of your mental health. It will show your risks of various conditions.</p>

          <p>You will get a full report showing risks and recommendations to overcome them.</p>

          <p>We will use the same report to create a personalized plan for you and show your progress over time.</p>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                variant="contained"
                onClick={handleFind}
              >GET YOUR SCORE</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}