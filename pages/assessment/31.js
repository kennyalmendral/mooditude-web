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

export default function Assessment31() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 ,29]

  const [assessmentStep31Answer, setAssessmentStep31Answer] = useState('')
  const [formError, setFormError] = useState(false)

  const [assessmentStep31Time, setAssessmentStep31Time] = useState(0)
  const [timer, setTimer] = useState(null)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem('currentAssessmentStep') !== null) {
      localStorage.setItem('currentAssessmentStep', 31)

      console.log(`Current assessment step: ${localStorage.getItem('currentAssessmentStep')}`)
    }

    if (localStorage.getItem('assessmentStep31Answer') > 0) {
      setAssessmentStep31Answer(localStorage.getItem('assessmentStep31Answer'))
    }

    setTimer(setInterval(() => {
      console.log(`Time to answer: ${assessmentStep31Time}`)
      setAssessmentStep31Time(assessmentStep31Time++)
    }, 1000))
  }, [])

  useEffect(() => {
    assessmentStep31Answer > 0 && console.log(`Assessment step 31 answer: ${assessmentStep31Answer}`)
  }, [assessmentStep31Answer])

  const handleChange = (e) => {
    clearInterval(timer)
    localStorage.setItem('assessmentStep31Time', assessmentStep31Time)
    console.log(`Timer cleared at ${assessmentStep31Time} second(s)`)

    setAssessmentStep31Answer(e.target.value)
  }

  const handleNextStep = () => {
    setFormError(false)

    if (assessmentStep31Answer !== '') {
      localStorage.setItem('assessmentStep31Answer', parseInt(assessmentStep31Answer))
      
      router.push('/assessment/analyzing')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Question 29 | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper} ${styles.on_assessment_wrapper}`}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Assess Your Wellbeing Score</h2>
          <p className={styles.step_text}>Question 29 of 29</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={28} alternativeLabel={true} epand="true">
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <Animation direction="right" in={true} timeout={1000}>
            <div>
              <p className={styles.top_sub_title}>Have you noticed whether any of the symptoms you described...</p>
              <h1 className={`mt_0`}>has led to you using drugs?</h1>  
            </div>
          </Animation>
          
          <div className={styles.form_wrap}>
            <Animation direction="right" in={true} timeout={1000}>
            <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
              
              <RadioGroup>
                <FormControlLabel 
                  value="0" 
                  className={styles.with_text_wrap}
                  control={<Radio checked={assessmentStep31Answer == 0} onChange={handleChange} />} 
                  label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Not at all <div>Since you are under 18, get permission from your parents before using this app. </div>`}} />} />
                
                <FormControlLabel value="1" control={<Radio checked={assessmentStep31Answer == 1} onChange={handleChange} />} label="Rarely" />
                <FormControlLabel value="2" control={<Radio checked={assessmentStep31Answer == 2} onChange={handleChange} />} label="Sometimes" />
                <FormControlLabel value="3" control={<Radio checked={assessmentStep31Answer == 3} onChange={handleChange} />} label="Often" />
                <FormControlLabel value="4" control={<Radio checked={assessmentStep31Answer == 4} onChange={handleChange} />} label="Most of the time" />
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
                onClick={() => router.push('/assessment/30')}
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