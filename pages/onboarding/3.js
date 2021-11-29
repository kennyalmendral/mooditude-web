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

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grow from '@mui/material/Fade';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export default function Onboarding3() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(2);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [profileStepAnswer, setProfileStepAnswer] = useState('')
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentProfileStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentProfileStep`, 3)
      console.log(profileStepAnswer)
      console.log(`Current profile step: ${localStorage.getItem(`${authUser.uid}_currentProfileStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_profileStep3Answer`) !== '') {
      setProfileStepAnswer(localStorage.getItem(`${authUser.uid}_profileStep3Answer`))
    }
  }, [])

  useEffect(() => {
    profileStepAnswer > 0 && console.log(`Profile step 3 answer: ${profileStepAnswer}`)
  }, [profileStepAnswer])

  const handleNextStep = () => {
    setFormError(false)
    if (profileStepAnswer !== '') {
      localStorage.setItem(`${authUser.uid}_profileStep3Answer`, profileStepAnswer)
      
      router.push('/onboarding/4')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Step 3 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <h2>Personalize Mooditude</h2>
          <p className={styles.step_text}>Step 3 of 7</p>

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
              <h1 className={`mb_0`}>What do you want to achieve?</h1>  
              <p className={styles.onboarding_sub_title}>Please select just one, the most important goal.</p>
            </div>
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
                
                <RadioGroup>
                  
                  
                  <FormControlLabel 
                    value="sleepBetter" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'sleepBetter'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Sleep Better <div>We get it; without a good night's sleep it's a struggle to get through the day. We'll help you build a routine that'll improve your sleep.</div>`}} />} />
                  <FormControlLabel 
                    value="handleStress" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'handleStress'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Handle Stress <div>Despite being unpleasant, stress is not an illness. But there are connections between stress and mental health conditions. We'll introduce you to self-care techniques for managing stress.</div>`}} />} />
                  <FormControlLabel 
                    value="masterDepression" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'masterDepression'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Master Depression <div>Depression is the absence of hope. You look forward to feeling alive again. We'll introduce you to tools and techniques that inspire hope.</div>`}} />} />
                  <FormControlLabel 
                    value="overcomeAnxiety" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'overcomeAnxiety'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Overcome Anxiety <div>Anxiety is a beast. We'll help you create a mind-body connection to change your behavior, lifestyle, and thought patterns. The result? A calmer and happier life.</div>`}} />} />
                  <FormControlLabel 
                    value="controlAnger" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'controlAnger'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Control Anger <div>Anger is our instinctual response to a threat. Learn to escape its control. We'll give you coping activities to use when you feel hurt, annoyed, or disappointed.</div>`}} />} />
                  <FormControlLabel 
                    value="boostSelfEsteem" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'boostSelfEsteem'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Boost Self-esteem <div>Overcome your fear of failure and pursue your dreams. We'll show you how to dismiss negative thoughts, meet your inner-self, and build rockstar self-esteem.</div>`}} />} />
                  <FormControlLabel 
                    value="liveHappier" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'liveHappier'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Feel Happier <div>Find your rose-tinted glasses. We'll introduce you to the skills needed to deal with people, handle unforeseeable events, and build a mind-body connection for a fulfilling life.</div>`}} />} />

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
                color="secondary"
                variant="outlined" 
                // onClick={handlePrevStep}
                onClick={() => {router.push(`/onboarding/2`)}}

              >Back</Button>

              <Button 
                size="large" 
                variant="contained" 
                onClick={handleNextStep}
                disabled={profileStepAnswer == '' || profileStepAnswer == null ? true : false}
                // onClick={() => {router.push(`/onboarding/4`)}}
              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}