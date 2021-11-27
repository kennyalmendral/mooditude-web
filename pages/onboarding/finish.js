import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Lottie from "lottie-react";
import animationData from "../../src/lotties/onBoardingCompleted.json";

export default function OnboardingFinishPage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()



  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem(`${authUser.uid}_currentProfileStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentProfileStep`, 8)

    }
  }, [])

  return (
    <Layout title={`Well Done! | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={`${styles.onboarding_inner_wrapper} ${styles.finish_page}`}>
          <div className={styles.lottie_alternative}>
            
            <Lottie 
              animationData={animationData}
              height={400}
              width={400}
            />

          </div>
          <h1 className={`mb_0`}>Congratulations</h1>  
          
          <p>You have already accomplished so much!</p>

          <div className={styles.list_wrap}>
            <p><img src="/check.png"/> You have priortized your mental health goals</p>
            <p><img src="/check.png"/> You identified the obstacles to your happiness </p>
            <p><img src="/check.png"/> You committed to take care of yourself</p>
          </div>

          <div className={styles.high_five}>
            🙌 <span>High five!</span>
          </div>

          <div className={styles.btn_wrap}>
          <Stack direction="row" spacing={2} className={styles.finish_btn}>
            <Button 
            size="large" 
            variant="contained"
            onClick={() => router.push(`/`)}
          >CONTINUE</Button>
          </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}