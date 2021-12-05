import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from '@/styles/Auth.module.css'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import { useAuth } from '@/context/AuthUserContext'
import TextField from '@mui/material/TextField';

import Firebase from 'lib/Firebase'

const firebaseAuth = Firebase.auth()
const firebaseStore = Firebase.firestore()
const firebaseDatabase = Firebase.database()

export default function Login(props) {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const { authUser, loading, signInWithEmailAndPassword } = useAuth()

  useEffect(() => {
    setTimeout(() => {
      props.removePageLoader()
    },300)

    if (loading && authUser) {
      if (authUser) {
        firebaseDatabase
          .ref()
          .child('users')
          .child(authUser.uid)
          .once('value')
          .then((snapshot) => {
            const snapshotValue = snapshot.val()

            if (snapshotValue != null) {
              if (snapshotValue.onboardingStep == null) {
                location.href = '/onboarding/welcome'
              }
  
              if (snapshotValue.onboardingStep == 'accountCreated') {
                if (snapshotValue.committedToSelfhelp == true || snapshotValue.committedToSelfhelp == false) {
                  location.href = '/onboarding/get-started'
                } else {
                  location.href = '/onboarding/welcome'
                }
              } else if (snapshotValue.onboardingStep == 'profileCreated') {
                firebaseStore
                  .collection('M3Assessment')
                  .doc(authUser.uid)
                  .collection('scores')
                  .get()
                  .then(doc => {
                    if (doc.docs.length > 0) {
                      location.href = '/assessment/dashboard'
                    } else {
                      location.href = '/onboarding/get-started'
                    }
                  })
              } else if (snapshotValue.onboardingStep == 'tookAssessment') {
                location.href = '/assessment/dashboard'
              }
            }
          })
      }
    }
  }, [authUser, loading, router])

  const handleLogin = e => {
    e.preventDefault()

    props.loginLoaderHandler(true)
    setIsLoggingIn(true)
    setError(null) 
    signInWithEmailAndPassword(email, password)
      .then(user => {
        setIsLoggingIn(false)
        router.push('/onboarding/welcome')

        if (user) {
          firebaseDatabase
            .ref()
            .child('users')
            .child(user.user.uid)
            .once('value')
            .then((snapshot) => {
              const snapshotValue = snapshot.val()

              if (snapshotValue != null) {
                if (snapshotValue.onboardingStep == null) {
                  location.href = '/onboarding/welcome'
                }
  
                if (snapshotValue.onboardingStep == 'accountCreated') {
                  if (snapshotValue.committedToSelfhelp == true || snapshotValue.committedToSelfhelp == false) {
                    location.href = '/onboarding/get-started'
                  } else {
                    location.href = '/onboarding/welcome'
                  }
                } else if (snapshotValue.onboardingStep == 'profileCreated') {
                  firebaseStore
                    .collection('M3Assessment')
                    .doc(user.user.uid)
                    .collection('scores')
                    .get()
                    .then(doc => {
                      if (doc.docs.length > 0) {
                        location.href = '/assessment/dashboard'
                      } else {
                        location.href = '/onboarding/get-started'
                      }
                    })
                } else if (snapshotValue.onboardingStep == 'tookAssessment') {
                  location.href = '/assessment/dashboard'
                }
              } else {
                location.href = '/onboarding/welcome'
              }
            })
        }
      })
      .catch(error => {
        console.log('error')
        props.loginLoaderHandler(false)
        setIsLoggingIn(false)
        setError(error.message)
      })
  }

  return (
    <Layout title={`Login | ${SITE_NAME}`}>
      <div className={`${styles.container} auth_page_wrapper`}>
        <div className={styles.authBg}></div>

        <div className={styles.authForm}>
          <div className={styles.authFormInner}>
            <img  
              src="/logo_svg.svg" 
              width="113" 
              height="113" 
              alt="Mooditude"
              className={styles.login_logo}
            />

            <div className={styles.headingContainer}>
              <div>
                <h1 className={styles.heading}>Log In</h1>
                <h4 className={styles.subHeading}>Welcome back!</h4>
              </div>
              
              <div>
                <Link href="/auth/signup">
                  <a>Sign Up</a>
                </Link>
              </div>
            </div>

            <div>
              <form onSubmit={handleLogin}>
                <div className={styles.field}>

                  <TextField 
                    label="Email address" 
                    variant="outlined" 
                    type="email" 
                    id="email" 
                    
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                    fullWidth={true}
                    size={"small"}
                    
                  />
 
                </div>

                <div className={styles.field}>

                  <TextField 
                    type="password" 
                    id="password" 
                    label="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                    fullWidth={true}
                    size={"small"}
                    error={error}
                    helperText={error ? 'Invalid email or password' : ''}
                  />
                  

                  {/*{error && (
                    <div className={styles.error}>
                      {error && <span>{error}</span>}
                    </div>
                  )}*/}
                </div>

                <div>
                  <button
                    type="submit" 
                    disabled={isLoggingIn && true}
                  >
                    {isLoggingIn && (
                      <>PLEASE WAIT</>
                    )}

                    {!isLoggingIn && (
                      <>SUBMIT</>
                    )}
                  </button>
                </div>

                <div>
                  <span>Forgot password? Rest it</span>
                  {' '}
                  <Link href="/auth/forgot-password">
                    <a>here.</a>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>     
      </div>
    </Layout>
  )
}