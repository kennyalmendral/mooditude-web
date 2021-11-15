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

export default function Step3() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(2);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  return (
    <Layout title={`Step 3 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 3 of 7</p>

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
              <h1 className={`mb_0`}>What do you want to achieve?</h1>  
              <p className={styles.onboarding_sub_title}>Please select just one, the most important goal.</p>
            </div>
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset">
                
                <RadioGroup>
                  
                  <FormControlLabel value="Sleep Better" control={<Radio />} label="Sleep Better" />
                  <FormControlLabel value="Handle Stress" control={<Radio />} label="Handle Stress" />
                  <FormControlLabel value="Master Depression" control={<Radio />} label="Master Depression" />
                  <FormControlLabel value="Overcome Anxiety" control={<Radio />} label="Overcome Anxiety" />
                  <FormControlLabel value="Control Anger" control={<Radio />} label="Control Anger" />
                  <FormControlLabel value="Boost Self-esteem" control={<Radio />} label="Boost Self-esteem" />
                  <FormControlLabel 
                    value="Feel Happier" 
                    className={styles.with_text_wrap}
                    control={<Radio />} 
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
                onClick={() => {router.push(`/onboarding/2`)}}

              >Back</Button>

              <Button 
                size="large" 
                
                variant="contained"
                onClick={() => {router.push(`/onboarding/4`)}}

              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}