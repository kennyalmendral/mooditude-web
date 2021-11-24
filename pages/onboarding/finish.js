import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

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

  return (
    <Layout title={`Well Done! | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={`${styles.onboarding_inner_wrapper} ${styles.finish_page}`}>
          <div className={styles.lottie_alternative}>
            <div dangerouslySetInnerHTML={{__html: `<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
            <lottie-player src="https://assets5.lottiefiles.com/datafiles/zc3XRzudyWE36ZBJr7PIkkqq0PFIrIBgp4ojqShI/newAnimation.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;"  loop autoplay></lottie-player>`}} />


          </div>
          <h1 className={`mb_0`}>Congratulations</h1>  
          
          <p>You have already accomplished so much!</p>

          <div className={styles.list_wrap}>
            <p><img src="/check.png"/> You have priortized your mental health goals</p>
            <p><img src="/check.png"/> You identified the obstacles to your happiness </p>
            <p><img src="/check.png"/> You comitted to take care of yourself</p>
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