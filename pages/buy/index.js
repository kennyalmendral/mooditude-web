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
      {
        showCoupon ? 
        <div className={styles.promoCodeWrapper}>
          <div className={styles.promoCodeInnerWrapper}>
            <CloseRoundedIcon className={styles.promoWrapperClose} onClick={e => {setShowCoupon(false)}}/>
            <div>
              <h2>Promo Code</h2>
              <TextField 
                label="Enter Promo Code" 
                variant="outlined" 
                type="text" 
                required
                fullWidth={true}
                size={"small"}
                className={styles.promoField}
              />

              <Button 
                size="large" 
                variant="contained" 
              >
                REDEEM
              </Button>
            </div>
          </div>
        </div> : ''
      }

      {
        showCouponApplied ? 
        <div className={styles.promoCodeWrapper}>
          <div className={styles.promoCodeAppliedInner}>
            <div className={styles.promoCodeInnerTop}>
              <h2>Free for a month!</h2>
              <p>Start your wellbeing journey <br/>with Mooditude Premium</p>
            </div>

            <div className={styles.promoCodeInnerBottom}>
              <img src="/buy_icon.svg" />
              <p >Start with a 30-Day Free Trial</p>
              <button>$89.99 / YEAR <span>After 30-Day FREE Trial</span></button>  
              <p className={styles.promoCodeInnerCancelText}>Cancel Anytime.</p>
            </div>
          </div>
        </div> : ''
      }
      <div className={styles.buy_wrapper}>
        <div className={`${styles.buy_inner_wrapper} `}>
          <h1>Take Control of Your Mental Health </h1> 
          <h3>With Mooditude Premium</h3>

          <div className={styles.list_wrap}>
            <p><img src="/check.png"/> Ulimited Mental Health Assessments</p>
            <p><img src="/check.png"/> 800+ minutes of self-care activities including guided journaling, meditations, and coping activities</p>
            <p><img src="/check.png"/> Problem-specific programs with workbooks</p>
            <p><img src="/check.png"/> Goal Tracker and Positve Habit Builder</p>
            <p><img src="/check.png"/> Mood Tracker</p>
            <p><img src="/check.png"/> Progress Tracking & Reports</p>
            <p><img src="/check.png"/> Supportive Community</p>
            <p><img src="/check.png"/> Ask-the-Expert, and</p>
            <p><img src="/check.png"/> Find the  Right Therapist</p>
          </div>


          <div className={styles.buy_wrap}>
            <Stack direction="row" spacing={2}>
              <button
                
              >
                $13.99 / month
              </button>

              <button
                className={styles.yearly}
              >
                $89.99 / YEAR <br/>
                <span>ONLY $7.50/MONTH —Save 42%</span>
              </button>
            </Stack>
          </div>

          <a className={styles.promoCode} href="#" onClick={e => {e.preventDefault();setShowCoupon(true)}}>Have a Promo Code?</a>
        </div>
      </div>
    </Layout>
  )
}