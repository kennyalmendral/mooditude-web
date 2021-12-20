import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Profile.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import GridLoader from "react-spinners/GridLoader"
import Firebase from 'lib/Firebase'
import TextField from '@mui/material/TextField'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import MoonLoader from "react-spinners/MoonLoader"
import { FormLabel } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';

export default function ResetPasswordCode(props) {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [checking, setChecking] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isResetPasswordEmailSent, setIsResetPasswordEmailSent] = useState(false)

  const { sendPasswordResetEmail } = useAuth()

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser) {
      setChecking(false)

      firebaseDatabase
        .ref()
        .child('users')
        .child(authUser.uid)
        .once('value')
        .then((snapshot) => {
          const snapshotValue = snapshot.val()

          if (snapshotValue != null) {
            setEmail(snapshotValue.email)

            console.log(snapshotValue.email)
          }
        })
    }
  }, [authUser])

  useEffect(() => {
    setIsResetPasswordEmailSent(false)

    return () => {
      setIsResetPasswordEmailSent(false)
    }
  }, [])

  const handleForgotPassword = e => {
    e.preventDefault()

    setIsSending(true)

    sendPasswordResetEmail(email)
      .then(response => {
        setIsSending(false)
        setIsResetPasswordEmailSent(true)
      })
      .catch(error => {
        setIsSending(false)
        setIsResetPasswordEmailSent(false)
        setError(error.message)
      })
  }
  
  return (
    <Layout title={`Reset Password Code | ${SITE_NAME}`}>
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
                  <h1>Reset Password</h1>
                </div>

                <div className={styles.profileInnerPage}>
                  <form onSubmit={handleForgotPassword}>
                    <div className={styles.subscriptionInnerPage}>
                      <div className={styles.formItem}>
                        <FormLabel>Click the button below to generate a reset password code.</FormLabel>

                        <TextField 
                          label="Email address" 
                          variant="outlined" 
                          type="email" 
                          id="email" 
                          className={error && styles.hasError} 
                          placeholder="Email address" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          fullWidth={true} 
                          size={"small"} 
                          error={error} 
                          helperText={error ? error : ''} 
                          style={{ display: 'none' }} 
                        />
                      </div>
                    </div>

                    <div className={styles.button_wrapper} style={{ marginTop: 0 }}>
                      <Button 
                        size="large" 
                        variant="contained" 
                        type="submit" 
                        disabled={isSending && true}
                      >
                        {isSending && (
                          <>PLEASE WAIT</>
                        )}

                        {!isSending && (
                          <>SEND RESET PASSWORD CODE</>
                        )}
                      </Button>
                    </div>

                    {isResetPasswordEmailSent && <Alert severity="success" style={{ marginTop: '20px' }}>Instructions to reset password are sent to {email}</Alert>}
                  </form>
                </div>
              </div>
          </div>
        </>
      }
      
    </Layout>
  )
}