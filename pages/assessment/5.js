import { useState, useEffect } from 'react'

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

import Animation from '@mui/material/Grow';

export default function Assessment1() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 ,29]

  const [profileStep1Answer, setProfileStep1Answer] = useState('')
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    // if (localStorage.getItem('currentProfileStep') !== null) {
    //   localStorage.setItem('currentProfileStep', 1)
    //   console.log(`Current profile step: ${localStorage.getItem('currentProfileStep')}`)
    // }

    // if (localStorage.getItem('profileStep1Answer') > 0) {
    //   setProfileStep1Answer(localStorage.getItem('profileStep1Answer'))
    // }
  }, [])

  // useEffect(() => {
  //   profileStep1Answer > 0 && console.log(`Profile step 1 answer: ${profileStep1Answer}`)
  // }, [profileStep1Answer])

  const handleNextStep = () => {
    setFormError(false)
    if (profileStep1Answer !== '') {
      // localStorage.setItem('profileStep1Answer', parseInt(profileStep1Answer))
      
      router.push('/assessment/6')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Question 5 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Assess Your Wellbeing Score</h2>
          <p className={styles.step_text}>Question 5 of 29</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={4} alternativeLabel={true} epand="true">
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <Animation direction="right" in={true} timeout={1000}>
            <div>
              <p className={styles.top_sub_title}>Over the past two weeks...</p>
              <h1 className={`mt_0`}>I have had thoughts of suicide</h1>  
            </div>
          </Animation>
          
          <div className={styles.form_wrap}>
            <Animation direction="right" in={true} timeout={1000}>
            <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
              
              <RadioGroup>
                <FormControlLabel 
                  value="1" 
                  className={styles.with_text_wrap}
                  control={<Radio checked={profileStep1Answer == 1} onChange={(event) => setProfileStep1Answer(event.target.value)} />} 
                  label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Not at all <div>Since you are under 18, get permission from your parents before using this app. </div>`}} />} />
                
                <FormControlLabel value="2" control={<Radio checked={profileStep1Answer == 2} onChange={(event) => setProfileStep1Answer(event.target.value)} />} label="Rarely" />
                <FormControlLabel value="3" control={<Radio checked={profileStep1Answer == 3} onChange={(event) => setProfileStep1Answer(event.target.value)} />} label="Sometimes" />
                <FormControlLabel value="4" control={<Radio checked={profileStep1Answer == 4} onChange={(event) => setProfileStep1Answer(event.target.value)} />} label="Often" />
                <FormControlLabel value="5" control={<Radio checked={profileStep1Answer == 5} onChange={(event) => setProfileStep1Answer(event.target.value)} />} label="Most of the time" />
              </RadioGroup>
              {
                formError ? 
                <FormHelperText>Please choose an answer.</FormHelperText> : ''
              }

            </FormControl>
            </Animation>
          </div>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                color="secondary"
                variant="outlined" 
                // onClick={handlePrevStep} 
                onClick={() => router.push('/assessment/4')}
              >
                Back
              </Button>

              <Button 
                size="large" 
                className={styles.onboarding_btn} 
                variant="contained" 
                onClick={handleNextStep} 
                // onClick={() => {router.push(`/onboarding/2`)}}
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