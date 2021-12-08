import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Buy.module.css'

import { useAuth } from '@/context/AuthUserContext'

import { format } from 'date-fns'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import Firebase from 'lib/Firebase'
import TextField from '@mui/material/TextField';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GridLoader from "react-spinners/GridLoader"

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [name, setName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [showCoupon, setShowCoupon] = useState(false)
  const [showCouponApplied, setShowCouponApplied] = useState(false)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    const getStripeSubscription = firebaseFunctions.httpsCallable('getStripeSubscription')
    
    getStripeSubscription({
      session_id: new URLSearchParams(window.location.search).get('session_id')
    }).then(result => {
      let session = result.data.session
      let subscription = result.data.subscription

      console.log(session, subscription)

      if (authUser) {
        firebaseDatabase
          .ref()
          .child('users')
          .child(authUser.uid)
          .update({
            customerType: 'premium',
            expiryDate: subscription.current_period_end * 1000,
            paymentStatus: 'active',
            paymentType: 'stripe'
          })
        
        firebaseStore
          .collection('Users')
          .doc(authUser.uid)
          .update({
            customerType: 'premium'
          })

        firebaseStore
          .collection('Subscribers')
          .doc(authUser.uid)
          .set({
            grant: {
              expiryDate: format(subscription.current_period_end * 1000, 'LLLL dd, yyyy'),
              grantType: 'Purchase',
              licenseType: 'Premium',
              productType: 'Subscription',
              transactionDate: format(subscription.created * 1000, 'LLLL dd, yyyy'),
              transactionId: session.id
            }
          })
          .then(() => {
            setExpiryDate(format(new Date(subscription.current_period_end * 1000), 'LLLL dd, yyyy'))
            setShowLoader(false)
          })
      }
    })
  }, [authUser])

  return (
    <Layout title={`Congratulations | ${SITE_NAME}`}>
      {
        showLoader ? 
          <div className="page-loader"><GridLoader color={'#1CA566'} loading={true} size={10} /></div> 
        : 
        ''
      }

      <div className={styles.thankYouWrapper}>
        <div>
          <div className={styles.promoCodeAppliedInner}>
            <div className={styles.promoCodeInnerTop}>
              <h2>Congratulations!</h2>
            </div>

            <div className={styles.promoCodeInnerBottom}>
              <p className={styles.promoCodeInnerThankYouText}>You have free access to Mooditude Premium for 30 days</p>
              
              <p className={styles.promoCodeInnerCancelText}>Till {expiryDate}</p>
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