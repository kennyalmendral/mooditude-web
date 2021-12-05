import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from '@/styles/Auth.module.css'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useAuth } from '@/context/AuthUserContext'

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()

export default function SignUp(props) {
  const router = useRouter()
  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  const hasNumber = /\d/;  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isPrivacyPolicyChecked, setIsPrivacyPolicyChecked] = useState(false)
  const [error, setError] = useState(null)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [isMinChar, setIsMinChar] = useState(false)
  const [isOneDigit, setIsOneDigit] = useState(false)
  const [isSpecialChar, setIsSpecialChar] = useState(false)
  const [isMatch, setIsMatch] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(true)

  const { authUser, createUserWithEmailAndPassword } = useAuth()

  const checkPass = (p1 = '', p2 = '', policy = false) => {
    
    p1 = p1 == '' ? password : p1
    p2 = p2 == '' ? passwordConfirmation : p2
    if (p1.length >= 8) {
      setIsMinChar(true)
    }else{
      setIsMinChar(false)
    }

    if (hasNumber.test(p1)) {
      setIsOneDigit(true)
    }else{
      setIsOneDigit(false)
    }

    if (specialChars.test(p1)) {
      setIsSpecialChar(true)
    }else{
      setIsSpecialChar(false)
    }


    if (p1.length > 1 && p1 == p2) {
      setIsMatch(true)
    }else{
      setIsMatch(false)
    }

    if (p1.length >= 8 && hasNumber.test(p1) && specialChars.test(p1) && p1 == p2 && policy ) {
      setBtnDisabled(false)
    }else{
      setBtnDisabled(true)
    }
      
  }

  const handleSignUp = e => {
    e.preventDefault()

    setBtnDisabled(true)
    setIsSigningUp(true)
    setError(null)

    if (password === passwordConfirmation) {
      props.loginLoaderHandler(true)
      createUserWithEmailAndPassword(email, password)
        .then(authUser => {
          setIsSigningUp(false)
          props.loginLoaderHandler(true)

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
                .then(() => {
                  firebaseDatabase
                    .ref()
                    .child('users')
                    .child(user.uid)
                    .set({
                      email: email,
                      userId: user.uid,
                      name: name,
                      photo: null,
                      topGoal: null,
                      topChallenges: null,
                      memberSince: new Date().getTime(),
                      committedToSelfhelp: false,
                      activatedReminderAtStartup: false,
                      knowCbt: false,
                      ageGroup: 0,
                      gender: 0,
                      veteranStatus: null,
                      ethnicity: null,
                      religion: null,
                      isParent: null,
                      isLGBTQ: null,
                      phone: null,
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
                      onboardingStep: 'accountCreated',
                      lastAssessmentScore: null,
                      lastAssessmentDate: null
                    })
                    .then(() => {
                      location.href = '/onboarding/welcome'

                      localStorage.setItem(`${user.uid}_currentProfileStep`, 0)
                      localStorage.setItem(`${user.uid}_onboardingStep`, 'accountCreated')
                    })
                })
            }
          })
          
          // router.push('/onboarding/welcome')
        })
        .catch(error => {
          props.loginLoaderHandler(false)
          setIsSigningUp(false)
          checkPass(password, passwordConfirmation, isPrivacyPolicyChecked)
          setError(error.message)
        })
    } else {
      setError('Passwords do not match.')
      setIsSigningUp(false)
      checkPass(password, passwordConfirmation, isPrivacyPolicyChecked)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      props.removePageLoader()
    },300)
    
  }, [])

  return (
    <Layout title={`Join ${SITE_NAME} | ${SITE_NAME}`}>
      <div className={`${styles.container} auth_page_wrapper`}>
        <div className={styles.authBg}></div>

        <div className={styles.authForm}>
          <div className={styles.authFormInner}>
            <img  
              src="/logo_svg.svg" 
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

                  <TextField 
                    label="Name" 
                    variant="outlined" 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required
                    fullWidth={true}
                    size={"small"}
                    autoComplete="new-password"
                  />

                </div>

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
                    autoComplete="new-password"
                    
                  />
                  
                </div>

                <div className={styles.field}>
                  <TextField 
                    label="Password" 
                    variant="outlined" 
                    type="password" 
                    id="password" 
                    autoComplete="new-password"
                    value={password} 
                    onChange={e => {setPassword(e.target.value);checkPass(e.target.value, passwordConfirmation, isPrivacyPolicyChecked)}} 
                    required
                    fullWidth={true}
                    size={"small"}
                  />
   
                </div>

          

                <div className={styles.field}>
                  <TextField 
                    label="Confirm Password" 
                    variant="outlined" 
                    type="password" 
                    id="password-confirmation" 
                    value={passwordConfirmation} 

                    onChange={e => {setPasswordConfirmation(e.target.value);checkPass(password, e.target.value, isPrivacyPolicyChecked)}} 
                    required
                    fullWidth={true}
                    size={"small"}
                    autoComplete="new-password"
                  />
                  
                </div>

                <div className={styles.privacyPolicy}>

                  <FormGroup>
                    <FormControlLabel 

                      control={<Checkbox 
                          className={`${styles.privacyPolicyLabel} no_bg`}
                          type="checkbox" 
                          id="privacy-policy" 
                          checked={isPrivacyPolicyChecked} 
                          onChange={e => {setIsPrivacyPolicyChecked(e.target.checked);checkPass(password, passwordConfirmation, e.target.checked)}}
                        />} 
                      label={<div className={styles.privacyPolicyText} dangerouslySetInnerHTML={{__html: `I agree with the
                      <Link href="#">
                        <a>Terms &amp; Privacy Policy</a>
                      </Link>`}} />}

                    />
                  </FormGroup>
              
                </div>

                {
                  password.length > 0 ? 

                  <div className={styles.passwordChecker}>

                    <FormGroup>
                      <FormControlLabel 
                        className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isMinChar ? 'grayIsChecked' : ''}`}
                        control={<Checkbox  checked={isMinChar} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                        label={"Minimum 8 characters long"}
                      />

                      <FormControlLabel 

                        className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isOneDigit ? 'grayIsChecked' : ''}`}
                        control={<Checkbox checked={isOneDigit} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                        label={"1 Digit"}
                      />

                      <FormControlLabel

                        className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isSpecialChar ? 'grayIsChecked' : ''}`}
                        control={<Checkbox checked={isSpecialChar} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                        label={"1 special character (%$#@!&*)"}
                      />

                      <FormControlLabel

                        className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isMatch ? 'grayIsChecked' : ''}`}
                        control={<Checkbox checked={isMatch} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                        label={"Confirm password matches"}
                      />

                    </FormGroup>
                    
                  </div> : ''
                }

                

                <div>
                  <button 
                    type="submit" 
                    disabled={btnDisabled}
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