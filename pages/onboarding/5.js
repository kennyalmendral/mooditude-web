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

export default function Onboarding5() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(4);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]

  const [profileStep5Answer, setProfileStep5Answer] = useState(null)
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem('currentProfileStep') !== null) {
      localStorage.setItem('currentProfileStep', 5)

      console.log(`Current profile step: ${localStorage.getItem('currentProfileStep')}`)
    }

    if (localStorage.getItem('profileStep5Answer') !== null) {
      setProfileStep5Answer(localStorage.getItem('profileStep5Answer'))
    }
  }, [])

  useEffect(() => {
    profileStep5Answer !== null && console.log(`Profile step 5 answer: ${profileStep5Answer}`)
  }, [profileStep5Answer])

  const handleNextStep = () => {
    setFormError(false)
    if (profileStep5Answer !== null) {
      localStorage.setItem('profileStep5Answer', profileStep5Answer)
      
      router.push('/onboarding/6')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Step 5 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 5 of 7</p>

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
              <h1>Are you working with any mental health professional?</h1>  
            </div>
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
              <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
                <RadioGroup>
                  <FormControlLabel 
                    value={true} 
                    className={styles.with_text_wrap}
                    control={<Radio checked={profileStep5Answer == "true"} onChange={(event) => setProfileStep5Answer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Yes <div>Wonderful. You can use Mooditude as a companion app between therapy sessions. Tell your therapist about Mooditude.</div>`}} />} 
                  />

                  <FormControlLabel 
                    value={false} 
                    className={styles.with_text_wrap}
                    control={<Radio checked={profileStep5Answer == "false"} onChange={(event) => setProfileStep5Answer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `No <div>That’s okay. You can use Mooditude’s self-paced programs to learn life-changing skills.</div>`}} />} 
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
                onClick={() => {router.push(`/onboarding/4`)}}
                // onClick={handlePrevStep}
              >Back</Button>

              <Button 
                size="large" 
                
                variant="contained"
                // onClick={() => {router.push(`/onboarding/6`)}}
                onClick={handleNextStep}
              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}