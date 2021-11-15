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

import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';

import Grow from '@mui/material/Fade';

export default function Step4() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(3);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }

  }, [authUser, loading, router])

  return (
    <Layout title={`Step 4 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 4 of 7</p>

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
                      <Checkbox />
                    }
                    label="People"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox />
                    }
                    label="Work or School"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox />
                    }
                    label="Health"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox />
                    }
                    label="Money"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox />
                    }
                    label="Me"
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
                onClick={() => {router.push(`/onboarding/3`)}}

              >Back</Button>

              <Button 
                size="large" 
                
                variant="contained"
                onClick={() => {router.push(`/onboarding/5`)}}

              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}