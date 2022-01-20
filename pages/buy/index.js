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
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Slider from "react-slick";
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      onClick={onClick}><ChevronRightRoundedIcon /></div>
  );
}

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      onClick={onClick}><ChevronLeftRoundedIcon /></div>
  );
}


export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [checking, setChecking] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [name, setName] = useState('')
  const [showCoupon, setShowCoupon] = useState(false)
  const [showCouponApplied, setShowCouponApplied] = useState(false)
  const [duration, setDuration] = useState('')

  const [error, setError] = useState('')

  const [promoCode, setPromoCode] = useState('')
  const [licenseType, setLicenseType] = useState('Free')

  const [subscription, setSubscription] = useState({})

  const settings = {
    dots: true,
    infinite: true,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />
  };

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
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

  const handleSubscription = async (e) => {
    e.preventDefault()

    setChecking(true)

    const processStripeSubscriptionOnSignUp = firebaseFunctions.httpsCallable('processStripeSubscriptionOnSignUp')
  
    processStripeSubscriptionOnSignUp({
      type: 'subscription',
      duration: duration,
      mode: 'subscription',
      customerEmail: authUser && authUser.email,
      redirectUrl: window.location.origin + '/buy/thank-you',
      cancelUrl: window.location.origin
    }).then(result => {
      location.href = result.data.session.url
    })
  }

  const handleMonthlySubscription = async (e) => {
    e.preventDefault()
    const processStripeSubscription = firebaseFunctions.httpsCallable('processStripeSubscription')
    setShowLoader(true)
    processStripeSubscription({
      plan: 'monthly',
      type: 'subscription',
      codeType: null,
      duration: null,
      message: null,
      customerEmail: authUser ? authUser.email : '',
      redirectUrl: window.location.origin + '/buy/thank-you',
      cancelUrl: `${window.location.origin}`
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
      type: 'subscription',
      codeType: null,
      duration: null,
      message: null,
      customerEmail: authUser ? authUser.email : '',
      redirectUrl: window.location.origin + '/buy/thank-you',
      cancelUrl: `${window.location.origin}`
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
            <div className={styles.new_buy_wrapper}>
              <div className={styles.new_buy_image}>
                <img src="/buy_icon.svg" />
              </div>

              <div className={styles.buy_slider}>
                <h4>WITH MOODITUDE PREMIUM YOU WILL BE ABLE TO</h4>
                
                <div className={styles.buy_inner_slider}>
                  <Slider {...settings}>
                    <div>
                      <h3>Take control of your<br />mental health</h3>
                    </div>
                    <div>
                      <h3>Understand your<br />symptoms with unlimited<br />assessments &amp; reporting</h3>
                    </div>
                    <div>
                      <h3>Change the way<br />you feel with CBT<br />courses &amp; exercises</h3>
                    </div>
                    <div>
                      <h3>Feel happy daily<br />with goals and<br />habit building routines</h3>
                    </div>
                    <div>
                      <h3>Take care of yourself<br />with over 800 minutes<br />of self-care activities</h3>
                    </div>
                    <div>
                      <h3>Discuss and get advice<br />in 24/7 supportive community moderated<br />by experts</h3>
                    </div>
                    <div>
                      <h3>Track how your<br />lifestyle changes are affecting your mental<br />health over time</h3>
                    </div>
                    <div>
                      <h3>Find expert help.<br />Connect with a clinician<br />who understands you<br />and will help you</h3>
                    </div>
                  </Slider>
                </div>
              </div>

              <div className={styles.buy_selection_wrap}>
                <div className={styles.buy_selection_inner_wrap}>
                  <div className={`${styles.buy_selection_item} ${ duration == 1 ? styles.active : '' }`} onClick={e => {setDuration(1)}}>
                    <span className={styles.buy_circle}>{ duration == 1 ? <CheckRoundedIcon /> : '' }</span>

                    <p>$14.99 <span>/ MONTH</span></p>
                  </div>

                  <div className={`${styles.buy_selection_item} ${ duration == 3 ? styles.active : '' }`} onClick={e => {setDuration(3)}}>
                    <span className={styles.buy_circle}>{ duration == 3 ? <CheckRoundedIcon /> : '' }</span>

                    <p>$39.00 <span>/ 3-MONTH</span></p>
                  </div>

                  <div className={`${styles.buy_selection_item} ${ duration == null ? styles.active : '' }`} onClick={e => {setDuration(null)}}>
                    <span className={styles.buy_circle}>{ duration == null ? <CheckRoundedIcon /> : '' }</span>

                    <p>$89.99 <span>/ YEAR  — <b>Save $65</b></span> <br/> <span className={styles.trial_text}>with 3-day free trial</span></p>
                  </div>
                </div>


                <form onSubmit={handleSubscription} className={styles.buy_button_form}>
                  <button
                    type="submit" 
                    style={{
                      height: '100%'
                    }} 
                    className={styles.buy_button}
                  >
                    SUBSCRIBE
                  </button>
                </form>

              </div>

              <div className={styles.buy_text_wrap}>

                <p>The annual subscription is $89.99 and renew <br /> each year. You can cancel it anytime. You will <br/> be charged after the trial period.</p>
              </div>

              <div className={styles.buy_disclaimer_wrap}>

                <p>Payments will be charged to your Credit Card.</p>

                <p>There is no re-fund.</p>

                <p>Subscription will auto-renew within 24-hours before the current subscription period ends.</p>

                <p>Purchasing a subscription during a trial period will forfeit any remaining trial period.</p>

                <p>Manage or cancel your subscription from your iTunes Account settings.</p>


              </div>
            </div>


            
            
          </div>
        </>
      }
      
    </Layout>
  )
}