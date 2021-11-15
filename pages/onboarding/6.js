import React, { useEffect } from 'react'

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

export default function Step6() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(5);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }

  }, [authUser, loading, router])

  return (
    <Layout title={`Step 6 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 6 of 7</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={currentStep} alternativeLabel={true} epand>
              {steps.map((label) => (
                <Step key={0}>
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
          
              <FormControl component="fieldset">
                
                <RadioGroup>
                  
                  <FormControlLabel 
                      value="Yes" 
                      className={styles.with_text_wrap}
                      control={<Radio />} 
                      label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Yes <div>Great! You will fine Mooditude very intutive to use. Go through the Free 7-Day program for a refresher.</div>`}} />} 
                    />

                    <FormControlLabel 
                      value="No" 
                      className={styles.with_text_wrap}
                      control={<Radio />} 
                      label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `No <div>No worries, we recommend you go through the Free 7-Day Program, which will explain how Mooditude and CBT works.</div>`}} />} 
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
                onClick={() => {router.push(`/onboarding/5`)}}

              >Back</Button>

              <Button 
                size="large" 
                
                variant="contained"
                onClick={() => {router.push(`/onboarding/7`)}}

              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}