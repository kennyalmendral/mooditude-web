import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from '@/styles/Auth.module.css'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import { useAuth } from '@/context/AuthUserContext'

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()

export default function SignUp() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isPrivacyPolicyChecked, setIsPrivacyPolicyChecked] = useState(false)
  const [error, setError] = useState(null)
  const [isSigningUp, setIsSigningUp] = useState(false)

  const { createUserWithEmailAndPassword } = useAuth()

  const handleSignUp = e => {
    e.preventDefault()

    setIsSigningUp(true)
    setError(null)

    if (password === passwordConfirmation) {
      createUserWithEmailAndPassword(email, password)
        .then(authUser => {
          setIsSigningUp(false)
          
          firebaseAuth.onAuthStateChanged(user => {
            if (user) {
              firebaseStore
                .collection('Users')
                .doc(user.uid)
                .set({
                  name: name,
                  photo: '',
                  badges: {
                    ticks: 0,
                    crowns: 0,
                    starts: 0
                  },
                  customerType: 'free',
                })
              
              firebaseDatabase
                .ref()
                .child('users')
                .child(user.uid)
                .set({
                  email: email,
                  userId: user.uid,
                  name: name,
                  photo: '',
                  topGoal: '',
                  topChallenges: '',
                  memberSince: new Date().getTime(),
                  committedToSelfhelp: false,
                  activatedReminderAtStartup: false,
                  knowCbt: false,
                  ageGroup: 0,
                  gender: 0,
                  veteranStatus: '',
                  ethnicity: '',
                  religion: '',
                  isParent: null,
                  isLGBTQ: null,
                  phone: '',
                  userAddress: null,
                  culturalValues: null,
                  companyInfo: null,
                  goingToTherapy: false,
                  isAdmin: false,
                  freshChatRestoreID: null,
                  customerType: 'free',
                  paymentType: null,
                  expiryDate: null,
                  stats: null,
                  nps: 0,
                  onboardingStep: 0,
                  lastAssessmentScore: null,
                  lastAssessmentDate: null
                })

              if (
                (localStorage.getItem('currentProfileStep') !== null) || 
                (localStorage.getItem('currentProfileStep') !== '')
              ) {
                localStorage.removeItem('currentProfileStep')
              }

              if (
                (localStorage.getItem('currentAssessmentStep') !== null) || 
                (localStorage.getItem('currentAssessmentStep') !== '')
              ) {
                localStorage.removeItem('currentAssessmentStep')
              }
            }
          })
          
          router.push('/onboarding/welcome')
        })
        .catch(error => {
          setIsSigningUp(false)
          setError(error.message)
        })
    } else {
      setError('Passwords do not match.')
      setIsSigningUp(false)
    }
  }

  return (
    <Layout title={`Join ${SITE_NAME} | ${SITE_NAME}`}>
      <div className={styles.container}>
        <div className={styles.authBg}></div>

        <div className={styles.authForm}>
          <div className={styles.authFormInner}>
            <img  
              src="/mooditude-logo.png" 
              width="113" 
              height="113" 
              alt="Mooditude"
            />

            <div className={styles.headingContainer}>
              <div>
                <h1 className={styles.heading}>Join {SITE_NAME}</h1>
                <h4 className={styles.subHeading}>You deserve to be happy!</h4>
              </div>
              
              <div>
                <Link href="/auth/login">
                  <a>Log In</a>
                </Link>
              </div>
            </div>

            <div>
              <form onSubmit={handleSignUp}>
                <div>
                  {error && (
                    <div className={styles.errorAlert}>
                      {error && <span>{error}</span>}
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <input 
                    type="text" 
                    id="name" 
                    placeholder="Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required
                  />
                </div>

                <div className={styles.field}>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="Email address" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                  />
                </div>

                <div className={styles.field}>
                  <input 
                    type="password" 
                    id="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                  />
                </div>

                <div className={styles.passwordNotice}>
                  Password should be 8 characters long and include a capital letter, a number, and a special character.
                </div>

                <div className={styles.field}>
                  <input 
                    type="password" 
                    id="password-confirmation" 
                    placeholder="Confirm Password" 
                    value={passwordConfirmation} 
                    onChange={e => setPasswordConfirmation(e.target.value)} 
                    required
                  />
                </div>

                <div className={styles.privacyPolicy}>
                  <input 
                    type="checkbox" 
                    id="privacy-policy" 
                    checked={isPrivacyPolicyChecked} 
                    onChange={e => setIsPrivacyPolicyChecked(!isPrivacyPolicyChecked)}
                  />
                  
                  <label htmlFor="privacy-policy">
                    I agree with the
                    {' '}
                    <Link href="#">
                      <a>Terms &amp; Privacy Policy</a>
                    </Link>
                  </label>
                </div>

                <div>
                  <button 
                    type="submit" 
                    disabled={!isPrivacyPolicyChecked || isSigningUp && true}
                  >
                    {isSigningUp && (
                      <>PLEASE WAIT</>
                    )}

                    {!isSigningUp && (
                      <>SIGN UP</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}