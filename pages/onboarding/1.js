import { useEffect } from 'react'

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

export default function Account() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  return (
    <Layout title={`Step 1 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 1 of 7</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={0} alternativeLabel={true} epand>
              {steps.map((label) => (
                <Step key={0}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <Grow in={true} timeout={1000}>
            <h1>How old are you?</h1>  
          </Grow>
          
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
            <FormControl component="fieldset">
              
              <RadioGroup>
                <FormControlLabel 
                  value="female" 
                  className={styles.with_text_wrap}
                  control={<Radio />} 
                  label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `< 18 <div>Since you are under 18, get permission from your parents before using this app. </div>`}} />} />
                
                <FormControlLabel value="19 — 24" control={<Radio />} label="19 — 24" />
                <FormControlLabel value="25 — 39" control={<Radio />} label="25 — 39" />
                <FormControlLabel value="40 — 59" control={<Radio />} label="40 — 59" />
                <FormControlLabel value="> 60" control={<Radio />} label="> 60" />
              </RadioGroup>
            </FormControl>
            </Grow>
          </div>

          <div className={styles.btn_wrap}>
          <Stack direction="row" spacing={2}>
          <Button 
            size="large" 
            className={styles.onboarding_btn} 
            variant="contained"
            onClick={() => {router.push(`/onboarding/2`)}}

          >Next</Button>
          </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}