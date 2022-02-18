import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

const config = require('../../functions/config/config.json')

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Buy.module.css'

import { useAuth } from '@/context/AuthUserContext'

import { format, isAfter } from 'date-fns'

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
import { FormatColorResetTwoTone } from '@mui/icons-material'

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
  const [licenseType, setLicenseType] = useState(null)
  const [expiryDate, setExpiryDate] = useState(null)

  const [subscription, setSubscription] = useState({})

  const [paymentFailed, setPaymentFailed] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const [plans, setPlans] = useState([])

  const [activeProductPrice, setActiveProductPrice] = useState(null)

  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false)

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
      for (const plan in config.stripe.plan) {
        const getStripeProduct = firebaseFunctions.httpsCallable('getStripeProduct')

        getStripeProduct({
          price: config.stripe.plan[plan]
        }).then(result => {
          let productPrice = result.data.productPrice
          let planObj = {}

          planObj['id'] = productPrice.id
          planObj['amount'] = parseInt(productPrice.unit_amount_decimal) / 100
          planObj['interval'] = productPrice.recurring != null && productPrice.recurring.interval
          planObj['interval_count'] = productPrice.recurring != null && productPrice.recurring.interval_count

          if (
            (productPrice.type == 'recurring') && 
            (productPrice.recurring.interval == 'month') && 
            (productPrice.recurring.interval_count == 1)
          ) {
            planObj['duration_in_months'] = 1
          } else if (
            (productPrice.type == 'recurring') && 
            (productPrice.recurring.interval == 'month') && 
            (productPrice.recurring.interval_count == 3)
          ) {
            planObj['duration_in_months'] = 3
          } else if (
            (productPrice.type == 'recurring') && 
            (productPrice.recurring.interval == 'year') && 
            (productPrice.recurring.interval_count == 1)
          ) {
            planObj['duration_in_months'] = 12
          } else if (productPrice.type == 'one_time') {
            planObj['duration_in_months'] = null
          }

          setPlans(plans => [...plans, planObj])
        })
      }
      
      firebaseStore
        .collection('Subscribers')
        .doc(authUser.uid)
        .get()
        .then(doc => {
          if (doc && doc.data()) {
            if (doc.data().grant) {
              setLicenseType(doc.data().grant.licenseType)
              setExpiryDate(doc.data().grant.expiryDate)
            }
          }
        })
    }
  }, [authUser])

  useEffect(() => {
    if (expiryDate != null) {
      if (isAfter(Firebase.firestore.Timestamp.now().toMillis(), expiryDate.toMillis())) {
        setIsSubscriptionExpired(true)
      } else {
        setIsSubscriptionExpired(false)
      }
    }
  }, [expiryDate])

  useEffect(() => {
    if (plans.length >= 4) {
      console.log(plans)
      setChecking(false)
    } else {
      setChecking(true)
    }
  }, [plans])

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
      if (activeProductPrice == 'price_1KUZtpAuTlAR8JLMaSEej0uo') {
        setDuration(1)
      } else if (activeProductPrice == 'price_1KUZx2AuTlAR8JLMaal6ifzP') {
        setDuration(3)
      } else if (activeProductPrice == 'price_1K09ueAuTlAR8JLM3JmfvSgj') {
        setDuration(12)
      }
    }
  }, [activeProductPrice])

  const handleSubscription = async (e) => {
    e.preventDefault()

    setChecking(true)

    if (authUser) {
      const processStripeSubscription = firebaseFunctions.httpsCallable('processStripeSubscription')
  
      processStripeSubscription({
        type: 'subscription',
        duration: duration,
        mode: 'subscription',
        customerEmail: authUser.email,
        redirectUrl: window.location.origin + '/buy/thank-you',
        cancelUrl: window.location.origin
      }).then(result => {
        location.href = result.data.session.url
      })
    }
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
          
          {(licenseType == 'Premium' && !isSubscriptionExpired) && (
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
            </div>
          )}

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
                  {plans.map(plan => (
                    <>
                      {plan.duration_in_months != null && (
                        <div className={`${styles.buy_selection_item} ${ duration == plan.duration_in_months ? styles.active : '' }`} onClick={e => {setDuration(plan.duration_in_months)}}>
                          <span className={styles.buy_circle}>{ duration == plan.duration_in_months ? <CheckRoundedIcon /> : '' }</span>

                          {plan.interval_count == 1 && <p>${plan.amount} <span>/ {`${plan.interval_count} ${plan.interval}`}</span></p>}

                          {plan.interval_count == 3 && <p>${plan.amount} <span>/ {`${plan.interval_count} ${plan.interval}s`}</span></p>}
                        </div>
                      )}
                    </>
                  ))}
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