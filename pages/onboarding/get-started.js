import { useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function OnboardingGetStartedPage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  return (
    <Layout title={`Welcome | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={`${styles.onboarding_inner_wrapper} ${styles.get_started_page}`}>
          <div>
            <img src="/get-started.png" alt="" className={styles.onboarding_inner_logo}/>
          </div>
          <h1>Let’s Find out Your <br/>Wellbeing Score</h1>  
          
          <p>The next step in our journey is to assess the pulse of your mental wellbeing. It will show your risk of mental health conditions. We use this score in guiding your towards appropriate actions and show progress over time.</p>

          

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                variant="contained"
                onClick={() => {router.push(`/onboarding/1`)}}

              >FIND YOUR WELLBEING SCORE</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}