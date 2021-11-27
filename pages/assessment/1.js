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

export default function Assessment1() {
  const router = useRouter()

  const { authUser, loading } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 ,29]

  const [assessmentStep1Answer, setAssessmentStep1Answer] = useState('')
  const [formError, setFormError] = useState(false)

  const [assessmentStep1Time, setAssessmentStep1Time] = useState(0)
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem('currentAssessmentStep') !== null) {
      localStorage.setItem('currentAssessmentStep', 1)

      console.log(`Current assessment step: ${localStorage.getItem('currentAssessmentStep')}`)
    }

    if (localStorage.getItem('assessmentStep1Answer') > 0) {
      setAssessmentStep1Answer(localStorage.getItem('assessmentStep1Answer'))
    }

    setTimer(setInterval(() => {
      console.log(`Time to answer: ${assessmentStep1Time}`)
      setAssessmentStep1Time(assessmentStep1Time++)
    }, 1000))
  }, [])

  useEffect(() => {
    assessmentStep1Answer > 0 && console.log(`Assessment step 1 answer: ${assessmentStep1Answer}`)
  }, [assessmentStep1Answer])

  const handleChange = (e) => {
    clearInterval(timer)
    localStorage.setItem('assessmentStep1Time', assessmentStep1Time)
    console.log(`Timer cleared at ${assessmentStep1Time} second(s)`)

    setAssessmentStep1Answer(e.target.value)
  }

  const handleNextStep = () => {
    setFormError(false)

    if (assessmentStep1Answer !== '') {
      localStorage.setItem('assessmentStep1Answer', parseInt(assessmentStep1Answer))
      
      router.push('/assessment/2')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Question 1 | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper} ${styles.on_assessment_wrapper}`}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Assess Your Wellbeing Score</h2>
          <p className={styles.step_text}>Question 1 of 29</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={0} alternativeLabel={true} epand="true">
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <Animation direction="right" in={true} timeout={1000}>
            <div>
              {/* <p className={styles.top_sub_title}>Select one or more</p> */}
              <h1 className={`mt_0`}>I feel sad, down in the dumps or unhappy</h1>  
            </div>
          </Animation>
          
          <div className={styles.form_wrap}>
            <Animation direction="right" in={true} timeout={1000}>
            <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
              
              <RadioGroup>
                <FormControlLabel 
                  value="0" 
                  className={styles.with_text_wrap}
                  control={<Radio checked={assessmentStep1Answer == 0} onChange={handleChange} />} 
                  label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Not at all <div>Since you are under 18, get permission from your parents before using this app. </div>`}} />} />
                
                <FormControlLabel value="1" control={<Radio checked={assessmentStep1Answer == 1} onChange={handleChange} />} label="Rarely" />
                <FormControlLabel value="2" control={<Radio checked={assessmentStep1Answer == 2} onChange={handleChange} />} label="Sometimes" />
                <FormControlLabel value="3" control={<Radio checked={assessmentStep1Answer == 3} onChange={handleChange} />} label="Often" />
                <FormControlLabel value="4" control={<Radio checked={assessmentStep1Answer == 4} onChange={handleChange} />} label="Most of the time" />
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