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

import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';

import Grow from '@mui/material/Fade';

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()

export default function Onboarding4() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(3);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [onboardingCurrentStep, setOnboardingCurrentStep] = useState(4)
  const [onboardingStep4Answer, setOnboardingStep4Answer] = useState([])

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
    onboardingStep4Answer && console.log(onboardingStep4Answer)
  }, [onboardingStep4Answer])

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
              userData.onboardingStep4Answer != '' && setOnboardingStep4Answer(userData.onboardingStep4Answer)
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
                onboardingCurrentStep: 5,
                onboardingStep4Answer: onboardingStep4Answer
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
                onboardingCurrentStep: 3,
              })
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }

  return (
    <Layout title={`Step 4 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 4 of 7</p>

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
              <h1 className={`mb_0`}>What’s the biggest roadblock in your way?</h1>  
              <p className={styles.onboarding_sub_title}>Select one or more</p>
            </div>
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset">
                <FormGroup>
                  <FormControlLabel
                    control={
                      // <Checkbox checked={onboardingStep4Answer.includes('People')} onChange={(event) => console.log(event.target.checked)} />
                      <Checkbox checked={onboardingStep4Answer.includes('People')} onChange={(event) => setOnboardingStep4Answer([...onboardingStep4Answer, event.target.value])} />
                    }
                    label="People" 
                    value="People"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={onboardingStep4Answer.includes('Work or School')} onChange={(event) => setOnboardingStep4Answer([...onboardingStep4Answer, event.target.value])} />
                    }
                    label="Work or School"
                    value="Work or School"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={onboardingStep4Answer.includes('Health')} onChange={(event) => setOnboardingStep4Answer([...onboardingStep4Answer, event.target.value])} />
                    }
                    label="Health"
                    value="Health"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={onboardingStep4Answer.includes('Money')} onChange={(event) => setOnboardingStep4Answer([...onboardingStep4Answer, event.target.value])} />
                    }
                    label="Money"
                    value="Money"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={onboardingStep4Answer.includes('Me')} onChange={(event) => setOnboardingStep4Answer([...onboardingStep4Answer, event.target.value])} />
                    }
                    label="Me"
                    value="Me"
                  />
                </FormGroup>

                </FormControl>
              </Grow>
          </div>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                color="secondary"
                variant="outlined"
                // onClick={() => {router.push(`/onboarding/3`)}}
                onClick={handlePrevStep}
              >Back</Button>

              <Button 
                size="large" 
                variant="contained"
                // onClick={() => {router.push(`/onboarding/5`)}}
                onClick={handleNextStep}
              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}