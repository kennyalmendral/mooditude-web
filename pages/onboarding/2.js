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

export default function Onboarding2() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [onboardingCurrentStep, setOnboardingCurrentStep] = useState(2)
  const [onboardingStep2Answer, setOnboardingStep2Answer] = useState('')

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
    onboardingStep2Answer && console.log(onboardingStep2Answer)
  }, [onboardingStep2Answer])

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
              userData.onboardingStep2Answer != '' && setOnboardingStep2Answer(userData.onboardingStep2Answer)
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
                onboardingCurrentStep: 3,
                onboardingStep2Answer: onboardingStep2Answer
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
                onboardingCurrentStep: 1,
              })
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }

  return (
    <Layout title={`Step 2 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 2 of 7</p>

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
            <h1>What’s your gender?</h1>  
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset">
                
                <RadioGroup>
                  <FormControlLabel value="Female" control={<Radio checked={onboardingStep2Answer == 'Female'} onChange={(event) => setOnboardingStep2Answer(event.target.value)} />} label="Female" />
                  <FormControlLabel value="Male" control={<Radio checked={onboardingStep2Answer == 'Male'} onChange={(event) => setOnboardingStep2Answer(event.target.value)} />} label="Male" />
                  <FormControlLabel value="Transgender" control={<Radio checked={onboardingStep2Answer == 'Transgender'} onChange={(event) => setOnboardingStep2Answer(event.target.value)} />} label="Transgender" />
                  <FormControlLabel value="Non-binary" control={<Radio checked={onboardingStep2Answer == 'Non-binary'} onChange={(event) => setOnboardingStep2Answer(event.target.value)} />} label="Non-binary" />
                  <FormControlLabel value="Other" control={<Radio checked={onboardingStep2Answer == 'Other'} onChange={(event) => setOnboardingStep2Answer(event.target.value)} />} label="Other" />
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
                onClick={handlePrevStep}  
                // onClick={() => {router.push(`/onboarding/1`)}}
              >
                Back
              </Button>

              <Button 
                size="large" 
                variant="contained" 
                onClick={handleNextStep} 
                // onClick={() => {router.push(`/onboarding/3`)}}
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