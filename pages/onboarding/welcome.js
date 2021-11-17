import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [name, setName] = useState('')
  const [onboardingCurrentStep, setOnboardingCurrentStep] = useState(0)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    switch (onboardingCurrentStep) {
      case 0:
        router.push('/onboarding/welcome')
        break
      case 1:
        router.push('/onboarding/1')
        break
      case 2:
        router.push('/onboarding/2')
        break
      case 3:
        router.push('/onboarding/3')
        break
      case 4:
        router.push('/onboarding/4')
        break
      case 5:
        router.push('/onboarding/5')
        break
      case 6:
        router.push('/onboarding/6')
        break
      case 7:
        router.push('/onboarding/7')
        break
      case 8:
        router.push('/onboarding/finish')
        break
      case 9:
        router.push('/onboarding/get-started')
        break
      default:
        router.push('/onboarding/welcome')
        break
    }
  }, [onboardingCurrentStep])

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
              let userData = doc.data()
              console.log(userData)

              setName(userData.name)
              setOnboardingCurrentStep(userData.onboardingCurrentStep)
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }, [firebaseStore, firebaseAuth])

  const handleNextStep = () => {
    let usersRef
    let usersRefUnsubscribe

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        usersRef = firebaseStore.collection('Users')

        usersRef
          .where('uid', '==', user.uid)
          .get()
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              doc.ref.update({
                onboardingCurrentStep: 1
              })
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }

  return (
    <Layout title={`Welcome | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={`${styles.onboarding_inner_wrapper} ${styles.welcome_page}`}>
          <div>
            <img src="/welcome.png" alt="" className={styles.onboarding_inner_logo}/>
          </div>
          
          <h1>Welcome, {name}</h1>  
          
          <p>Congratulations on taking the first step towards your well-being journey.</p>

          <p>Mooditude is designed by clinical psychologists and data-science experts using evidence based Cognitive Behavioral Therapy (CBT)  for measureable progress.</p>

          <p>Let’s start by personalizing Mooditude for you.</p>

          <div className={styles.btn_wrap}>
          <Stack direction="row" spacing={2}>
            <Button 
              size="large" 
              variant="contained" 
              onClick={handleNextStep} 
              // onClick={() => {router.push(`/onboarding/1`)}}
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