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

const firebaseFunctions = Firebase.functions()

export default function CouponApplied() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [codeType, setCodeType] = useState('')
  const [duration, setDuration] = useState(0)
  const [discount, setDiscount] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [message, setMessage] = useState('')
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }

    setShowLoader(false)
  }, [authUser, loading, router])

  useEffect(() => {    
    if (
      router.query.code_type && 
      router.query.message && 
      router.query.success
    ) {
      setCodeType(router.query.code_type)
      setMessage(router.query.message)
      setDuration(router.query.duration)

      if (router.query.code_type == 'purchased') {
        router.query.expiry_date && setExpiryDate(format(new Date(parseInt(router.query.expiry_date)), 'LLLL dd, yyyy'))
      }

      if (router.query.code_type == 'discount') {
      }
    }

  }, [authUser, router])

  // useEffect(() => {
  //   codeType && console.log(codeType)
  // }, [codeType])

  const handleDiscount = async (e) => {
    e.preventDefault()

    setShowLoader(true)

    const processStripeSubscription = firebaseFunctions.httpsCallable('processStripeSubscription')
  
    processStripeSubscription({
      plan: 'yearly',
      codeType: codeType,
      message: message,
      redirectUrl: window.location.origin + '/buy/thank-you',
      cancelUrl: window.location.origin + '/buy'
    }).then(result => {
      location.href = result.data.session.url
    })
  }

  const handleTrial = async (e) => {
    e.preventDefault()

    setShowLoader(true)

    const processStripeSubscription = firebaseFunctions.httpsCallable('processStripeSubscription')
  
    processStripeSubscription({
      plan: 'monthly',
      codeType: codeType,
      duration: duration,
      message: message,
      redirectUrl: window.location.origin + '/buy/thank-you',
      cancelUrl: window.location.origin + '/buy'
    }).then(result => {
      location.href = result.data.session.url
    })
  }

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
              {codeType == 'purchased' && (
                <h2>Congratulations!</h2>
              )}

              {codeType == 'discount' && (
                <>
                  <h2>{message}</h2>
                  <p>Start your wellbeing journey<br />with Mooditude Premium</p>
                </>
              )}

              {codeType == 'trial' && (
                <>
                  {/* <h2>{message}</h2> */}
                  <h2>Free for a month</h2>
                  <p>Start your wellbeing journey<br />with Mooditude Premium</p>
                </>
              )}
            </div>

            <div className={styles.promoCodeInnerBottom}>
              {codeType == 'purchased' && (
                <>
                  <p className={styles.promoCodeInnerThankYouText}>{message}</p>

                  {expiryDate && (
                    <p className={styles.promoCodeInnerCancelText}>Till {expiryDate}</p>
                  )}
                </>
              )}

              {codeType == 'discount' && (
                <>
                  <div>
                    <img src="/crown.svg" style={{ width: '60px', marginBottom: 0 }} />
                  </div>

                  <div className={styles.promoCodeInnerBottom} style={{ padding: '25px 0' }}>
                    <form onSubmit={handleDiscount}>
                      <button 
                        style={{
                          padding: '9px 15px'
                        }}
                      >
                        $44.99 / YEAR
                      </button>
                    </form>

                    <p className={styles.promoCodeInnerCancelText}>Cancel Anytime.</p>
                  </div>
                </>
              )}

              {codeType == 'trial' && (
                <>
                  <div>
                    <img src="/crown.svg" style={{ width: '60px', marginBottom: 0 }} />
                  </div>

                  <div className={styles.promoCodeInnerBottom} style={{ padding: '25px 0' }}>
                    {duration > 0 && <p>Start with a {duration}-Day Free Trial</p>}

                    <form onSubmit={handleTrial}>
                      <button 
                        style={{
                          padding: '9px 15px'
                        }}
                      >
                        $89.99 / YEAR 
                        {' '}
                        {duration > 0 && <span style={{ opacity: 0.7 }}>After {duration}-Day FREE Trial</span>}
                      </button>
                    </form>

                    <p className={styles.promoCodeInnerCancelText}>Cancel Anytime.</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {codeType == 'purchased' && (
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
          )}
        </div>
      </div>
    </Layout>
  )
}