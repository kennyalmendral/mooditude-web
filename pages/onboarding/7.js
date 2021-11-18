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

const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()

export default function Onboarding7() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(6);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [profileStep7Answer, setProfileStep7Answer] = useState(null)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem('currentProfileStep') !== null) {
      localStorage.setItem('currentProfileStep', 7)

      console.log(`Current profile step: ${localStorage.getItem('currentProfileStep')}`)
    }

    if (localStorage.getItem('profileStep7Answer') !== null) {
      setProfileStep7Answer(localStorage.getItem('profileStep7Answer'))
    }
  }, [])

  useEffect(() => {
    profileStep7Answer !== null && console.log(`Profile step 7 answer: ${profileStep7Answer}`)
  }, [profileStep7Answer])

  const handleNextStep = () => {
    if (profileStep7Answer !== null) {
      localStorage.setItem('profileStep7Answer', profileStep7Answer)

      firebaseAuth.onAuthStateChanged(user => {
        if (user) {
          firebaseDatabase
            .ref()
            .child('users')
            .child(user.uid)
            .update({
              ageGroup: parseInt(localStorage.profileStep1Answer) || 0,
              gender: parseInt(localStorage.profileStep2Answer) || 0,
              topGoal: localStorage.profileStep3Answer || '',
              topChallenges: localStorage.profileStep4Answer || '',
              goingToTherapy: localStorage.profileStep5Answer || false,
              knowCbt: localStorage.profileStep6Answer || false,
              committedToSelfhelp: localStorage.profileStep7Answer || false,
              onboardingStep: 1 || 0
            })
  
          router.push('/onboarding/finish')
        }
      })
    } else {
      alert('Please select an answer.')
    }
  }

  return (
    <Layout title={`Step 7 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 7 of 7</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={currentStep} alternativeLabel={true} epand="true">
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
                    value={true}  
                    className={styles.with_text_wrap}
                    control={<Radio checked={profileStep7Answer == 'true'} onChange={(event) => setProfileStep7Answer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Let’s do this! <div>Great! Stay tuned for positive changes in your mental health conditions within a few days.</div>`}} />} 
                  />

                  <FormControlLabel 
                    value={false} 
                    className={styles.with_text_wrap}
                    control={<Radio checked={profileStep7Answer == 'false'} onChange={(event) => setProfileStep7Answer(event.target.value)} />} 
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
                onClick={() => {router.push(`/onboarding/6`)}}
                // onClick={handlePrevStep}
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