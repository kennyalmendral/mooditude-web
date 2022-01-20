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
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export default function Onboarding4() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(3);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [profileStepAnswer, setProfileStepAnswer] = useState([])
  const [isPeopleChecked, setIsPeopleChecked] = useState(false)
  const [isWorkSchoolChecked, setIsWorkSchoolChecked] = useState(false)
  const [isHealthChecked, setIsHealthChecked] = useState(false)
  const [isMoneyChecked, setIsMoneyChecked] = useState(false)
  const [isMeChecked, setIsMeChecked] = useState(false)
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentProfileStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentProfileStep`, 4)

      console.log(`Current profile step: ${localStorage.getItem(`${authUser.uid}_currentProfileStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_profileStep4Answer`) != null) {
      setProfileStepAnswer(localStorage.getItem(`${authUser.uid}_profileStep4Answer`).split(','))
    }
  }, [])

  useEffect(() => {
    profileStepAnswer.length > 0 && console.log(`Profile step 4 answer: ${profileStepAnswer.join(',')}`)

    if (profileStepAnswer.length > 0) {
      profileStepAnswer.includes('people') && setIsPeopleChecked(true)
      profileStepAnswer.includes('work') && setIsWorkSchoolChecked(true)
      profileStepAnswer.includes('health') && setIsHealthChecked(true)
      profileStepAnswer.includes('money') && setIsMoneyChecked(true)
      profileStepAnswer.includes('me') && setIsMeChecked(true)
    }
  }, [profileStepAnswer])

  const toggleIsPeopleChecked = (isChecked, value) => {
    if (isChecked) {
      setIsPeopleChecked(true)
      setProfileStepAnswer([...profileStepAnswer, value])
    } else {
      setIsPeopleChecked(false)
      setProfileStepAnswer(removeArrItem(profileStepAnswer, value))
    }
  }

  const toggleIsWorkSchoolChecked = (isChecked, value) => {
    if (isChecked) {
      setIsWorkSchoolChecked(true)
      setProfileStepAnswer([...profileStepAnswer, value])
    } else {
      setIsWorkSchoolChecked(false)
      setProfileStepAnswer(removeArrItem(profileStepAnswer, value))
    }
  }

  const toggleIsHealthChecked = (isChecked, value) => {
    if (isChecked) {
      setIsHealthChecked(true)
      setProfileStepAnswer([...profileStepAnswer, value])
    } else {
      setIsHealthChecked(false)
      setProfileStepAnswer(removeArrItem(profileStepAnswer, value))
    }
  }

  const toggleIsMoneyChecked = (isChecked, value) => {
    if (isChecked) {
      setIsMoneyChecked(true)
      setProfileStepAnswer([...profileStepAnswer, value])
    } else {
      setIsMoneyChecked(false)
      setProfileStepAnswer(removeArrItem(profileStepAnswer, value))
    }
  }

  const toggleIsMeChecked = (isChecked, value) => {
    if (isChecked) {
      setIsMeChecked(true)
      setProfileStepAnswer([...profileStepAnswer, value])
    } else {
      setIsMeChecked(false)
      setProfileStepAnswer(removeArrItem(profileStepAnswer, value))
    }
  }

  const handleNextStep = () => {
    setFormError(false)
    if (profileStepAnswer.length > 0) {
      localStorage.setItem(`${authUser.uid}_profileStep4Answer`, profileStepAnswer.join(','))
      
      router.push('/onboarding/5')
    } else {
      setFormError(true)
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
          

          <div className={`${styles.line_header_wrap} ${styles.onboarding_step4}`}>
            <p className={styles.step_text}>Step 4 of 7</p>
            <h2>Personalize Mooditude</h2>
          </div>


          <Grow in={true} timeout={1000}>
            <div>
              <h1 >What's the biggest roadblock in your way?</h1>  
              {/*<p className={styles.onboarding_sub_title}>Select one or more</p>*/}
            </div>
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={isPeopleChecked} onChange={(event) => event.target.checked ? toggleIsPeopleChecked(true, event.target.value) : toggleIsPeopleChecked(false, event.target.value)} />
                    }
                    label="People" 
                    value="people"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={isWorkSchoolChecked} onChange={(event) => event.target.checked ? toggleIsWorkSchoolChecked(true, event.target.value) : toggleIsWorkSchoolChecked(false, event.target.value)} />
                    }
                    label="Work or School"
                    value="work"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={isHealthChecked} onChange={(event) => event.target.checked ? toggleIsHealthChecked(true, event.target.value) : toggleIsHealthChecked(false, event.target.value)} />
                    }
                    label="Health"
                    value="health"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={isMoneyChecked} onChange={(event) => event.target.checked ? toggleIsMoneyChecked(true, event.target.value) : toggleIsMoneyChecked(false, event.target.value)} />
                    }
                    label="Money"
                    value="money"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={isMeChecked} onChange={(event) => event.target.checked ? toggleIsMeChecked(true, event.target.value) : toggleIsMeChecked(false, event.target.value)} />
                    }
                    label="Me"
                    value="me"
                  />
                </FormGroup>
                {
                  formError ? 
                  <FormHelperText>Please select 1 or more items.</FormHelperText> : ''
                }
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
                disabled={profileStepAnswer.length == 0 ? true : false}
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