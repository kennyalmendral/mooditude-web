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
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentProfileStep`) !== null) {
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
          <h1 className={`mb_0`}>🙌 High five!</h1>  
          
          <p style={{ fontWeight: '600', fontSize: '16px' }}>You&apos;ve already accomplished so much!</p>

          <div className={styles.list_wrap}>
            <p style={{ fontWeight: '400', fontSize: '16px' }}><img src="/check.png"/> You prioritized your mental health goals</p>
            <p style={{ fontWeight: '400', fontSize: '16px' }}><img src="/check.png"/> You&apos;ve identified the obstacles to your happiness</p>
          </div>

          <div>
            <p style={{
              fontSize: '16px',
              fontWeight: '700'
            }}>Next Step: Uncover what’s really going on with your Mental Health</p>
          </div>

          <div className={styles.btn_wrap}>
          <Stack direction="row" spacing={2} className={styles.finish_btn}>
            <Button 
              size="large" 
              variant="contained"
              onClick={() => router.push(`/onboarding/get-started`)}
            >
              CONTINUE
            </Button>
          </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}