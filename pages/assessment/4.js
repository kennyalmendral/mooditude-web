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

export default function Assessment4() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 ,29]

  const [assessmentStep4Answer, setAssessmentStep4Answer] = useState('')
  const [formError, setFormError] = useState(false)

  const [assessmentStep4Time, setAssessmentStep4Time] = useState(0)
  const [timer, setTimer] = useState(null)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    } else {
      if (authUser && localStorage.getItem(`${authUser.uid}_assessmentStep4Answer`) !== null) {
        setAssessmentStep4Answer(localStorage.getItem(`${authUser.uid}_assessmentStep4Answer`))
      }
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentAssessmentStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentAssessmentStep`, 4)

      console.log(`Current assessment step: ${localStorage.getItem(`${authUser.uid}_currentAssessmentStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_assessmentStep4Answer`) > 0) {
      setAssessmentStep4Answer(localStorage.getItem(`${authUser.uid}_assessmentStep4Answer`))
    }

    setTimer(setInterval(() => {
      console.log(`Time to answer: ${assessmentStep4Time}`)
      setAssessmentStep4Time(assessmentStep4Time++)
    }, 1000))
  }, [])

  useEffect(() => {
    assessmentStep4Answer > 0 && console.log(`Assessment step 4 answer: ${assessmentStep4Answer}`)
  }, [assessmentStep4Answer])

  const handleChange = (e) => {
    clearInterval(timer)
    localStorage.setItem(`${authUser.uid}_assessmentStep4Answer`, e.target.value)
    localStorage.setItem(`${authUser.uid}_assessmentStep4Time`, assessmentStep4Time)
    setAssessmentStep4Answer(e.target.value)
    router.push('/assessment/5')
  }

  const handleNextStep = () => {
    setFormError(false)

    if (assessmentStep4Answer !== '') {
      localStorage.setItem(`${authUser.uid}_assessmentStep4Answer`, parseInt(assessmentStep4Answer))
      
      router.push('/assessment/5')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Question 4 | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper} ${styles.on_assessment_wrapper}`}>
        <div className={styles.onboarding_inner_wrapper}>
          <div className={`${styles.line_header_wrap} ${styles.assessment_step4}`}>
            <p className={styles.step_text}>Question 4 of 29</p>
            <h2 className={styles.wellBeingText}>Assess Your Wellbeing Score</h2>
          </div>
          
            <div className={styles.fadeInDown500}>
              <p className={styles.top_sub_title}>Over the past two weeks...</p>
              <h1 className={`mt_0`}>I feel tired; have no energy</h1>  
            </div>
          
          
          <div className={`${styles.form_wrap} ${styles.fadeInDown400}`}>
            
            <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
              
              <RadioGroup>
                <FormControlLabel value="0" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep4Answer == '0'} onChange={handleChange} />} label="Not at all" />
                <FormControlLabel value="1" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep4Answer == '1'} onChange={handleChange} />} label="Rarely" />
                <FormControlLabel value="2" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep4Answer == '2'} onChange={handleChange} />} label="Sometimes" />
                <FormControlLabel value="3" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep4Answer == '3'} onChange={handleChange} />} label="Often" />
                <FormControlLabel value="4" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep4Answer == '4'} onChange={handleChange} />} label="Most of the time" />
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
                onClick={() => router.push('/assessment/3')}
              >
                Back
              </Button>

              <Button 
                size="large" 
                className={styles.onboarding_btn} 
                variant="contained" 
                onClick={handleNextStep} 
                disabled={assessmentStep4Answer == '' || parseInt(assessmentStep4Answer) > 4 ? true : false} 
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