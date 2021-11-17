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

export default function Onboarding3() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(2);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [onboardingCurrentStep, setOnboardingCurrentStep] = useState(3)
  const [onboardingStep3Answer, setOnboardingStep3Answer] = useState('')

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
    onboardingStep3Answer && console.log(onboardingStep3Answer)
  }, [onboardingStep3Answer])

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
              userData.onboardingStep3Answer != '' && setOnboardingStep3Answer(userData.onboardingStep3Answer)
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
                onboardingCurrentStep: 4,
                onboardingStep3Answer: onboardingStep3Answer
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
                onboardingCurrentStep: 2,
              })
            })
          })
      } else {
        usersRefUnsubscribe && unsubscribe()
      }
    })
  }

  return (
    <Layout title={`Step 3 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 3 of 7</p>

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
              <h1 className={`mb_0`}>What do you want to achieve?</h1>  
              <p className={styles.onboarding_sub_title}>Please select just one, the most important goal.</p>
            </div>
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset">
                
                <RadioGroup>
                  
                  <FormControlLabel value="Sleep Better" control={<Radio checked={onboardingStep3Answer == 'Sleep Better'} onChange={(event) => setOnboardingStep3Answer(event.target.value)} />} label="Sleep Better" />
                  <FormControlLabel value="Handle Stress" control={<Radio checked={onboardingStep3Answer == 'Handle Stress'} onChange={(event) => setOnboardingStep3Answer(event.target.value)} />} label="Handle Stress" />
                  <FormControlLabel value="Master Depression" control={<Radio checked={onboardingStep3Answer == 'Master Depression'} onChange={(event) => setOnboardingStep3Answer(event.target.value)} />} label="Master Depression" />
                  <FormControlLabel value="Overcome Anxiety" control={<Radio checked={onboardingStep3Answer == 'Overcome Anxiety'} onChange={(event) => setOnboardingStep3Answer(event.target.value)} />} label="Overcome Anxiety" />
                  <FormControlLabel value="Control Anger" control={<Radio checked={onboardingStep3Answer == 'Control Anger'} onChange={(event) => setOnboardingStep3Answer(event.target.value)} />} label="Control Anger" />
                  <FormControlLabel value="Boost Self-esteem" control={<Radio checked={onboardingStep3Answer == 'Boost Self-esteem'} onChange={(event) => setOnboardingStep3Answer(event.target.value)} />} label="Boost Self-esteem" />
                  <FormControlLabel 
                    value="Feel Happier" 
                    className={styles.with_text_wrap}
                    control={<Radio checked={onboardingStep3Answer == 'Feel Happier'} onChange={(event) => setOnboardingStep3Answer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Feel Happier <div>Find your rose-tinted glasses. We’ll introduce you to the skills needed to deal with people, handle unforeseeable events, and build a mind-body connection for a fulfilling life.</div>`}} />} />

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
                // onClick={() => {router.push(`/onboarding/2`)}}

              >Back</Button>

              <Button 
                size="large" 
                variant="contained" 
                onClick={handleNextStep}
                // onClick={() => {router.push(`/onboarding/4`)}}
              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}