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
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export default function Onboarding5() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(4);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]

  const [profileStepAnswer, setProfileStepAnswer] = useState(null)
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentProfileStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentProfileStep`, 5)

      console.log(`Current profile step: ${localStorage.getItem(`${authUser.uid}_currentProfileStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_profileStep5Answer`) !== null) {
      setProfileStepAnswer(localStorage.getItem(`${authUser.uid}_profileStep5Answer`))
    }
  }, [])

  useEffect(() => {
    profileStepAnswer !== null && console.log(`Profile step 5 answer: ${profileStepAnswer}`)
  }, [profileStepAnswer])

  const handleNextStep = () => {
    setFormError(false)
    if (profileStepAnswer !== null) {
      localStorage.setItem(`${authUser.uid}_profileStep5Answer`, profileStepAnswer)
      
      router.push('/onboarding/6')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Step 5 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          
          <div className={`${styles.line_header_wrap} ${styles.onboarding_step5}`}>
            <p className={styles.step_text}>Step 5 of 7</p>
            <h2>Personalize Mooditude</h2>
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
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == "true"} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Yes <div>Wonderful. You can use Mooditude as a companion app between therapy sessions. Tell your therapist about Mooditude.</div>`}} />} 
                  />

                  <FormControlLabel 
                    value={false} 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == "false"} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
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
                disabled={profileStepAnswer == null ? true : false}
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