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

import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';

import Grow from '@mui/material/Fade';

export default function Onboarding4() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(3);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [profileStep4Answer, setProfileStep4Answer] = useState([])
  const [isPeopleChecked, setIsPeopleChecked] = useState(false)
  const [isWorkSchoolChecked, setIsWorkSchoolChecked] = useState(false)
  const [isHealthChecked, setIsHealthChecked] = useState(false)
  const [isMoneyChecked, setIsMoneyChecked] = useState(false)
  const [isMeChecked, setIsMeChecked] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (localStorage.getItem('currentProfileStep') !== null) {
      localStorage.setItem('currentProfileStep', 4)

      console.log(`Current profile step: ${localStorage.getItem('currentProfileStep')}`)
    }

    if (localStorage.getItem('profileStep4Answer') != null) {
      setProfileStep4Answer(localStorage.getItem('profileStep4Answer').split(','))
    }
  }, [])

  useEffect(() => {
    profileStep4Answer.length > 0 && console.log(`Profile step 4 answer: ${profileStep4Answer.join(',')}`)

    if (profileStep4Answer.length > 0) {
      profileStep4Answer.includes('people') && setIsPeopleChecked(true)
      profileStep4Answer.includes('work') && setIsWorkSchoolChecked(true)
      profileStep4Answer.includes('health') && setIsHealthChecked(true)
      profileStep4Answer.includes('money') && setIsMoneyChecked(true)
      profileStep4Answer.includes('me') && setIsMeChecked(true)
    }
  }, [profileStep4Answer])

  const toggleIsPeopleChecked = (isChecked, value) => {
    if (isChecked) {
      setIsPeopleChecked(true)
      setProfileStep4Answer([...profileStep4Answer, value])
    } else {
      setIsPeopleChecked(false)
      setProfileStep4Answer(removeArrItem(profileStep4Answer, value))
    }
  }

  const toggleIsWorkSchoolChecked = (isChecked, value) => {
    if (isChecked) {
      setIsWorkSchoolChecked(true)
      setProfileStep4Answer([...profileStep4Answer, value])
    } else {
      setIsWorkSchoolChecked(false)
      setProfileStep4Answer(removeArrItem(profileStep4Answer, value))
    }
  }

  const toggleIsHealthChecked = (isChecked, value) => {
    if (isChecked) {
      setIsHealthChecked(true)
      setProfileStep4Answer([...profileStep4Answer, value])
    } else {
      setIsHealthChecked(false)
      setProfileStep4Answer(removeArrItem(profileStep4Answer, value))
    }
  }

  const toggleIsMoneyChecked = (isChecked, value) => {
    if (isChecked) {
      setIsMoneyChecked(true)
      setProfileStep4Answer([...profileStep4Answer, value])
    } else {
      setIsMoneyChecked(false)
      setProfileStep4Answer(removeArrItem(profileStep4Answer, value))
    }
  }

  const toggleIsMeChecked = (isChecked, value) => {
    if (isChecked) {
      setIsMeChecked(true)
      setProfileStep4Answer([...profileStep4Answer, value])
    } else {
      setIsMeChecked(false)
      setProfileStep4Answer(removeArrItem(profileStep4Answer, value))
    }
  }

  const handleNextStep = () => {
    if (profileStep4Answer.length > 0) {
      localStorage.setItem('profileStep4Answer', profileStep4Answer.join(','))
      
      router.push('/onboarding/5')
    } else {
      alert('Please select answers.')
    }
  }
  
  const removeArrItem = (arr, value) => { 
    return arr.filter(function(el){  
      return el != value; 
    });
  }

  return (
    <Layout title={`Step 4 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 4 of 7</p>

          <div className={`custom_stepper_wrap ${styles.custom_stepper_wrapper}`}>
            <Stepper activeStep={currentStep} alternativeLabel={true} epand="true">
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <Grow in={true} timeout={1000}>
            <div>
              <h1 className={`mb_0`}>What’s the biggest roadblock in your way?</h1>  
              <p className={styles.onboarding_sub_title}>Select one or more</p>
            </div>
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox checked={isPeopleChecked} onChange={(event) => event.target.checked ? toggleIsPeopleChecked(true, event.target.value) : toggleIsPeopleChecked(false, event.target.value)} />
                    }
                    label="People" 
                    value="people"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={isWorkSchoolChecked} onChange={(event) => event.target.checked ? toggleIsWorkSchoolChecked(true, event.target.value) : toggleIsWorkSchoolChecked(false, event.target.value)} />
                    }
                    label="Work or School"
                    value="work"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={isHealthChecked} onChange={(event) => event.target.checked ? toggleIsHealthChecked(true, event.target.value) : toggleIsHealthChecked(false, event.target.value)} />
                    }
                    label="Health"
                    value="health"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={isMoneyChecked} onChange={(event) => event.target.checked ? toggleIsMoneyChecked(true, event.target.value) : toggleIsMoneyChecked(false, event.target.value)} />
                    }
                    label="Money"
                    value="money"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={isMeChecked} onChange={(event) => event.target.checked ? toggleIsMeChecked(true, event.target.value) : toggleIsMeChecked(false, event.target.value)} />
                    }
                    label="Me"
                    value="me"
                  />
                </FormGroup>

                </FormControl>
              </Grow>
          </div>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                color="secondary"
                variant="outlined"
                onClick={() => {router.push(`/onboarding/3`)}}
                // onClick={handlePrevStep}
              >Back</Button>

              <Button 
                size="large" 
                variant="contained"
                // onClick={() => {router.push(`/onboarding/5`)}}
                onClick={handleNextStep}
              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}