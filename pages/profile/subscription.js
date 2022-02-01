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

import { format, isAfter } from 'date-fns'

import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

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
  const [paymentProcessor, setPaymentProcessor] = useState(null)
  const [subscription, setSubscription] = useState({})
  const [cancelAt, setCancelAt] = useState('')

  const [isCanceling, setIsCanceling] = useState(false)
  const [isRenewing, setIsRenewing] = useState(false)
  const [openCancelConfirmationDialog, setOpenCancelConfirmationDialog] = useState(false)
  const [openRenewConfirmationDialog, setOpenRenewConfirmationDialog] = useState(false)

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
            if (doc.data().grant) {
              setGrant(doc.data().grant)

              if (doc.data().grant.transactionId.includes('sub_')) {
                const getStripeSubscriptionDirect = firebaseFunctions.httpsCallable('getStripeSubscriptionDirect')
  
                getStripeSubscriptionDirect({
                  subscriptionId: doc.data().grant.transactionId
                })
                .then(result => {
                  setSubscription(result.data.subscription)

                  console.log(result.data.subscription)

                  setChecking(false)
                })
                .catch(err => {
                  console.log(err)

                  setChecking(false)
                })
              } else {
                setChecking(false)
              }
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

  useEffect(() => {
    Object.keys(grant).length && setPaymentProcessor(grant.paymentProcessor)
    console.log(grant)
  }, [grant])

  const handleProceedCancelation = () => {
    setIsCanceling(true)

    const cancelStripeSubscription = firebaseFunctions.httpsCallable('cancelStripeSubscription')
    
    cancelStripeSubscription({
      subscriptionId: grant.transactionId
    }).then(result => {
      setCancelAt(result.data.response.cancel_at)
      setOpenCancelConfirmationDialog(false)
      setIsCanceling(false)

      if (authUser) {
        firebaseDatabase
          .ref()
          .child('users')
          .child(authUser.uid)
          .update({
            'cancelAt': result.data.response.cancel_at
          })
      }
    })
  }

  const handleProceedRenewal = () => {
    setIsRenewing(true)

    const renewStripeSubscription = firebaseFunctions.httpsCallable('renewStripeSubscription')
  
    renewStripeSubscription({
      subscriptionId: grant.transactionId
    })
    .then(result => {
      setCancelAt('')
      setOpenRenewConfirmationDialog(false)
      setIsRenewing(false)

      if (authUser) {
        firebaseDatabase
          .ref()
          .child('users')
          .child(authUser.uid)
          .update({
            'cancelAt': null
          })
      }
    })
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
          <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            maxWidth="xs"
            open={openCancelConfirmationDialog}
          >
            <DialogTitle style={{ fontFamily: 'Circular Std' }}>Are you sure?</DialogTitle>

            <DialogContent style={{ fontFamily: 'Circular Std' }} dividers>
              <p style={{ margin: 0 }}>This operation will cancel your current subscription.</p>
            </DialogContent>

            <DialogActions>
              <Button style={{ fontFamily: 'Circular Std' }} onClick={() => setOpenCancelConfirmationDialog(false)}>Cancel</Button>
              
              <Button 
                style={{ fontFamily: 'Circular Std' }} 
                onClick={handleProceedCancelation} 
                disabled={isCanceling ? true : false}
              >
                {isCanceling && 'Please wait'}
                {!isCanceling && 'Proceed'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            maxWidth="xs"
            open={openRenewConfirmationDialog}
          >
            <DialogTitle style={{ fontFamily: 'Circular Std' }}>Are you sure?</DialogTitle>

            <DialogContent style={{ fontFamily: 'Circular Std' }} dividers>
              <p style={{ margin: 0 }}>This operation will renew your canceled subscription.</p>
            </DialogContent>

            <DialogActions>
              <Button style={{ fontFamily: 'Circular Std' }} onClick={() => setOpenRenewConfirmationDialog(false)}>Cancel</Button>
              
              <Button 
                style={{ fontFamily: 'Circular Std' }} 
                onClick={handleProceedRenewal} 
                disabled={isRenewing ? true : false}
              >
                {isRenewing && 'Please wait'}
                {!isRenewing && 'Proceed'}
              </Button>
            </DialogActions>
          </Dialog>

          <div className={styles.profileWrapper}>
              <div className={styles.profileInnerWrapper}>
                <div className={styles.profileInnerHeader}>
                  <h4>ACCOUNT</h4>
                  <h1>Manage Subscription</h1>
                </div>

                <div className={styles.profileInnerPage}>
                  <div className={styles.subscriptionInnerPage}>
                    {((paymentProcessor == null) || (paymentProcessor == undefined) || (paymentProcessor == '')) && (
                      <p style={{ textAlign: 'center' }}>You have no active subscription yet.</p>
                    )}

                    {((paymentProcessor != null) || (paymentProcessor != undefined) || (paymentProcessor != '')) && (
                      <>
                        <div className={styles.subscriptionInnerItem}>
                          <p><strong>Subscription Period:</strong></p>
                          <p>{grant.duration}</p>
                          {/* {paymentProcessor == 'stripe' && <p>{subscription.plan && subscription.plan.interval.charAt(0).toUpperCase() + subscription.plan.interval.slice(1) + 'ly'}</p>} */}
                        </div> 

                        <div className={styles.subscriptionInnerItem}>
                          <p><strong>Status:</strong></p>
                          {paymentProcessor == 'stripe' && <p>{subscription.status && subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}</p>}

                          {paymentProcessor != 'stripe' && <p>{isAfter(Firebase.firestore.Timestamp.now().toMillis(), grant.expiryDate.toMillis()) ? 'Inactive' : 'Active'}</p>}
                        </div> 

                        {/* <div className={styles.subscriptionInnerItem}>
                          <p><strong>Auto Renewal On:</strong></p>
                          {paymentProcessor == 'stripe' && <p>{subscription.status == 'active' ? 'Yes' : 'No'}</p>}
                        </div>  */}

                        <div className={styles.subscriptionInnerItem}>
                          <p><strong>Renewal Date:</strong></p>

                          {paymentProcessor == 'stripe' && <p>{format(new Date(parseInt(subscription.current_period_end) * 1000), 'LLLL dd, yyyy')}</p>}

                          {paymentProcessor != 'stripe' && <p>{format(grant.expiryDate.toMillis(), 'LLLL dd, yyyy')}</p>}
                        </div> 

                        <div className={styles.subscriptionInnerItem}>
                          <p><strong>Cancel Subscription:</strong></p>

                          <div>
                            {paymentProcessor == 'apple' && <p>You purchased Mooditude Premium from Apple App Store, cancel your subscription from the App Store.</p>}

                            {paymentProcessor == 'google' && <p>You purchased Mooditude Premium from Google Play Store, cancel your subscription from the Google Play Store.</p>}

                            {paymentProcessor == 'Mooditude' && <p>You purchased Mooditude Premium from Mooditude, cancel your subscription from Mooditude.</p>}

                            {paymentProcessor == 'stripe' && (
                              <>
                                {cancelAt != '' && (
                                  <p>
                                    Your subscription will be canceled on {format(new Date(parseInt(cancelAt) * 1000), 'LLLL dd, yyyy')}.
                                    {' '}
                                    <a onClick={() => setOpenRenewConfirmationDialog(true)} style={{ cursor: 'pointer' }}>Click here to renew</a>
                                  </p>
                                )}

                                {cancelAt == '' && (
                                  <p><a onClick={() => setOpenCancelConfirmationDialog(true)} style={{ cursor: 'pointer' }}>Click here to cancel your subscription</a></p>
                                )}
                              </>
                            )}
                          </div> 
                        </div> 
                      </>
                    )}
                  </div>
                </div>
              </div>
          </div>
        </>
      }
      
    </Layout>
  )
}