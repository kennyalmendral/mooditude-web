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
import Firebase from 'lib/Firebase'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
import TextField from '@mui/material/TextField'

export default function Onboarding7() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(6);
  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7]
  const current_step = 2
  const [reason, setReason] = useState('')

  const [profileStepAnswer, setProfileStepAnswer] = useState(null)
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentProfileStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentProfileStep`, 7)

      console.log(`Current profile step: ${localStorage.getItem(`${authUser.uid}_currentProfileStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_profileStep7Answer`) !== null) {
      setProfileStepAnswer(localStorage.getItem(`${authUser.uid}_profileStep7Answer`))
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_profileStep7AnswerReason`) !== '') {
      setReason(localStorage.getItem(`${authUser.uid}_profileStep7AnswerReason`))
    }
  }, [])

  useEffect(() => {
    profileStepAnswer !== null && console.log(`Profile step 7 answer: ${profileStepAnswer}`)
  }, [profileStepAnswer])

  const handleNextStep = () => {
    setFormError(false)
    if (profileStepAnswer !== null) {
      localStorage.setItem(`${authUser.uid}_profileStep7Answer`, profileStepAnswer)

      if (authUser) {
        firebaseDatabase
          .ref()
          .child('users')
          .child(authUser.uid)
          .update({
            ageGroup: parseInt(localStorage.getItem(`${authUser.uid}_profileStep1Answer`)) || 0,
            gender: parseInt(localStorage.getItem(`${authUser.uid}_profileStep2Answer`)) || 0,
            topGoal: localStorage.getItem(`${authUser.uid}_profileStep3Answer`) || '',
            topChallenges: localStorage.getItem(`${authUser.uid}_profileStep4Answer`) || '',
            goingToTherapy: localStorage.getItem(`${authUser.uid}_profileStep5Answer`) === 'true' || false,
            knowCbt: localStorage.getItem(`${authUser.uid}_profileStep6Answer`) === 'true' || false,
            committedToSelfhelp: (parseInt(localStorage.getItem(`${authUser.uid}_profileStep7Answer`)) > 1) ? true : false,
            committedToSelfHelpScale: parseInt(localStorage.getItem(`${authUser.uid}_profileStep7Answer`)) || null,
            onboardingStep: 'profileCreated'
          })
          .then(() => {
            firebaseDatabase
              .ref()
              .child('userCollection')
              .child('MakePromise')
              .update({
                [authUser.uid]: reason || ''
              })
              .then(() => {
                firebaseDatabase
                  .ref()
                  .child('userCollection')
                  .child('TopGoal')
                  .update({
                    [authUser.uid]: localStorage.getItem(`${authUser.uid}_profileStep3AnswerOtherReason`) || ''
                  })
                  .then(() => {
                    localStorage.removeItem(`${authUser.uid}_profileStep1Answer`)
                    localStorage.removeItem(`${authUser.uid}_profileStep2Answer`)
                    localStorage.removeItem(`${authUser.uid}_profileStep3Answer`)
                    localStorage.removeItem(`${authUser.uid}_profileStep3AnswerOtherReason`)
                    localStorage.removeItem(`${authUser.uid}_profileStep4Answer`)
                    localStorage.removeItem(`${authUser.uid}_profileStep5Answer`)
                    localStorage.removeItem(`${authUser.uid}_profileStep6Answer`)
                    localStorage.removeItem(`${authUser.uid}_profileStep7Answer`)
                    localStorage.removeItem(`${authUser.uid}_profileStep7AnswerReason`)
                    
                    if (localStorage.getItem(`${authUser.uid}_currentProfileStep`) !== null) {
                      localStorage.setItem(`${authUser.uid}_onboardingStep`, 'profileCreated')
                    }
                    // router.push('/onboarding/finish')
                    location.href='/onboarding/finish'
                  })
              })
          })
      }
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Step 7 | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          

          <div className={`${styles.line_header_wrap} ${styles.onboarding_step7}`}>
            <p className={styles.step_text}>Step 7 of 7</p>
            <h2>Personalize Mooditude</h2>
          </div>

          <Grow in={true} timeout={1000}>
            <div>
              <h1>How committed are you to improve your mental health?</h1>  
              {/*<p className={styles.onboarding_sub_title}>You will get the quickest results with consistency. Are you ready to fit in 10 minutes a day for amazing changes in your mental well-being?</p>*/}
            </div>
          </Grow>
          <div className={styles.form_wrap} >
            <Grow in={true} timeout={1000}>
              
              <div className={styles.custom_choices} >
                <div className={`${styles.custom_choice_item} ${profileStepAnswer == '1' ? styles.active : ''}`}
                  onClick={e => {setProfileStepAnswer(1)}}
                >
                  <span>{profileStepAnswer != '1' ? '1' : <CheckRoundedIcon/> }</span>
                </div>

                <div className={`${styles.custom_choice_item} ${profileStepAnswer == '2' ? styles.active : ''}`}
                  onClick={e => {setProfileStepAnswer(2)}}
                >
                  <span>{profileStepAnswer != '2' ? '2' : <CheckRoundedIcon/> }</span>
                </div>

                <div className={`${styles.custom_choice_item} ${profileStepAnswer == '3' ? styles.active : ''}`}
                  onClick={e => {setProfileStepAnswer(3)}}
                >
                  <span>{profileStepAnswer != '3' ? '3' : <CheckRoundedIcon/> }</span>
                </div>

                <div className={`${styles.custom_choice_item} ${profileStepAnswer == '4' ? styles.active : ''}`}
                  onClick={e => {setProfileStepAnswer(4)}}
                >
                  <span>{profileStepAnswer != '4' ? '4' : <CheckRoundedIcon/> }</span>
                </div>

                <div className={`${styles.custom_choice_item} ${profileStepAnswer == '5' ? styles.active : ''}`}
                  onClick={e => {setProfileStepAnswer(5)}}
                >
                  <span>{profileStepAnswer != '5' ? '5' : <CheckRoundedIcon/> }</span>
                </div>

                {
                  profileStepAnswer && profileStepAnswer != 5 ?
                  <TextField 
                    type="text" 
                    fullWidth={true} 
                    multiline
                    rows={5}
                    placeholder={'Why not 5?'} 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    required
                  /> : ''
                }

                {/*<p className={styles.custom_error}>Please choose an answer.</p>*/}


              </div>
             
              </Grow>
          </div>

          <div className={styles.btn_wrap}>
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" 
                color="secondary"
                variant="outlined"
                onClick={() => {router.push(`/onboarding/6`)}}
                // onClick={handlePrevStep}
              >Back</Button>

              <Button 
                size="large" 
                variant="contained"
                disabled={profileStepAnswer == null ? true : false}
                // onClick={() => {router.push(`/onboarding/finish`)}}
                onClick={handleNextStep}
              >Next</Button>
            </Stack>
          </div>
        </div>
      </div>
    </Layout>
  )
}