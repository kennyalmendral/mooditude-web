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
  const [duration, setDuration] = useState(3)

  const [error, setError] = useState('')

  const [promoCode, setPromoCode] = useState('')
  const [licenseType, setLicenseType] = useState('Free')

  const [subscription, setSubscription] = useState({})

  const [paymentFailed, setPaymentFailed] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const [activeProductPrice, setActiveProductPrice] = useState(null)

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

  useEffect(() => {
    console.log(router.query)

    if (router.query.checkout_cancelled) {
      setPaymentFailed(true)
    } else {
      setPaymentFailed(false)
    }

    if (router.query.price) {
      setActiveProductPrice(router.query.price)
    }

    if (router.query.payment_success) {
      setPaymentSuccess(true)
    } else {
      setPaymentSuccess(false)
    }
  }, [router])

  useEffect(() => {
    if (activeProductPrice) {
      if (activeProductPrice == 'price_1K09ueAuTlAR8JLMqv6RVsh8') {
        setDuration(1)
      } else if (activeProductPrice == 'price_1KHXXoAuTlAR8JLM1hdixwNI') {
        setDuration(3)
      } else if (activeProductPrice == 'price_1K09ueAuTlAR8JLM3JmfvSgj') {
        setDuration(null)
      }
    }
  }, [activeProductPrice])

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
  
  return (
    <Layout title={`Buy | ${SITE_NAME}`}>
      <div>
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
              {paymentFailed && (
                <div className={styles.error_alert}>
                  <span onClick={() => router.push('/buy')}><img src="/close.svg" /></span>

                  <h2>Payment didn't go through</h2>
                  <p>Either you cancelled your payment or your card didn't work.</p>
                </div>
              )}

              {paymentSuccess && (
                <div className={styles.success_alert}>
                  <span onClick={() => router.push('/')}><img src="/close.svg" /></span>

                  <h2>Thank you for your patronage!</h2>
                  <p>You took the right step in managing your mental health.</p>
                </div>
              )}

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

                {/* <p>Manage or cancel your subscription from your iTunes Account settings.</p> */}
              </div>
            </div>


            
            
          </div>
        </>
      }
      </div>
    </Layout>
  )
}