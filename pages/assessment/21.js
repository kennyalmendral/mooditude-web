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

import Animation from '@mui/material/Fade';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export default function Assessment21() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 ,29]

  const [assessmentStep21Answer, setAssessmentStep21Answer] = useState('')
  const [formError, setFormError] = useState(false)

  const [assessmentStep21Time, setAssessmentStep21Time] = useState(0)
  const [timer, setTimer] = useState(null)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    } else {
      if (authUser && localStorage.getItem(`${authUser.uid}_assessmentStep21Answer`) !== null) {
        setAssessmentStep21Answer(localStorage.getItem(`${authUser.uid}_assessmentStep21Answer`))
      }
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentAssessmentStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentAssessmentStep`, 21)

      console.log(`Current assessment step: ${localStorage.getItem(`${authUser.uid}_currentAssessmentStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_assessmentStep21Answer`) > 0) {
      setAssessmentStep21Answer(localStorage.getItem(`${authUser.uid}_assessmentStep21Answer`))
    }

    setTimer(setInterval(() => {
      console.log(`Time to answer: ${assessmentStep21Time}`)
      setAssessmentStep21Time(assessmentStep21Time++)
    }, 1000))
  }, [])

  useEffect(() => {
    assessmentStep21Answer > 0 && console.log(`Assessment step 21 answer: ${assessmentStep21Answer}`)
  }, [assessmentStep21Answer])

  const handleChange = (e) => {
    clearInterval(timer)
    localStorage.setItem(`${authUser.uid}_assessmentStep21Answer`, e.target.value)
    localStorage.setItem(`${authUser.uid}_assessmentStep21Time`, assessmentStep21Time)
    setAssessmentStep21Answer(e.target.value)
    router.push('/assessment/22')
  }

  const handleNextStep = () => {
    setFormError(false)

    if (assessmentStep21Answer !== '') {
      localStorage.setItem(`${authUser.uid}_assessmentStep21Answer`, parseInt(assessmentStep21Answer))
      
      router.push('/assessment/22')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Question 21 | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper} ${styles.on_assessment_wrapper}`}>
        <div className={styles.onboarding_inner_wrapper}>
          <div className={`${styles.line_header_wrap} ${styles.assessment_step21}`}>
            <p className={styles.step_text}>Question 21 of 29</p>
            <h2 className={styles.wellBeingText}>Assess Your Wellbeing Score</h2>
          </div>
          
            <div className={styles.fadeInDown500}>
              <p className={styles.top_sub_title}>Over the past two weeks...</p>
              <h1 className={`mt_0`}>I feel the need to check and recheck things</h1>  
            </div>
          
          
          <div className={`${styles.form_wrap} ${styles.fadeInDown400}`}>
            
            <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
              
              <RadioGroup>
                <FormControlLabel value="0" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep21Answer == '0'} onChange={handleChange} />} label="Not at all" />
                <FormControlLabel value="1" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep21Answer == '1'} onChange={handleChange} />} label="Rarely" />
                <FormControlLabel value="2" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep21Answer == '2'} onChange={handleChange} />} label="Sometimes" />
                <FormControlLabel value="3" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep21Answer == '3'} onChange={handleChange} />} label="Often" />
                <FormControlLabel value="4" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep21Answer == '4'} onChange={handleChange} />} label="Most of the time" />
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
                onClick={() => router.push('/assessment/20')}
              >
                Back
              </Button>

              <Button 
                size="large" 
                className={styles.onboarding_btn} 
                variant="contained" 
                onClick={handleNextStep} 
                disabled={assessmentStep21Answer == '' || parseInt(assessmentStep21Answer) > 4 ? true : false} 
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