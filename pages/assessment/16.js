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

export default function Assessment16() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 ,29]

  const [assessmentStep16Answer, setAssessmentStep16Answer] = useState('')
  const [formError, setFormError] = useState(false)

  const [assessmentStep16Time, setAssessmentStep16Time] = useState(0)
  const [timer, setTimer] = useState(null)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    } else {
      if (authUser && localStorage.getItem(`${authUser.uid}_assessmentStep16Answer`) !== null) {
        setAssessmentStep16Answer(localStorage.getItem(`${authUser.uid}_assessmentStep16Answer`))
      }
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentAssessmentStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentAssessmentStep`, 16)

      console.log(`Current assessment step: ${localStorage.getItem(`${authUser.uid}_currentAssessmentStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_assessmentStep16Answer`) > 0) {
      setAssessmentStep16Answer(localStorage.getItem(`${authUser.uid}_assessmentStep16Answer`))
    }

    setTimer(setInterval(() => {
      console.log(`Time to answer: ${assessmentStep16Time}`)
      setAssessmentStep16Time(assessmentStep16Time++)
    }, 1000))
  }, [])

  useEffect(() => {
    assessmentStep16Answer > 0 && console.log(`Assessment step 16 answer: ${assessmentStep16Answer}`)
  }, [assessmentStep16Answer])

  const handleChange = (e) => {
    clearInterval(timer)
    localStorage.setItem(`${authUser.uid}_assessmentStep16Answer`, e.target.value)
    localStorage.setItem(`${authUser.uid}_assessmentStep16Time`, assessmentStep16Time)
    setAssessmentStep16Answer(e.target.value)
    router.push('/assessment/17')
  }

  const handleNextStep = () => {
    setFormError(false)

    if (assessmentStep16Answer !== '') {
      localStorage.setItem(`${authUser.uid}_assessmentStep16Answer`, parseInt(assessmentStep16Answer))
      
      router.push('/assessment/17')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Question 16 | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper} ${styles.on_assessment_wrapper}`}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2 className={styles.wellBeingText}>Assess Your Wellbeing Score</h2>
          <p className={styles.step_text}>Question 16 of 29</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={15} alternativeLabel={true} epand="true">
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          
            <div className={styles.fadeInDown500}>
              <p className={styles.top_sub_title}>Over the past two weeks...</p>
              <h1 className={`mt_0`}>I am jumpy or feel startled easily</h1>  
            </div>
          
          
          <div className={`${styles.form_wrap} ${styles.fadeInDown400}`}>
            
            <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
              
              <RadioGroup>
                <FormControlLabel value="0" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep16Answer == '0'} onChange={handleChange} />} label="Not at all" />
                <FormControlLabel value="1" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep16Answer == '1'} onChange={handleChange} />} label="Rarely" />
                <FormControlLabel value="2" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep16Answer == '2'} onChange={handleChange} />} label="Sometimes" />
                <FormControlLabel value="3" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep16Answer == '3'} onChange={handleChange} />} label="Often" />
                <FormControlLabel value="4" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep16Answer == '4'} onChange={handleChange} />} label="Most of the time" />
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
                onClick={() => router.push('/assessment/15')}
              >
                Back
              </Button>

              <Button 
                size="large" 
                className={styles.onboarding_btn} 
                variant="contained" 
                onClick={handleNextStep} 
                disabled={assessmentStep16Answer == '' || parseInt(assessmentStep16Answer) > 4 ? true : false} 
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