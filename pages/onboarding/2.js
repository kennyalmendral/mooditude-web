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
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Grow from '@mui/material/Fade';

export default function Onboarding2() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [profileStepAnswer, setProfileStepAnswer] = useState('')
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentProfileStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentProfileStep`, 2)

      console.log(`Current profile step: ${localStorage.getItem(`${authUser.uid}_currentProfileStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_profileStep2Answer`) > 0) {
      setProfileStepAnswer(localStorage.getItem(`${authUser.uid}_profileStep2Answer`))
    }
  }, [])

  useEffect(() => {
    profileStepAnswer > 0 && console.log(`Profile step 2 answer: ${profileStepAnswer}`)
  }, [profileStepAnswer])

  const handleChange = e => {
    localStorage.setItem(`${authUser.uid}_profileStep2Answer`, e.target.value)    

    setProfileStepAnswer(e.target.value)

    router.push('/onboarding/3')
  }

  const handleNextStep = () => {
    setFormError(false)
    if (profileStepAnswer !== '') {
      localStorage.setItem(`${authUser.uid}_profileStep2Answer`, parseInt(profileStepAnswer))
      
      router.push('/onboarding/3')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Step 2 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <div className={`${styles.line_header_wrap} ${styles.onboarding_step2}`}>
            <p className={styles.step_text}>Step 2 of 7</p>
            <h2>Personalize Mooditude</h2>
          </div>

          <Grow in={true} timeout={1000}>
            <h1>What’s your gender?</h1>  
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
                
                <RadioGroup >
                  <FormControlLabel value="1" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == '1'} onChange={handleChange} />} label="Male" />
                  <FormControlLabel value="2" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == '2'} onChange={handleChange} />} label="Female" />
                  <FormControlLabel value="3" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == '3'} onChange={handleChange} />} label="Transgender" />
                  <FormControlLabel value="4" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == '4'} onChange={handleChange} />} label="Non-binary" />
                  <FormControlLabel value="5" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == '5'} onChange={handleChange} />} label="Other" />
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
                disabled={profileStepAnswer == '' ? true : false}
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