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
import FormHelperText from '@mui/material/FormHelperText';
import Grow from '@mui/material/Fade';

export default function Onboarding6() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(5);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [profileStep6Answer, setProfileStep6Answer] = useState(null)
  const [formError, setFormError] = useState(false)
  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem('currentProfileStep') !== null) {
      localStorage.setItem('currentProfileStep', 6)

      console.log(`Current profile step: ${localStorage.getItem('currentProfileStep')}`)
    }

    if (localStorage.getItem('profileStep6Answer') !== null) {
      setProfileStep6Answer(localStorage.getItem('profileStep6Answer'))
    }
  }, [])

  useEffect(() => {
    profileStep6Answer !== null && console.log(`Profile step 6 answer: ${profileStep6Answer}`)
  }, [profileStep6Answer])

  const handleNextStep = () => {
    setFormError(false)
    if (profileStep6Answer !== null) {
      localStorage.setItem('profileStep6Answer', profileStep6Answer)
      
      router.push('/onboarding/7')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Step 6 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 6 of 7</p>

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
              <h1>Are you familiar with Cognitive Behavioral Therapy (CBT)?</h1>  
            </div>
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
                
                <RadioGroup>
                  
                  <FormControlLabel 
                      value={true} 
                      className={styles.with_text_wrap}
                      control={<Radio checked={profileStep6Answer == 'true'} onChange={(event) => setProfileStep6Answer(event.target.value)} />} 
                      label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Yes <div>Great! You will fine Mooditude very intutive to use. Go through the Free 7-Day program for a refresher.</div>`}} />} 
                    />

                    <FormControlLabel 
                      value={false} 
                      className={styles.with_text_wrap}
                      control={<Radio checked={profileStep6Answer == 'false'} onChange={(event) => setProfileStep6Answer(event.target.value)} />} 
                      label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `No <div>No worries, we recommend you go through the Free 7-Day Program, which will explain how Mooditude and CBT works.</div>`}} />} 
                    />
                </RadioGroup>
                {
                  formError ? 
                  <FormHelperText>Please choose an answer.</FormHelperText> : ''
                }
                </FormControl>
              </Grow>
          </div>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                color="secondary"
                variant="outlined"
                onClick={() => {router.push(`/onboarding/5`)}}
                // onClick={handlePrevStep}
              >Back</Button>

              <Button 
                size="large" 
                variant="contained"
                // onClick={() => {router.push(`/onboarding/7`)}}
                onClick={handleNextStep}
              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}