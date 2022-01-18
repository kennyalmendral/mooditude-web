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
import TextField from '@mui/material/TextField'

export default function Onboarding3() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(2);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2

  const [profileStepAnswer, setProfileStepAnswer] = useState('')
  const [other, setOther] = useState('')

  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
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

    if (authUser && localStorage.getItem(`${authUser.uid}_profileStep3AnswerOtherReason`) !== '') {
      setOther(localStorage.getItem(`${authUser.uid}_profileStep3AnswerOtherReason`))
    }
  }, [])

  useEffect(() => {
    profileStepAnswer > 0 && console.log(`Profile step 3 answer: ${profileStepAnswer}`)
  }, [profileStepAnswer])

  const handleNextStep = () => {
    setFormError(false)
    if (profileStepAnswer !== '') {
      localStorage.setItem(`${authUser.uid}_profileStep3Answer`, profileStepAnswer)

      if (profileStepAnswer == 'other') {
        localStorage.setItem(`${authUser.uid}_profileStep3AnswerOtherReason`, other)
      }
      
      router.push('/onboarding/4')
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Step 3 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          

          <div className={styles.line_header_wrap}>
            <p className={styles.step_text}>Step 3 of 7</p>
            <h2>Personalize Mooditude</h2>
          </div>

          <Grow in={true} timeout={1000}>
            <div>
              <h1>What encourged you to take control of your mental health today?</h1>  
              {/*<p className={styles.onboarding_sub_title}>Please select just one, the most important goal.</p>*/}
            </div>
          </Grow>
          <div className={styles.form_wrap}>
            <Grow in={true} timeout={1000}>
          
              <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}} className={styles.max_80}>
                
                <RadioGroup>
                  
                  
                  <FormControlLabel 
                    value="lonely" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'lonely'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `I’m lonely <div>In addition to being emotionally painful, loneliness can bring on serious mental health concerns. Mooditude’s supportive community is available 24/7 to give and get support.</div>`}} />} />
                  <FormControlLabel 
                    value="masterDepression" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'masterDepression'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `I’m feeling depressed <div>Depression is the absence of hope. you look forward to feeling alive again. We’ll introduce you to tools and techniques that inspire hope.</div>`}} />} />
                  <FormControlLabel 
                    value="relationships" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'relationships'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `I’m struggling in my relationships <div>Healthy interpersonal relationships are a vital part of our life and overall mental health. We'll give you boundary-setting tactics and healthy communication skills with those around you.</div>`}} />} />
                  <FormControlLabel 
                    value="overcomeAnxiety" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'overcomeAnxiety'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `I’m restless and anxious <div>The overwhelming feeling of worry or fear can take many forms, and have various levels of severity. We'll introduce you to self-care techniques and coping skills for managing your anxiety, no matter how severe.</div>`}} />} />
                  <FormControlLabel 
                    value="trauma" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'trauma'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `I don’t know how to cope with past trauma <div>Trauma can cause overwhelming emotional and physical reactions when least expected. We'll give you self-help strategies that will help you work through your trauma. </div>`}} />} />
                  <FormControlLabel 
                    value="handleStress" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'handleStress'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `I’m burnt out <div>Emotional, physical, and mental exhaustion brought on by prolonged stress - burnout can cause severe health conditions if not treated. We'll provide you with tools and techniques to manage burnout.</div>`}} />} />
                  <FormControlLabel 
                    value="controlAnger" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'controlAnger'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `I’m struggling to control my anger <div>Anger is a natural response to a threat. It became a problem when you have difficulty controlling it. We'll give you coping activities that you can use when you feel hurt, annoyed, or disappointed. </div>`}} />} />
                  <FormControlLabel 
                    value="other" 
                    className={styles.with_text_wrap}
                    control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={profileStepAnswer == 'other'} onChange={(event) => setProfileStepAnswer(event.target.value)} />} 
                    label={<div className={styles.radio_option_text_wrap} dangerouslySetInnerHTML={{__html: `Other`}} />} />

                </RadioGroup>

                {
                  profileStepAnswer == 'other' ?
                  <TextField 
                    type="text" 
                    fullWidth={true} 
                    multiline
                    rows={5}
                    placeholder={'Write down your reason, it will help you feel better.'} 
                    value={other} 
                    onChange={e => setOther(e.target.value)} 
                    required
                  /> : ''
                }
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