import React, { useState, useEffect } from 'react'

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

export default function Onboarding7() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(6);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [onboardingCurrentStep, setOnboardingCurrentStep] = useState(7)
  const [onboardingStep7Answer, setOnboardingStep7Answer] = useState('')

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
    onboardingStep7Answer && console.log(onboardingStep7Answer)
  }, [onboardingStep7Answer])

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
              userData.onboardingStep7Answer != '' && setOnboardingStep7Answer(userData.onboardingStep7Answer)
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
                onboardingCurrentStep: 8,
                onboardingStep7Answer: onboardingStep7Answer
              })
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }

  const handlePrevStep = () => {
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
                onboardingCurrentStep: 6,
              })
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }

  return (
    <Layout title={`Step 7 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 7 of 7</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={currentStep} alternativeLabel={true} epand>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <Grow in={true} timeout={1000}>
            <div>
              <h1 className={`mb_0`}>Make a Promise</h1>  
              <p className={styles.onboarding_sub_title}>You will get the quickest results with consistency. Are you ready to fit in 10 minutes a day for amazing changes in your mental well-being?</p>
            </div>
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset">
                
                <RadioGroup>
                  <FormControlLabel 
                    value="Let’s do this!" 
                    className={styles.with_text_wrap}
                    control={<Radio checked={onboardingStep7Answer == 'Let’s do this!'} onChange={(event) => setOnboardingStep7Answer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Let’s do this! <div>Great! Stay tuned for positive changes in your mental health conditions within a few days.</div>`}} />} 
                  />

                  <FormControlLabel 
                    value="I’m not ready" 
                    className={styles.with_text_wrap}
                    control={<Radio checked={onboardingStep7Answer == 'I’m not ready'} onChange={(event) => setOnboardingStep7Answer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `I’m not ready <div>Let’s start with exploring Mooditude together.</div>`}} />} 
                  />

                </RadioGroup>
                </FormControl>
              </Grow>
          </div>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                color="secondary"
                variant="outlined"
                // onClick={() => {router.push(`/onboarding/6`)}}
                onClick={handlePrevStep}
              >Back</Button>

              <Button 
                size="large" 
                variant="contained"
                // onClick={() => {router.push(`/onboarding/finish`)}}
                onClick={handleNextStep}
              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}