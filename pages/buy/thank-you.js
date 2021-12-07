import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Buy.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import Firebase from 'lib/Firebase'
import TextField from '@mui/material/TextField';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [name, setName] = useState('')
  const [showCoupon, setShowCoupon] = useState(false)
  const [showCouponApplied, setShowCouponApplied] = useState(false)


  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])



  return (
    <Layout title={`Buy | ${SITE_NAME}`}>
      <div className={styles.thankYouWrapper}>
        <div>
          <div className={styles.promoCodeAppliedInner}>
            <div className={styles.promoCodeInnerTop}>
              <h2>Congratulations!</h2>
            </div>

            <div className={styles.promoCodeInnerBottom}>
              <p className={styles.promoCodeInnerThankYouText}>Your have free access to Mooditude Premium for 30 days</p>
              
              <p className={styles.promoCodeInnerCancelText}>Till July 31, 2022</p>
            </div>
          </div>

          <div className={styles.thankYouApp}>
            <p>For the full experience download Mooditude’s mobile app and login with your credentials. </p>
            <div className={styles.thankYouAppInner}>
              <a href="https://apps.apple.com/us/app/mooditude-cbt-therapy/id1450661800" target="_blank">
                <img src="/Apple.svg" alt="" />
              </a>  

              <a href="https://play.google.com/store/apps/details?id=com.health.mental.mooditude" target="_blank">
                <img src="/Android.svg" alt="" />
              </a> 
            </div>  
          </div>
        </div>


      </div>
    </Layout>
  )
}