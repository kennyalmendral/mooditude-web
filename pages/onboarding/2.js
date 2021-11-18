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

export default function Onboarding2() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [profileStep2Answer, setProfileStep2Answer] = useState('')
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem('currentProfileStep') !== null) {
      localStorage.setItem('currentProfileStep', 2)

      console.log(`Current profile step: ${localStorage.getItem('currentProfileStep')}`)
    }

    if (localStorage.getItem('profileStep2Answer') > 0) {
      setProfileStep2Answer(localStorage.getItem('profileStep2Answer'))
    }
  }, [])

  useEffect(() => {
    profileStep2Answer > 0 && console.log(`Profile step 2 answer: ${profileStep2Answer}`)
  }, [profileStep2Answer])

  const handleNextStep = () => {
    setFormError(false)
    if (profileStep2Answer !== '') {
      localStorage.setItem('profileStep2Answer', parseInt(profileStep2Answer))
      
      router.push('/onboarding/3')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Step 2 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 2 of 7</p>

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
            <h1>What’s your gender?</h1>  
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
                
                <RadioGroup >
                  <FormControlLabel value="1" control={<Radio checked={profileStep2Answer == 1} onChange={(event) => setProfileStep2Answer(event.target.value)} />} label="Male" />
                  <FormControlLabel value="2" control={<Radio checked={profileStep2Answer == 2} onChange={(event) => setProfileStep2Answer(event.target.value)} />} label="Female" />
                  <FormControlLabel value="3" control={<Radio checked={profileStep2Answer == 3} onChange={(event) => setProfileStep2Answer(event.target.value)} />} label="Transgender" />
                  <FormControlLabel value="4" control={<Radio checked={profileStep2Answer == 4} onChange={(event) => setProfileStep2Answer(event.target.value)} />} label="Non-binary" />
                  <FormControlLabel value="5" control={<Radio checked={profileStep2Answer == 5} onChange={(event) => setProfileStep2Answer(event.target.value)} />} label="Other" />
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
                // onClick={handlePrevStep} 
                onClick={() => router.push('/onboarding/1')}
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