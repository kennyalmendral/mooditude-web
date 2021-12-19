import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Profile.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import GridLoader from "react-spinners/GridLoader"
import Firebase from 'lib/Firebase'
import TextField from '@mui/material/TextField'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import MoonLoader from "react-spinners/MoonLoader"
import { FormLabel } from '@mui/material';

import { format } from 'date-fns'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';

export default function profileSubscription() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [checking, setChecking] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const [grant, setGrant] = useState({})
  const [subscription, setSubscription] = useState({})
  const [cancelAt, setCancelAt] = useState('')

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
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
            if (doc.data().grant) {
              setGrant(doc.data().grant)

              const getStripeSubscriptionDirect = firebaseFunctions.httpsCallable('getStripeSubscriptionDirect')
  
              getStripeSubscriptionDirect({
                subscriptionId: doc.data().grant.transactionId
              }).then(result => {
                setSubscription(result.data.subscription)

                console.log(result.data.subscription)

                setChecking(false)
              })
            } 
          }
        })
    }
  }, [authUser])

  useEffect(() => {
    if (subscription) {
      subscription.cancel_at != null && setCancelAt(subscription.cancel_at)
    }
  }, [subscription])
  
  const handleCancelSubscription = () => {
    const confirmation = confirm('Are you sure?')

    if (confirmation) {
      const cancelStripeSubscription = firebaseFunctions.httpsCallable('cancelStripeSubscription')
    
      cancelStripeSubscription({
        subscriptionId: grant.transactionId
      }).then(result => {
        setCancelAt(result.data.response.cancel_at)
      })
    }
  }

  return (
    <Layout title={`Manage Subscription | ${SITE_NAME}`}>
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
          
          <div className={styles.profileWrapper}>
              <div className={styles.profileInnerWrapper}>
                <div className={styles.profileInnerHeader}>
                  <Link href="/profile"><a>← Go Back</a></Link>
                  <h1>Manage Subscription</h1>
                </div>
                <div className={styles.profileInnerPage}>
                  <div className={styles.subscriptionInnerPage}>
                    <div className={styles.subscriptionInnerItem}>
                      <p><b>Subscription Period:</b></p>
                      <p>{subscription.plan && subscription.plan.interval.charAt(0).toUpperCase() + subscription.plan.interval.slice(1) + 'ly'}</p>
                    </div> 

                    <div className={styles.subscriptionInnerItem}>
                      <p><b>Status:</b></p>
                      <p>{subscription.status && subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}</p>
                    </div> 

                    <div className={styles.subscriptionInnerItem}>
                      <p><b>Auto Renewal On:</b></p>
                      <p>{subscription.status == 'active' ? 'Yes' : 'No'}</p>
                    </div> 


                    <div className={styles.subscriptionInnerItem}>
                      <p><b>Renewal Date:</b></p>
                      <p>{format(new Date(parseInt(subscription.current_period_end) * 1000), 'LLLL dd, yyyy')}</p>
                    </div> 

                    <div className={styles.subscriptionInnerItem}>
                      <p><b>Cancel Subscription:</b></p>
                      <div>
                        <p>Statement or action here depends on where user purchased the subscription from. For example:</p>

                        <p>You purchased Mooditude Premium from Apple App Store. Cancel  your subscription from the App Store.</p>


                        <p>You purchased Mooditude Premium from Google Play. Cancel your subscription from the Google Play Store.</p>

                        {cancelAt != '' && (
                          <p>Your subscription will be canceled on {format(new Date(parseInt(cancelAt) * 1000), 'LLLL dd, yyyy')}.</p>
                        )}

                        {cancelAt == '' && (
                          <p><a onClick={handleCancelSubscription} style={{ cursor: 'pointer' }}>Click here to cancel your subscription.</a></p>
                        )}
                      </div> 
                    </div> 
                  </div>
                </div>
              </div>
          </div>
        </>
      }
      
    </Layout>
  )
}