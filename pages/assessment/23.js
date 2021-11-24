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
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export default function Assessment23() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 ,29]

  const [assessmentStep23Answer, setAssessmentStep23Answer] = useState('')
  const [formError, setFormError] = useState(false)

  const [assessmentStep23Time, setAssessmentStep23Time] = useState(0)
  const [timer, setTimer] = useState(null)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem('currentAssessmentStep') !== null) {
      localStorage.setItem('currentAssessmentStep', 23)

      console.log(`Current assessment step: ${localStorage.getItem('currentAssessmentStep')}`)
    }

    if (localStorage.getItem('assessmentStep23Answer') > 0) {
      setAssessmentStep23Answer(localStorage.getItem('assessmentStep23Answer'))
    }

    setTimer(setInterval(() => {
      console.log(`Time to answer: ${assessmentStep23Time}`)
      setAssessmentStep23Time(assessmentStep23Time++)
    }, 1000))
  }, [])

  useEffect(() => {
    assessmentStep23Answer > 0 && console.log(`Assessment step 23 answer: ${assessmentStep23Answer}`)
  }, [assessmentStep23Answer])

  const handleChange = (e) => {
    clearInterval(timer)
    localStorage.setItem('assessmentStep23Time', assessmentStep23Time)
    console.log(`Timer cleared at ${assessmentStep23Time} second(s)`)

    setAssessmentStep23Answer(e.target.value)
  }

  const handleNextStep = () => {
    setFormError(false)

    if (assessmentStep23Answer !== '') {
      localStorage.setItem('assessmentStep23Answer', parseInt(assessmentStep23Answer))
      
      router.push('/assessment/24')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Question 22 | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper} ${styles.on_assessment_wrapper}`}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Assess Your Wellbeing Score</h2>
          <p className={styles.step_text}>Question 22 of 29</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={21} alternativeLabel={true} epand="true">
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
              <h1 className={`mt_0`}>I had more energy than usual</h1>  
            </div>
          </Animation>
          
          <div className={styles.form_wrap}>
            <Animation direction="right" in={true} timeout={1000}>
            <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
              
              <RadioGroup>
                <FormControlLabel 
                  value="0" 
                  className={styles.with_text_wrap}
                  control={<Radio checked={assessmentStep23Answer == 0} onChange={handleChange} />} 
                  label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Not at all <div>Since you are under 18, get permission from your parents before using this app. </div>`}} />} />
                
                <FormControlLabel value="1" control={<Radio checked={assessmentStep23Answer == 1} onChange={handleChange} />} label="Rarely" />
                <FormControlLabel value="2" control={<Radio checked={assessmentStep23Answer == 2} onChange={handleChange} />} label="Sometimes" />
                <FormControlLabel value="3" control={<Radio checked={assessmentStep23Answer == 3} onChange={handleChange} />} label="Often" />
                <FormControlLabel value="4" control={<Radio checked={assessmentStep23Answer == 4} onChange={handleChange} />} label="Most of the time" />
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
                onClick={() => router.push('/assessment/22')}
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