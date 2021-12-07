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

export default function Assessment19() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 ,29]

  const [assessmentStep19Answer, setAssessmentStep19Answer] = useState('')
  const [formError, setFormError] = useState(false)

  const [assessmentStep19Time, setAssessmentStep19Time] = useState(0)
  const [timer, setTimer] = useState(null)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    } else {
      if (authUser && localStorage.getItem(`${authUser.uid}_assessmentStep19Answer`) !== null) {
        setAssessmentStep19Answer(localStorage.getItem(`${authUser.uid}_assessmentStep19Answer`))
      }
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentAssessmentStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentAssessmentStep`, 19)

      console.log(`Current assessment step: ${localStorage.getItem(`${authUser.uid}_currentAssessmentStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_assessmentStep19Answer`) > 0) {
      setAssessmentStep19Answer(localStorage.getItem(`${authUser.uid}_assessmentStep19Answer`))
    }

    setTimer(setInterval(() => {
      console.log(`Time to answer: ${assessmentStep19Time}`)
      setAssessmentStep19Time(assessmentStep19Time++)
    }, 1000))
  }, [])

  useEffect(() => {
    assessmentStep19Answer > 0 && console.log(`Assessment step 19 answer: ${assessmentStep19Answer}`)
  }, [assessmentStep19Answer])

  const handleChange = (e) => {
    clearInterval(timer)
    localStorage.setItem(`${authUser.uid}_assessmentStep19Answer`, e.target.value)
    localStorage.setItem(`${authUser.uid}_assessmentStep19Time`, assessmentStep19Time)
    setAssessmentStep19Answer(e.target.value)
    router.push('/assessment/20')
  }

  const handleNextStep = () => {
    setFormError(false)

    if (assessmentStep19Answer !== '') {
      localStorage.setItem(`${authUser.uid}_assessmentStep19Answer`, parseInt(assessmentStep19Answer))
      
      router.push('/assessment/20')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Question 19 | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper} ${styles.on_assessment_wrapper}`}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2 className={styles.wellBeingText}>Assess Your Wellbeing Score</h2>
          <p className={styles.step_text}>Question 19 of 29</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={18} alternativeLabel={true} epand="true">
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          
            <div className={styles.fadeInDown500}>
              <p className={styles.top_sub_title}>Over the past two weeks...</p>
              <h1 className={`mt_0`}>I can’t get certain thoughts out of my mind</h1>  
            </div>
          
          
          <div className={`${styles.form_wrap} ${styles.fadeInDown400}`}>
            
            <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
              
              <RadioGroup>
                <FormControlLabel value="0" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep19Answer == '0'} onChange={handleChange} />} label="Not at all" />
                <FormControlLabel value="1" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep19Answer == '1'} onChange={handleChange} />} label="Rarely" />
                <FormControlLabel value="2" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep19Answer == '2'} onChange={handleChange} />} label="Sometimes" />
                <FormControlLabel value="3" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep19Answer == '3'} onChange={handleChange} />} label="Often" />
                <FormControlLabel value="4" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep19Answer == '4'} onChange={handleChange} />} label="Most of the time" />
              </RadioGroup>
              {
                formError ? 
                <FormHelperText>Please choose an answer.</FormHelperText> : ''
              }

            </FormControl>
            
          </div>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                color="secondary"
                variant="outlined" 
                // onClick={handlePrevStep} 
                onClick={() => router.push('/assessment/18')}
              >
                Back
              </Button>

              <Button 
                size="large" 
                className={styles.onboarding_btn} 
                variant="contained" 
                onClick={handleNextStep} 
                disabled={assessmentStep19Answer == '' || parseInt(assessmentStep19Answer) > 4 ? true : false} 
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