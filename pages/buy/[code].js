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

export default function Code() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [code, setCode] = useState('')
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
      router.query.code && 
      router.query.message && 
      router.query.success
    ) {
      let code = router.query.code
      let expiryDate = router.query.expiry_date
      let message = router.query.message

      setCode(code)

      if (code == 'code1') {
        setExpiryDate(format(new Date(parseInt(expiryDate)), 'LLLL dd, yyyy'))
      }

      setMessage(message)
    }
  }, [authUser, router])

  const handleDiscountPurchase = async (e) => {
    e.preventDefault()

    setShowLoader(true)

    const processStripeSubscription = firebaseFunctions.httpsCallable('processStripeSubscription')
  
    processStripeSubscription({
      plan: 'yearly-50-off',
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
      plan: 'yearly-30-trial',
      redirectUrl: window.location.origin + '/buy/thank-you',
      cancelUrl: window.location.origin + '/buy'
    }).then(result => {
      location.href = result.data.session.url
    })
  }

  return (
    <Layout title={code == 'code4' ? `Start with a 30-Day Free Trial | ${SITE_NAME}` : `Congratulations | ${SITE_NAME}`}>
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
              {(code == 'code1' || code == 'code3') && (
                <h2>Congratulations!</h2>
              )}

              {code == 'code2' && (
                <>
                  <h2>{message}</h2>
                  <p>Start your wellbeing journey<br />with Mooditude Premium</p>
                </>
              )}

              {code == 'code4' && (
                <>
                  <h2 style={{ padding: '36px 20px 0' }}>{message}</h2>
                  <p>Start your wellbeing journey<br />with Mooditude Premium</p>
                </>
              )}
            </div>

            <div className={styles.promoCodeInnerBottom}>
              {code == 'code1' && (
                <>
                  <p className={styles.promoCodeInnerThankYouText}>{message}</p>
                  <p className={styles.promoCodeInnerCancelText}>Till {expiryDate}</p>
                </>
              )}

              {code == 'code2' && (
                <>
                  <div>
                    <img src="/crown.svg" style={{ width: '60px', marginBottom: 0 }} />
                  </div>

                  <div className={styles.promoCodeInnerBottom}>
                    <form onSubmit={handleDiscountPurchase}>
                      <button 
                        style={{
                          padding: '15px'
                        }}
                      >
                        $44.99 / YEAR
                      </button>
                    </form>

                    <p className={styles.promoCodeInnerCancelText}>Cancel Anytime.</p>
                  </div>
                </>
              )}

              {code == 'code3' && (
                <p className={styles.promoCodeInnerThankYouText}>{message}</p>
              )}

              {code == 'code4' && (
                <>
                  <div>
                    <img src="/crown.svg" style={{ width: '60px', marginBottom: 0 }} />
                  </div>

                  <div className={styles.promoCodeInnerBottom} style={{ padding: '25px 0' }}>
                    <p >Start with a 30-Day Free Trial</p>

                    <form onSubmit={handleTrial}>
                      <button 
                        style={{
                          padding: '9px 15px'
                        }}
                      >
                        $89.99 / YEAR <span style={{ opacity: 0.7 }}>After 30-Day FREE Trial</span>
                      </button>
                    </form>

                    <p className={styles.promoCodeInnerCancelText}>Cancel Anytime.</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {(code == 'code1' || code == 'code3') && (
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