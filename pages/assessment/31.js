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

import GridLoader from "react-spinners/GridLoader"
import RingLoader from "react-spinners/RingLoader"

import { format, startOfDay } from 'date-fns'

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

export default function Assessment31(props) {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28 ,29]

  const [assessmentStep31Answer, setAssessmentStep31Answer] = useState('')
  const [formError, setFormError] = useState(false)
  const [showLoader, setshowLoader] = useState(false)

  const [assessmentStep31Time, setAssessmentStep31Time] = useState(0)
  const [timer, setTimer] = useState(null)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    } else {
      if (authUser && localStorage.getItem(`${authUser.uid}_assessmentStep31Answer`) !== null) {
        setAssessmentStep31Answer(localStorage.getItem(`${authUser.uid}_assessmentStep31Answer`))
      }
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser && localStorage.getItem(`${authUser.uid}_currentAssessmentStep`) !== null) {
      localStorage.setItem(`${authUser.uid}_currentAssessmentStep`, 31)

      // console.log(`Current assessment step: ${localStorage.getItem(`${authUser.uid}_currentAssessmentStep`)}`)
    }

    if (authUser && localStorage.getItem(`${authUser.uid}_assessmentStep31Answer`) > 0) {
      setAssessmentStep31Answer(localStorage.getItem(`${authUser.uid}_assessmentStep31Answer`))
    }

    setTimer(setInterval(() => {
      // console.log(`Time to answer: ${assessmentStep31Time}`)
      setAssessmentStep31Time(assessmentStep31Time++)
    }, 1000))
  }, [])

  useEffect(() => {
    assessmentStep31Answer > 0 && console.log(`Assessment step 31 answer: ${assessmentStep31Answer}`)
  }, [assessmentStep31Answer])

  const handleChange = (e) => {
    clearInterval(timer)
    localStorage.setItem(`${authUser.uid}_assessmentStep31Answer`, e.target.value)
    localStorage.setItem(`${authUser.uid}_assessmentStep31Time`, assessmentStep31Time)
    setAssessmentStep31Answer(e.target.value)

    if (authUser) {
      let assessmentAnswers = [
        localStorage.getItem(`${authUser.uid}_assessmentStep1Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep2Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep3Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep4Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep5Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep6Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep7Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep8Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep9Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep10Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep11Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep12Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep13Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep14Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep15Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep16Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep17Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep18Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep19Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep20Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep21Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep23Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep24Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep25Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep26Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep28Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep29Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep30Answer`),
        localStorage.getItem(`${authUser.uid}_assessmentStep31Answer`)
      ]
  
      let assessmentTimes = [
        localStorage.getItem(`${authUser.uid}_assessmentStep1Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep2Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep3Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep4Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep5Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep6Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep7Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep8Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep9Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep10Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep11Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep12Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep13Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep14Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep15Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep16Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep17Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep18Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep19Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep20Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep21Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep23Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep24Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep25Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep26Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep28Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep29Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep30Time`),
        localStorage.getItem(`${authUser.uid}_assessmentStep31Time`)
      ]

      let usersM3AssessmentScoresRef

      // const d = new Date()
      // const year = d.getUTCFullYear()
      // const month = d.getUTCMonth()
      // const day = d.getUTCDate()
      // const startTime = Date.UTC(year, month, day, 0, 0, 0, 0)

      // let epochMilliseconds = startTime.toString()

      let epochMilliseconds = new Date(startOfDay(new Date().getTime())).getTime().toString()

      let isNewCollection = false

      setshowLoader(true)
      
      usersM3AssessmentScoresRef = firebaseStore
        .collection('M3Assessment')
        .doc(authUser.uid)
        .collection('scores')

      usersM3AssessmentScoresRef
        .get()
        .then(doc => {
          if (doc.docs.length > 0) {
            for (let el of doc.docs) {
              if (el.data().id.toString() != epochMilliseconds) {
                isNewCollection = true
                break
              }
            }
          } else {
            isNewCollection = true
          }

          if (isNewCollection) {
            usersM3AssessmentScoresRef
              .doc(epochMilliseconds)
              .set({
                id: epochMilliseconds,
                createDate: new Date(),
                rawData: assessmentAnswers.join(','),
                rawTimeToAnswer: assessmentTimes.join(','),
                allScore: 0,
                bipolarScore: 0,
                depressionScore: 0,
                gadScore: 0,
                gatewayScore: 0,
                ocdScore: 0,
                panicScore: 0,
                socialAnxietyScore: 0,
                ptsdScore: 0,
                pdfDoc: null,
              }).then(() => {
                const updateUserM3AssessmentScores = firebaseFunctions.httpsCallable('updateUserM3AssessmentScores')
  
                updateUserM3AssessmentScores({
                  userId: authUser.uid,
                  epochId: epochMilliseconds,
                  rawData: assessmentAnswers.join(','),
                }).then(result => {
                  // console.log('updateUserM3AssessmentScores', result.data)

                  firebaseDatabase
                    .ref()
                    .child('users')
                    .child(authUser.uid)
                    .update({
                      onboardingStep: 'onboardingCompleted'
                    })
                    .then(() => {
                      const applyReportCredit = firebaseFunctions.httpsCallable('applyReportCredit')
  
                      applyReportCredit({
                        user: authUser.uid,
                        score: epochMilliseconds,
                      }).then(result => {
                        console.log(result)
                        router.push(`/assessment/report?user=${authUser.uid}&score=${epochMilliseconds}`)
                      })
                    })
                })
              })
          } else {
            const updateUserM3AssessmentScores = firebaseFunctions.httpsCallable('updateUserM3AssessmentScores')
  
            updateUserM3AssessmentScores({
              userId: authUser.uid,
              epochId: epochMilliseconds,
              rawData: assessmentAnswers.join(','),
            }).then(result => {
              // console.log('updateUserM3AssessmentScores', result.data)

              firebaseDatabase
                .ref()
                .child('users')
                .child(authUser.uid)
                .update({
                  onboardingStep: 'onboardingCompleted'
                })

              router.push(`/assessment/report?user=${authUser.uid}&score=${epochMilliseconds}`)
            })
          }
        })
    }
  }

  const handleNextStep = () => {
    setFormError(false)

    if (assessmentStep31Answer !== '') {
      localStorage.setItem(`${authUser.uid}_assessmentStep31Answer`, parseInt(assessmentStep31Answer))

      if (authUser) {
        let assessmentAnswers = [
          localStorage.getItem(`${authUser.uid}_assessmentStep1Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep2Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep3Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep4Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep5Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep6Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep7Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep8Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep9Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep10Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep11Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep12Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep13Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep14Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep15Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep16Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep17Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep18Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep19Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep20Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep21Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep23Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep24Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep25Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep26Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep28Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep29Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep30Answer`),
          localStorage.getItem(`${authUser.uid}_assessmentStep31Answer`)
        ]
    
        let assessmentTimes = [
          localStorage.getItem(`${authUser.uid}_assessmentStep1Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep2Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep3Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep4Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep5Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep6Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep7Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep8Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep9Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep10Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep11Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep12Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep13Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep14Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep15Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep16Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep17Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep18Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep19Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep20Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep21Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep23Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep24Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep25Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep26Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep28Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep29Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep30Time`),
          localStorage.getItem(`${authUser.uid}_assessmentStep31Time`)
        ]
  
        let usersM3AssessmentScoresRef
  
        const d = new Date()
        const year = d.getUTCFullYear()
        const month = d.getUTCMonth()
        const day = d.getUTCDate()
        const startTime = Date.UTC(year, month, day, 0, 0, 0, 0)
  
        let epochMilliseconds = startTime.toString()
  
        let isNewCollection = false

        setshowLoader(true)

        usersM3AssessmentScoresRef = firebaseStore
          .collection('M3Assessment')
          .doc(authUser.uid)
          .collection('scores')
  
        usersM3AssessmentScoresRef
          .get()
          .then(doc => {
            if (doc.docs.length > 0) {
              for (let el of doc.docs) {
                if (el.data().id.toString() != epochMilliseconds) {
                  isNewCollection = true
                  break
                }
              }
            } else {
              isNewCollection = true
            }
  
            if (isNewCollection) {
              usersM3AssessmentScoresRef
                .doc(epochMilliseconds)
                .set({
                  id: epochMilliseconds,
                  createDate: new Date(),
                  rawData: assessmentAnswers.join(','),
                  rawTimeToAnswer: assessmentTimes.join(','),
                  allScore: 0,
                  bipolarScore: 0,
                  depressionScore: 0,
                  gadScore: 0,
                  gatewayScore: 0,
                  ocdScore: 0,
                  panicScore: 0,
                  socialAnxietyScore: 0,
                  ptsdScore: 0,
                  pdfDoc: null,
                  purchasedDate: null
                }).then(() => {
                  const updateUserM3AssessmentScores = firebaseFunctions.httpsCallable('updateUserM3AssessmentScores')
    
                  updateUserM3AssessmentScores({
                    userId: authUser.uid,
                    epochId: epochMilliseconds,
                    rawData: assessmentAnswers.join(','),
                  }).then(result => {
                    // console.log('updateUserM3AssessmentScores', result.data)

                    firebaseDatabase
                      .ref()
                      .child('users')
                      .child(authUser.uid)
                      .update({
                        onboardingStep: 'onboardingCompleted'
                      })

                    router.push(`/assessment/report/${authUser.uid}/${epochMilliseconds}`)
                  })
                })
            } else {
              const updateUserM3AssessmentScores = firebaseFunctions.httpsCallable('updateUserM3AssessmentScores')
    
              updateUserM3AssessmentScores({
                userId: authUser.uid,
                epochId: epochMilliseconds,
                rawData: assessmentAnswers.join(','),
              }).then(result => {
                // console.log('updateUserM3AssessmentScores', result.data)

                firebaseDatabase
                  .ref()
                  .child('users')
                  .child(authUser.uid)
                  .update({
                    onboardingStep: 'onboardingCompleted'
                  })

                router.push(`/assessment/report/${authUser.uid}/${epochMilliseconds}`)
              })
            }
          })
      }
    } else {
      setFormError(true)
    }
  }

  return (
    <Layout title={`Question 29 | ${SITE_NAME}`}>
      
        {
          showLoader ? 
            <div 
              className={styles.custom_loader} 
              style={{
                position: 'absolute',
                width: '100%',
                height: '100vh',
                background: '#fff',
                zIndex: 10
              }}
            >
              {/*<GridLoader color={'#1CA566'} loading={true} size={10} />*/}
              <RingLoader color={'#f8e71c'} loading={true} size={250} />
              
              <p>Analyzing your responses...</p>
            </div>
          : 
          <div className={`${styles.onboarding_wrapper} ${styles.on_assessment_wrapper}`}>
            <div className={styles.onboarding_inner_wrapper}>
              <div className={`${styles.line_header_wrap} ${styles.assessment_step29}`}>
                <p className={styles.step_text}>Question 29 of 29</p>
                <h2 className={styles.wellBeingText}>Assess Your Wellbeing Score</h2>
              </div>
              
                <div className={styles.fadeInDown500}>
                  <p className={styles.top_sub_title}>Have you noticed whether any of the symptoms you described...</p>
                  <h1 className={`mt_0`}>has led to you using drugs?</h1>  
                </div>
              
              
              <div className={`${styles.form_wrap} ${styles.fadeInDown400}`}>
                
                <FormControl component="fieldset" error={formError} onChange={() => {setFormError(false)}}>
                  
                  <RadioGroup>
                    <FormControlLabel value="0" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep31Answer == '0'} onChange={handleChange} />} label="Not at all" />
                    <FormControlLabel value="1" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep31Answer == '1'} onChange={handleChange} />} label="Rarely" />
                    <FormControlLabel value="2" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep31Answer == '2'} onChange={handleChange} />} label="Sometimes" />
                    <FormControlLabel value="3" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep31Answer == '3'} onChange={handleChange} />} label="Often" />
                    <FormControlLabel value="4" control={<Radio icon={<RadioButtonUncheckedRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{'&.Mui-checked': {color: '#F8E71C'}}} checked={assessmentStep31Answer == '4'} onChange={handleChange} />} label="Most of the time" />
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
                    onClick={() => router.push('/assessment/30')}
                  >
                    Back
                  </Button>

                  <Button 
                    size="large" 
                    className={styles.onboarding_btn} 
                    variant="contained" 
                    onClick={handleNextStep} 
                    disabled={assessmentStep31Answer == '' || parseInt(assessmentStep31Answer) > 4 ? true : false} 
                  >
                    Next
                  </Button>
                </Stack>
              </div>
            </div>
          </div>
        } 
        
      
    </Layout>
  )
}