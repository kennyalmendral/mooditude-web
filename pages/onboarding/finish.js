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

export default function OnboardingFinishPage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [onboardingCurrentStep, setOnboardingCurrentStep] = useState(8)

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

              setOnboardingCurrentStep(userData.onboardingCurrentStep)
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }, [firebaseStore, firebaseAuth])

  const handleContinue = () => {
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
                onboardingCurrentStep: 9
              })
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }

  return (
    <Layout title={`Well Done! | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={`${styles.onboarding_inner_wrapper} ${styles.finish_page}`}>
          <div className={styles.lottie_alternative}>
            <img src="/lottie_alternative.png" alt=""/>
          </div>
          <h1 className={`mb_0`}>Congratulations</h1>  
          
          <p>You have already accomplished so much!</p>

          <div className={styles.list_wrap}>
            <p><img src="/check.png"/> You have priortized your mental health goals</p>
            <p><img src="/check.png"/> You identified the obstacles to your happiness </p>
            <p><img src="/check.png"/> You comitted to take care of yourself</p>
          </div>

          <div className={styles.high_five}>
            <img src="/high_five.png" alt="" />
          </div>

          <div className={styles.btn_wrap}>
          <Stack direction="row" spacing={2} className={styles.finish_btn}>
            <Button 
            size="large" 
            variant="contained"
            // onClick={() => {router.push(`/onboarding/get-started`)}}
            onClick={handleContinue}
          >CONTINUE</Button>
          </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}