import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// Stepper
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

// Radio
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import Grow from '@mui/material/Fade';

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()

export default function Onboarding1() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]

  const [onboardingCurrentStep, setOnboardingCurrentStep] = useState(1)
  const [onboardingStep1Answer, setOnboardingStep1Answer] = useState('')

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    switch (onboardingCurrentStep) {
      case 0:
        router.push('/onboarding/welcome')
        break
      case 1:
        router.push('/onboarding/1')
        break
      case 2:
        router.push('/onboarding/2')
        break
      case 3:
        router.push('/onboarding/3')
        break
      case 4:
        router.push('/onboarding/4')
        break
      case 5:
        router.push('/onboarding/5')
        break
      case 6:
        router.push('/onboarding/6')
        break
      case 7:
        router.push('/onboarding/7')
        break
      case 8:
        router.push('/onboarding/finish')
        break
      case 9:
        router.push('/onboarding/get-started')
        break
      default:
        router.push('/onboarding/welcome')
        break
    }
  }, [onboardingCurrentStep])
  
  useEffect(() => {
    onboardingStep1Answer && console.log(onboardingStep1Answer)
  }, [onboardingStep1Answer])

  useEffect(() => {
    let usersRef
    let usersRefUnsubscribe

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        usersRef = firebaseStore.collection('Users')

        usersRefUnsubscribe = usersRef
          .where('uid', '==', user.uid)
          .onSnapshot(querySnapshot => {
            querySnapshot.docs.map(doc => {
              let userData = doc.data()
              console.log(userData)

              setOnboardingCurrentStep(userData.onboardingCurrentStep)
              userData.onboardingStep1Answer != '' && setOnboardingStep1Answer(userData.onboardingStep1Answer)
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }, [firebaseStore, firebaseAuth])

  const handleNextStep = () => {
    let usersRef
    let usersRefUnsubscribe

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        usersRef = firebaseStore.collection('Users')

        usersRef
          .where('uid', '==', user.uid)
          .get()
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              doc.ref.update({
                onboardingCurrentStep: 2,
                onboardingStep1Answer: onboardingStep1Answer
              })
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }

  return (
    <Layout title={`Step 1 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 1 of 7</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={0} alternativeLabel={true} epand>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <Grow in={true} timeout={1000}>
            <h1>How old are you?</h1>  
          </Grow>
          
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
            <FormControl component="fieldset">
              
              <RadioGroup>
                <FormControlLabel 
                  value="< 18" 
                  className={styles.with_text_wrap}
                  control={<Radio checked={onboardingStep1Answer == '< 18'} onChange={(event) => setOnboardingStep1Answer(event.target.value)} />} 
                  label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `< 18 <div>Since you are under 18, get permission from your parents before using this app. </div>`}} />} />
                
                <FormControlLabel value="19 — 24" control={<Radio checked={onboardingStep1Answer == '19 — 24'} onChange={(event) => setOnboardingStep1Answer(event.target.value)} />} label="19 — 24" />
                <FormControlLabel value="25 — 39" control={<Radio checked={onboardingStep1Answer == '25 — 39'} onChange={(event) => setOnboardingStep1Answer(event.target.value)} />} label="25 — 39" />
                <FormControlLabel value="40 — 59" control={<Radio checked={onboardingStep1Answer == '40 — 59'} onChange={(event) => setOnboardingStep1Answer(event.target.value)} />} label="40 — 59" />
                <FormControlLabel value="> 60" control={<Radio checked={onboardingStep1Answer == '> 60'} onChange={(event) => setOnboardingStep1Answer(event.target.value)} />} label="> 60" />
              </RadioGroup>
            </FormControl>
            </Grow>
          </div>

          <div className={styles.btn_wrap}>
          <Stack direction="row" spacing={2}>
            <Button 
              size="large" 
              className={styles.onboarding_btn} 
              variant="contained" 
              onClick={handleNextStep} 
              // onClick={() => {router.push(`/onboarding/2`)}}
            >
              Next
            </Button>
          </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}