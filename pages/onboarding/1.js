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
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import Grow from '@mui/material/Fade';

export default function Onboarding1() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]

  const [profileStepAnswer, setProfileStepAnswer] = useState('')
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentProfileStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentProfileStep`, 1)

      console.log(`Current profile step: ${localStorage.getItem(`${authUser.uid}_currentProfileStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_profileStep1Answer`) > 0) {
      setProfileStepAnswer(localStorage.getItem(`${authUser.uid}_profileStep1Answer`))
    }
  }, [])

  useEffect(() => {
    profileStepAnswer > 0 && console.log(`Profile step 1 answer: ${profileStepAnswer}`)
  }, [profileStepAnswer])

  const handleChange = e => {
    localStorage.setItem(`${authUser.uid}_profileStep1Answer`, e.target.value)    

    setProfileStepAnswer(e.target.value)

    router.push('/onboarding/2')
  }

  const handleNextStep = () => {
    setFormError(false)
    if (profileStepAnswer !== '') {
      localStorage.setItem(`${authUser.uid}_profileStep1Answer`, parseInt(profileStepAnswer))
      
      router.push('/onboarding/2')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Step 1 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          
          <div className={`${styles.line_header_wrap} ${styles.onboarding_step1}`}>
            <p className={styles.step_text}>Step 1 of 7</p>
            <h2>Personalize Mooditude</h2>
          </div>
         
          <Grow in={true} timeout={1000}>
            <h1>How old are you?</h1>  
          </Grow>
          
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
            <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
              
              <RadioGroup>
                <FormControlLabel 
                  value="1" 
                  className={styles.with_text_wrap}
                  control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == '1'} onChange={e => setProfileStepAnswer(e.target.value)} />} 
                  label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `< 18 <div>Since you're under 18, get permission from your parents before you use this app. (Just let 'em know what you're up to.)</div>`}} />} />
                
                <FormControlLabel value="2" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == '2'} onChange={handleChange} />} label="19 — 24" />
                <FormControlLabel value="3" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == '3'} onChange={handleChange} />} label="25 — 39" />
                <FormControlLabel value="4" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == '4'} onChange={handleChange} />} label="40 — 59" />
                <FormControlLabel value="5" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == '5'} onChange={handleChange} />} label="> 60" />
              </RadioGroup>
              {
                formError ? 
                <FormHelperText>Please choose an answer.</FormHelperText> : ''
              }

            </FormControl>
            </Grow>
          </div>

          <div className={styles.btn_wrap}>
          <Stack direction="row" spacing={2}>
            <Button 
              size="large" 
              className={styles.onboarding_btn} 
              variant="contained" 
              onClick={handleNextStep} 
              disabled={profileStepAnswer == '' ? true : false}
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