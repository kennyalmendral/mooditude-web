import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Buy.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import GridLoader from "react-spinners/GridLoader"
import Firebase from 'lib/Firebase'
import TextField from '@mui/material/TextField'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import MoonLoader from "react-spinners/MoonLoader"

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [checking, setChecking] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [name, setName] = useState('')
  const [showCoupon, setShowCoupon] = useState(false)
  const [showCouponApplied, setShowCouponApplied] = useState(false)

  const [error, setError] = useState('')

  const [promoCode, setPromoCode] = useState('')
  const [licenseType, setLicenseType] = useState('Free')

  const [subscription, setSubscription] = useState({})

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }

    authUser && console.log(authUser)
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser) {
      firebaseStore
        .collection('Subscribers')
        .doc(authUser.uid)
        .get()
        .then(doc => {
          if (doc && doc.data()) {
            doc.data().grant && setLicenseType(doc.data().grant.licenseType)
          }

          setChecking(false)
        })
    }
  }, [authUser])

  const handleMonthlySubscription = async (e) => {
    e.preventDefault()
    const processStripeSubscription = firebaseFunctions.httpsCallable('processStripeSubscription')
    setShowLoader(true)
    processStripeSubscription({
      plan: 'monthly',
      codeType: null,
      duration: null,
      message: null,
      customerEmail: authUser ? authUser.email : '',
      redirectUrl: window.location.origin + '/buy/thank-you',
      cancelUrl: window.location.origin + '/buy'
    }).then(result => {
      location.href = result.data.session.url
    })
  }

  const handleYearlySubscription = async (e) => {
    e.preventDefault()
    console.log('handleYearlySubscription')
    setShowLoader(true)

    const processStripeSubscription = firebaseFunctions.httpsCallable('processStripeSubscription')
  
    processStripeSubscription({
      plan: 'yearly',
      codeType: null,
      duration: null,
      message: null,
      redirectUrl: window.location.origin + '/buy/thank-you',
      cancelUrl: window.location.origin + '/buy'
    }).then(result => {
      location.href = result.data.session.url
    })
  }

  const handleRedeemPromoCode = async (e) => {
    e.preventDefault()
    console.log('handleRedeemPromoCode')
    setShowLoader(true)

    if (authUser) {
      const processInvitationCode = firebaseFunctions.httpsCallable('processInvitationCode')
  
      processInvitationCode({
        code: promoCode,
        platform: 'web',
        userId: authUser.uid
      }).then(result => {
        let resultData = result.data

        console.log('then', resultData)

        if (!resultData.error) {
          setError('')

          if (resultData.codeInfo.codeType == 'purchased') {
            firebaseStore
              .collection('Users')
              .doc(authUser.uid)
              .update({
                customerType: 'premium'
              })
              .then(() => {
                firebaseDatabase
                  .ref()
                  .child('users')
                  .child(authUser.uid)
                  .update({
                    customerType: 'premium',
                    expiryDate: resultData.expiryDate ? resultData.expiryDate : '',
                  })
                  .then(() => {
                    if (resultData.codeInfo.duration === undefined) {
                      router.push(`/buy/coupon-applied?code_type=purchased&expiry_date=${resultData.expiryDate}&message=${resultData.codeInfo.message}&success=true`)
                    } else {
                      router.push(`/buy/coupon-applied?code_type=purchased&duration=${resultData.codeInfo.duration}&message=${resultData.codeInfo.message}&success=true`)
                    }
                  })
              })
          } else if (resultData.codeInfo.codeType == 'discount') {
            router.push(`/buy/coupon-applied?code_type=discount&message=${resultData.codeInfo.message}&success=true`)
          } else if (resultData.codeInfo.codeType == 'trial') {
            router.push(`/buy/coupon-applied?code_type=trial&duration=${resultData.codeInfo.duration}&message=${resultData.codeInfo.message}&success=true`)
          }
        } else {
          setError(resultData.error.message)
        }

        setShowLoader(false)
      }).catch((e) => {
        console.log('catch', e.message)
        setShowLoader(false)
      })
    }
  }
  
  return (
    <Layout title={`Buy | ${SITE_NAME}`}>
      {
        checking ? 
          <div 
            className={styles.custom_loader} 
            style={{
              position: 'absolute',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              background: '#fff',
              zIndex: 10
            }}
          >
            <MoonLoader color={'#1CA566'} loading={true} size={30} />
          </div>
        : 
        <>
          {
            showCoupon ? 
            <div className={styles.promoCodeWrapper}>
              <div className={styles.promoCodeInnerWrapper}>
                <CloseRoundedIcon className={styles.promoWrapperClose} onClick={e => {setShowCoupon(false)}}/>
                <div>
                  <h2>Promo Code</h2>

                  <form onSubmit={handleRedeemPromoCode}>
                    <TextField 
                      label="Enter Promo Code" 
                      variant="outlined" 
                      type="text" 
                      required
                      fullWidth={true}
                      size={"small"}
                      className={styles.promoField} 
                      value={promoCode} 
                      onChange={e => setPromoCode(e.target.value)} 
                      error={error}
                      helperText={error ? error : ''}
                      required
                    />

                    <Button 
                      type="submit"
                      size="large" 
                      variant="contained"
                    >
                      REDEEM
                    </Button>
                  </form>
                </div>
              </div>
            </div> : ''
          }

          {
            showCouponApplied ? 
            <div className={styles.promoCodeWrapper}>
              <div className={styles.promoCodeAppliedInner}>
                <div className={styles.promoCodeInnerTop}>
                  <CloseRoundedIcon className={styles.promoWrapperClose} onClick={e => {setShowCouponApplied(false)}}/>
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
          {
            licenseType == 'Premium' ? 
            <div className={styles.promoCodeWrapper}>
              <div className={styles.promoCodeAppliedInner}>
                <div className={styles.promoCodeInnerTop}>
                  <h2>Hooray!</h2>
                  <p>You're already a premium user.</p>
                </div>

                <div className={styles.promoCodeInnerBottom}>
                  <img src="/buy_icon.svg" />
                </div>
              </div>
            </div> : ''
          }
          <div className={styles.buy_wrapper}>
            {
              showLoader ? 
                <div 
                  className={styles.custom_loader} 
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255,255,255,.8)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <MoonLoader color={'#1CA566'} loading={true} size={30} />
                </div>
              : 
              ''
            }
            <div className={`${styles.buy_inner_wrapper} `}>
              <h1>Take Control of Your Mental Health </h1> 
              <h3>With Mooditude Premium</h3>

              <div className={styles.list_wrap}>
                <p><img src="/check.png"/> Unlimited Mental Health Assessments</p>
                <p><img src="/check.png"/> 800+ minutes of self-care activities including guided journaling, meditations, and coping activities</p>
                <p><img src="/check.png"/> Problem-specific programs with workbooks</p>
                <p><img src="/check.png"/> Goal Tracker and Positve Habit Builder</p>
                <p><img src="/check.png"/> Mood Tracker</p>
                <p><img src="/check.png"/> Progress Tracking &amp; Reports</p>
                <p><img src="/check.png"/> Supportive Community</p>
                <p><img src="/check.png"/> Ask-the-Expert, and</p>
                <p><img src="/check.png"/> Find the  Right Therapist</p>
              </div>


              <div className={styles.buy_wrap}>
                <Stack direction="row" spacing={2}>
                  <form onSubmit={handleMonthlySubscription}>
                    <button
                      type="submit" 
                      style={{
                        height: '100%'
                      }} 
                    >
                      $12.99 / month
                    </button>
                  </form>
                      
                  <form onSubmit={handleYearlySubscription}>
                    <button
                      type="submit" 
                      style={{
                        height: '100%'
                      }} 
                      className={styles.yearly}
                    >
                      $89.99 / YEAR <br/>
                      <span>ONLY $7.50/MONTH — Save 42%</span>
                    </button>
                  </form>
                </Stack>
              </div>

              <a className={styles.promoCode} href="#" onClick={e => {e.preventDefault();setShowCoupon(true)}}>Have a Promo Code?</a>
            </div>
          </div>
        </>
      }
      
    </Layout>
  )
}