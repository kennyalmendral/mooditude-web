import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from '@/styles/Auth.module.css'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

const config = require('functions/config/config.json')

import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MoonLoader from "react-spinners/MoonLoader"
import { useAuth } from '@/context/AuthUserContext'

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

export default function SignUp(props) {
  const router = useRouter()
  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  const hasNumber = /\d/;  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isPrivacyPolicyChecked, setIsPrivacyPolicyChecked] = useState(true)
  const [error, setError] = useState(null)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [isMinChar, setIsMinChar] = useState(false)
  const [isOneDigit, setIsOneDigit] = useState(false)
  const [isSpecialChar, setIsSpecialChar] = useState(false)
  const [isMatch, setIsMatch] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(true)
  const [showLoader, setShowLoader] = useState(false)

  const [plans, setPlans] = useState([])

  const { authUser, createUserWithEmailAndPassword } = useAuth()

  useEffect(() => {
    if (router.query.referrer == 'm3') {
      for (const plan in config.stripe.plan.mentalHealthAssessment) {
        const getStripeProduct = firebaseFunctions.httpsCallable('getStripeProduct')
  
        getStripeProduct({
          price: config.stripe.plan.mentalHealthAssessment[plan]
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
    } else {
      for (const plan in config.stripe.plan.mooditudePremium) {
        const getStripeProduct = firebaseFunctions.httpsCallable('getStripeProduct')
  
        getStripeProduct({
          price: config.stripe.plan.mooditudePremium[plan]
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
    }
  }, [])

  useEffect(() => {
    if (authUser) {
      if (localStorage.getItem(`${authUser.uid}_onboardingStep`) == 'accountCreated') {
        location.href = '/onboarding/welcome'
      }
    }
  }, [authUser])

  useEffect(() => {
    if (plans.length >= 4) {
      console.log(plans)
    }
  }, [plans])

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
    setShowLoader(true)

    if (password === passwordConfirmation) {
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
                  stats: {
                    checksCount: 0,
                    starCount: 0,
                    crownsCount: 0
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
                      committedToSelfHelpScale: null,
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
                      assessmentScore: null,
                      assessmentDate: null
                    })
                    .then(() => {
                      localStorage.setItem(`${user.uid}_currentProfileStep`, 0)
                      localStorage.setItem(`${user.uid}_onboardingStep`, 'accountCreated')

                      if (router.query.type != undefined) {
                        const processStripeSubscription = firebaseFunctions.httpsCallable('processStripeSubscription')
  
                        processStripeSubscription({
                          type: router.query.type,
                          duration: router.query.duration,
                          signUp: true,
                          referrer: router.query.referrer,
                          mode: router.query.type == 'subscription' ? 'subscription' : 'payment',
                          customerEmail: user.email,
                          redirectUrl: window.location.origin + '/buy/thank-you',
                          cancelUrl: window.location.origin
                        }).then(result => {
                          location.href = result.data.session.url
                        })
                      } else {
                        location.href = '/onboarding/welcome'
                      }
                    })
                })
            }
          })
          
          // router.push('/onboarding/welcome')
        })
        .catch(error => {
          props.loginLoaderHandler(false)
          setIsSigningUp(false)
          setShowLoader(false)
          checkPass(password, passwordConfirmation, isPrivacyPolicyChecked)
          setError(error.message)
        })
    } else {
      setError('Passwords do not match.')
      setIsSigningUp(false)
      setShowLoader(false)
      checkPass(password, passwordConfirmation, isPrivacyPolicyChecked)
    }
  }

  return (
    <Layout title={`Join ${SITE_NAME} | ${SITE_NAME}`}>
      <div className={`${styles.container} auth_page_wrapper`}>
        <div className={styles.mobile_visible}>
          {
            router.query.referrer == 'm3' ? 
              <div className={styles.blue_banner}>
                Welcome M3 Checklist user. Mooditude is powered by M3 Checklist. 
              </div> : ''  
          }
          

          <div className={styles.mobile_logo}>
              <img src={`/logo-small.svg`}  />
          </div>

          {((router.query.type != 'subscription') && (router.query.type != 'payment') && router.query.referrer == 'm3') && (

            <div className={`${styles.mobile_steps} ${styles.two_steps} ${styles.mobile_steps_small}`}>
                <div className={`${styles.step_item} ${styles.step_active_item}`}>
                  <div className={styles.step_number}>1</div>
                  <p>Account</p>
                </div>

                <div className={styles.step_item}>
                  <div className={styles.step_number}>2</div>
                  <p>Assessment</p>
                </div>
            </div>
          )}

          {((router.query.type == 'subscription') || (router.query.type == 'payment')) && (
            <div className={styles.mobile_steps}>
               <div className={`${styles.step_item} ${styles.step_active_item}`}>
                  <div className={styles.step_number}>1</div>
                  <p>Account</p>
                </div>

                <div className={styles.step_item}>
                  <div className={styles.step_number}>2</div>
                  <p>Buy</p>
                </div>

                { router.query.referrer == 'm3'  ?
                  <div className={styles.step_item}>
                    <div className={styles.step_number}>2</div>
                    <p>Assessment</p>
                  </div>
                  : 
                  <div className={styles.step_item}>
                    <div className={styles.step_number}>2</div>
                    <p>Enjoy</p>
                  </div>
                }

                
            </div>
          )}
          
        </div>
        <div className={styles.authBg}>
          {router.query.type == 'subscription' && (
            <div className={styles.mooditudePremium}>
              
              <div className={styles.mobile_hidden}>
                <div className={`${styles.mobile_steps} ${styles.desktop}`}>
                    <div className={`${styles.step_item} ${styles.step_active_item}`}>
                      <div className={styles.step_number}>1</div>
                      <p>Create Account</p>
                    </div>

                    {
                      router.query.duration == 12 || router.query.duration == 3 || router.query.duration == 1 || router.query.type == 'payment' ? 
                      <>
                        <div className={styles.step_item}>
                          <div className={styles.step_number}>2</div>
                          <p>Buy</p>
                        </div>
                        <div className={styles.step_item}>
                          <div className={styles.step_number}>3</div>
                          <p>Take Assessment</p>
                        </div>
                      </>
                      : 
                      <div className={styles.step_item}>
                        <div className={styles.step_number}>2</div>
                        <p>Take Assessment</p>
                      </div>

                    }

                    
                </div>
              </div>
              <div>

                { router.query.referrer == 'm3' && (router.query.duration == 12 || router.query.duration == 3 || router.query.duration == 1) ?

                <>
                  <div className={styles.mobile_logo_mix}>
                    <img src="/m3.svg" width="55" height="55" className="m3" alt="M3Information" />  + <img src="/crown.svg" width="55" height="55" alt="Mooditude Premium" /> 
                  </div>
                </> : 
                <>
                  {router.query.referrer == undefined && <img src="/crown.svg" width="55" height="55" alt="Mooditude Premium" />}
                  {(router.query.referrer != undefined && router.query.referrer == 'm3') && <img src="/m3.svg" width="55" height="55" className="m3" alt="M3Information" /> }
                  <br/>
                </>

                }
  
                { router.query.referrer == 'm3' && (router.query.duration == 12 || router.query.duration == 3 || router.query.duration == 1) ?
                  <h2 className={styles.m3_title}>Mooditude PREMIUM &amp; <br/> UNLIMITED M3 Assessment Reports</h2>
                  : <h2 className={styles.m3_title}>{router.query.referrer == 'm3' ? 'M3 ASSESSMENT REPORT' : 'MOODITUDE PREMIUM'}</h2>
                }

                {
                  router.query.referrer == 'm3' && (router.query.duration == 12 || router.query.duration == 3 || router.query.duration == 1) 
                    ?
                      <div>
                        {router.query.duration == 3 && (
                          <div>
                            {plans.filter(plan => plan.id == 'price_1KS1BUAuTlAR8JLMVQ7gLjp0').map(plan => (
                              <>
                                <strong>${plan.amount}</strong> 
                                <span>/{plan.interval_count} {plan.interval}s</span>
                              </>                       
                            ))}
                          </div>
                        )}

                        {router.query.duration == 12 && (
                          <>
                            <div>
                              {plans.filter(plan => plan.id == 'price_1KS1BoAuTlAR8JLM4MDqAB7k').map(plan => (
                                <>
                                  <strong>${plan.amount}</strong> 
                                  <span>/{plan.interval}</span>
                                </>
                              ))}
                            </div>
                            
                            <div className={styles.trial_text}>after 3-day free trial</div>
                          </>
                        )}
                      </div>
                    :
                      <div>
                        {router.query.duration == 1 && (
                          <div>
                            {plans.filter(plan => plan.id == 'price_1K09ueAuTlAR8JLMqv6RVsh8').map(plan => (
                              <>
                                <strong>${plan.amount}</strong> 
                                <span>/{plan.interval}</span>
                              </>                       
                            ))}
                          </div>
                        )}

                        {router.query.duration == 3 && (
                          <div>
                            {plans.filter(plan => plan.id == 'price_1KHXXoAuTlAR8JLM1hdixwNI').map(plan => (
                              <>
                                <strong>${plan.amount}</strong> 
                                <span>/{plan.interval_count} {plan.interval}s</span>
                              </>                       
                            ))}
                          </div>
                        )}

                        {router.query.duration == 12 && (
                          <>
                            <div>
                              {plans.filter(plan => plan.id == 'price_1K09ueAuTlAR8JLM3JmfvSgj').map(plan => (
                                <>
                                  <strong>${plan.amount}</strong> 
                                  <span>/{plan.interval}</span>
                                </>
                              ))}
                            </div>
                            
                            <div className={styles.trial_text}>after 3-day free trial</div>

                            <div className={styles.wont_charge}>Your card wouldn’t be charged during trial.</div>
                          </>
                        )}
                      </div>
                }
              </div>
            </div>
          )}

          {router.query.type == 'payment' && (
            <div className={styles.oneTime}>
              
              <div className={styles.mobile_hidden}>
                <div className={`${styles.mobile_steps} ${styles.desktop}`}>
                    <div className={`${styles.step_item} ${styles.step_active_item}`}>
                      <div className={styles.step_number}>1</div>
                      <p>Account</p>
                    </div>

                    <div className={styles.step_item}>
                      <div className={styles.step_number}>2</div>
                      <p>Buy</p>
                    </div>

                    <div className={styles.step_item}>
                      <div className={styles.step_number}>3</div>
                      <p>Assessment</p>
                    </div>
                </div>
              </div>
              <div>
                {router.query.referrer == undefined && <img src="/crown.svg" width="55" height="55" alt="Mooditude Premium" />}
                {(router.query.referrer != undefined && router.query.referrer == 'm3') && <img src="/m3.svg" width="55" height="55" className="m3" alt="M3Information" />}
                <br/>
                <h2 className={styles.m3_title}>{router.query.referrer == 'm3' ? 'M3 ASSESSMENT REPORT' : 'MOODITUDE PREMIUM'}</h2>

                {router.query.referrer == 'm3' && (
                  <div>
                    <div>
                      {plans.filter(plan => plan.id == 'price_1KS1B3AuTlAR8JLM0jZu1Wmi').map(plan => (
                        <strong>${plan.amount}</strong>
                      ))}
                    </div>

                    <div>One-time</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
           {((router.query.type != 'subscription' && router.query.type != 'payment') && router.query.referrer == 'm3') && (
            <div className={styles.oneTime}>
              
              <div className={styles.mobile_hidden}>
                <div className={`${styles.mobile_steps} ${styles.two_steps} ${styles.desktop}`}>
                    <div className={`${styles.step_item} ${styles.step_active_item}`}>
                      <div className={styles.step_number}>1</div>
                      <p>Account</p>
                    </div>

                    <div className={styles.step_item}>
                      <div className={styles.step_number}>2</div>
                      <p>Assessment</p>
                    </div>
                </div>
              </div>
              <div>
                {router.query.referrer == undefined && <img src="/crown.svg" width="55" height="55" alt="Mooditude Premium" />}
                {(router.query.referrer != undefined && router.query.referrer == 'm3') && <img src="/m3.svg" width="55" height="55" className="m3" alt="M3Information" />}
                <br/>
                <h2 className={styles.m3_title}>M3 Score</h2>

                <div>
                  <div><strong>$0</strong></div>
                  <div>One-time</div>
                </div>
              </div>
            </div>
          )}

  
        </div>

        <div className={`${styles.authForm} ${router.query.type != 'subscription' && router.query.type != 'payment' && !router.query.referrer ? styles.nopadding : ''}`}>
          {
            showLoader ? 
              <div 
                className={styles.custom_loader} 
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255,255,255,.8)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <MoonLoader color={'#1CA566'} loading={true} size={30} />
                <p>Signing you up...</p>
              </div>
            : 
            ''
          }
          <div className={styles.authFormInner}>
            <img  
              src="/logo_svg.svg" 
              width="113" 
              height="113" 
              alt="Mooditude"
              className={styles.mobile_hidden}
            />

            <div className={styles.headingContainer}>
              <div>
                <h1 className={styles.heading}>Join {SITE_NAME}</h1>
                <h4 className={styles.subHeading}><strong>You deserve to be happy!</strong></h4>
              </div>
              
              <div>
                <Link href="/login">
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
                    size={"medium"}
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
                    size={"medium"}
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
                    size={"medium"}
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
                    size={"medium"}
                    autoComplete="new-password"
                  />
                  
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
                      <>CREATE ACCOUNT</>
                    )}
                  </button>
                </div>

                <div className={styles.privacyPolicy}>

                  <FormGroup>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel 
                        control={<Checkbox 
                            className={`${styles.privacyPolicyLabel} no_bg`}
                            type="checkbox" 
                            id="privacy-policy" 
                            checked={isPrivacyPolicyChecked} 
                            onChange={e => {setIsPrivacyPolicyChecked(e.target.checked);checkPass(password, passwordConfirmation, e.target.checked)}}
                          />} 
                        label={false}
                      />

                      <label htmlFor="privacy-policy" >
                        <div className={styles.privacyPolicyText}>
                          <span>By continuing you agree to Mooditude's</span>
                          <br />
                          <a href="https://mooditude.app/terms" target="_blank">Terms &amp; Conditions</a>
                          {' '}
                          and 
                          {' '}
                          <a href="https://mooditude.app/privacy" target="_blank">Privacy Policy</a>
                        </div>
                      </label>
                    </div>
                  </FormGroup>
                
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}