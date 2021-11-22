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

export default function Assessment14() {
  const router = useRouter()

  const { authUser, loading } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 ,29]

  const [assessmentStep14Answer, setAssessmentStep14Answer] = useState('')
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem('currentAssessmentStep') !== null) {
      localStorage.setItem('currentAssessmentStep', 14)

      console.log(`Current assessment step: ${localStorage.getItem('currentAssessmentStep')}`)
    }

    if (localStorage.getItem('assessmentStep14Answer') > 0) {
      setAssessmentStep14Answer(localStorage.getItem('assessmentStep14Answer'))
    }
  }, [])

  useEffect(() => {
    assessmentStep14Answer > 0 && console.log(`Assessment step 14 answer: ${assessmentStep14Answer}`)
  }, [assessmentStep14Answer])

  const handleNextStep = () => {
    setFormError(false)

    if (assessmentStep14Answer !== '') {
      localStorage.setItem('assessmentStep14Answer', parseInt(assessmentStep14Answer))
      
      router.push('/assessment/15')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Question 14 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Assess Your Wellbeing Score</h2>
          <p className={styles.step_text}>Question 14 of 29</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={13} alternativeLabel={true} epand="true">
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
              <h1 className={`mt_0`}>I am nervous or shaky in social situations</h1>  
            </div>
          </Animation>
          
          <div className={styles.form_wrap}>
            <Animation direction="right" in={true} timeout={1000}>
            <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
              
              <RadioGroup>
                <FormControlLabel 
                  value="1" 
                  className={styles.with_text_wrap}
                  control={<Radio checked={assessmentStep14Answer == 1} onChange={(event) => setAssessmentStep14Answer(event.target.value)} />} 
                  label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Not at all <div>Since you are under 18, get permission from your parents before using this app. </div>`}} />} />
                
                <FormControlLabel value="2" control={<Radio checked={assessmentStep14Answer == 2} onChange={(event) => setAssessmentStep14Answer(event.target.value)} />} label="Rarely" />
                <FormControlLabel value="3" control={<Radio checked={assessmentStep14Answer == 3} onChange={(event) => setAssessmentStep14Answer(event.target.value)} />} label="Sometimes" />
                <FormControlLabel value="4" control={<Radio checked={assessmentStep14Answer == 4} onChange={(event) => setAssessmentStep14Answer(event.target.value)} />} label="Often" />
                <FormControlLabel value="5" control={<Radio checked={assessmentStep14Answer == 5} onChange={(event) => setAssessmentStep14Answer(event.target.value)} />} label="Most of the time" />
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
                onClick={() => router.push('/assessment/13')}
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