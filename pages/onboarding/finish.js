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

const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()

export default function OnboardingFinishPage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem('currentProfileStep') !== null) {
      localStorage.setItem('currentProfileStep', 8)

      console.log(`Current profile step: ${localStorage.getItem('currentProfileStep')}`)
    }
  }, [])

  const handleContinue = () => {
    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        firebaseDatabase
          .ref()
          .child('users')
          .child(user.uid)
          .update({
            ageGroup: parseInt(localStorage.profileStep1Answer) || 0,
            gender: parseInt(localStorage.profileStep2Answer) || 0,
            topGoal: localStorage.profileStep3Answer || '',
            topChallenges: localStorage.profileStep4Answer || '',
            goingToTherapy: localStorage.profileStep5Answer || false,
            knowCbt: localStorage.profileStep6Answer || false,
            committedToSelfhelp: localStorage.profileStep7Answer || false,
            onboardingStep: 1 || 0
          })

        // firebaseDatabase
        //   .ref()
        //   .child('users')
        //   .child(user.uid)
        //   .set({
        //     ageGroup: 0, // step 1
        //     gender: 0, // step 2
        //     topGoal: '', // step 3
        //     topChallenges: '', // step 4
        //     goingToTherapy: false, // step 5
        //     knowCbt: false, // step 6
        //     committedToSelfhelp: false, // step 7
        //     onboardingStep: 1
        //   })

        router.push('/onboarding/get-started')
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