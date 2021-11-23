import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Assessment.module.css'
import onboardingStyles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import RingLoader from "react-spinners/RingLoader"

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [assessmentScores, setAssessmentScores] = useState({})
  const [riskScore, setRiskScore] = useState(0)
  const [assessmentDate, setAssessmentDate] = useState(null)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (Object.keys(assessmentScores).length > 0) {
      console.log('assessmentScores', assessmentScores)

      const updateUserM3AssessmentScores = firebaseFunctions.httpsCallable('updateUserM3AssessmentScores')

      updateUserM3AssessmentScores({
        userId: authUser.uid,
        epochId: assessmentScores.id,
        rawData: assessmentScores.rawData,
      }).then(result => {
        console.log('updateUserM3AssessmentScores', result.data)

        setRiskScore(result.data.allScore)

        setAssessmentDate(new Date(assessmentScores.createDate.seconds * 1000).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }))
      })
    }
  }, [assessmentScores])

  useEffect(() => {
    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        firebaseDatabase
          .ref()
          .child('users')
          .child(user.uid)
          .update({
            onboardingStep: 2
          })
      }
    })

    let usersM3AssessmentScoresRef
    let unsubscribe

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        usersM3AssessmentScoresRef = firebaseStore
          .collection('M3Assessment')
          .doc(user.uid)
          .collection('scores')

        unsubscribe = usersM3AssessmentScoresRef
          .get()
          .then(doc => {
            setAssessmentScores(doc.docs[0].data())
          })
      } else {
        unsubscribe && unsubscribe()
      }
    })
  }, [])

  return (
    <Layout title={`Get Started | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper}`} style={{ position: 'relative' }}>
        {riskScore === 0 && (
          <div 
            className={onboardingStyles.custom_loader} 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100vh',
              background: '#fff',
              zIndex: 10
            }}
          >
            <RingLoader color={'#f8e71c'} loading={true} size={250} />
            
            <p>Analyzing your responses...</p>
          </div>
        )}

        <div className={`${styles.assessment_wrap} ${styles.report_page}`}>
          <div className={styles.white_wrap}>
            <h1>Your Mental <br/>Wellbeing Score</h1>

            {assessmentDate && (
              <p className={styles.date_text}>{assessmentDate}</p> 
            )}

            {riskScore > 0 && (
              <>
                <div className={styles.rating_wrap}>
                  <div className={styles.rating_outer_wrap}>
                    <div className={styles.rating_inner_wrap}>
                      {riskScore}
                    </div> 
                  </div> 
                </div>

                {((riskScore >= 0) && (riskScore <= 1)) && (
                  <>
                    <h2>Unlikely Risk</h2>
                    <p>Score of {riskScore} shows that it is unlikely you are suffering from a mental health condition at this time.</p>
                  </>
                )}

                {((riskScore >= 2) && (riskScore <= 32)) && (
                  <>
                    <h2>Low Risk</h2>
                    <p>Score of {riskScore} suggests that you have a low risk of a mental health condition.</p>
                  </>
                )}

                {((riskScore >= 33) && (riskScore <= 50)) && (
                  <>
                    <h2>Medium Risk</h2>
                    <p>Score of {riskScore} suggests that you have a medium risk of a mental health condition.</p>
                  </>
                )}

                {((riskScore >= 51) && (riskScore <= 108)) && (
                  <>
                    <h2>High Risk</h2>
                    <p>Score of {riskScore} suggests that you have a high risk of a mental health condition.</p>
                  </>
                )}
    
                <div className={styles.scale_img_wrap}>
                  <img src="/scale.png" />
                </div>
              </>
            )}
          </div>

          <div className={styles.report_right_wrap}>
            <div className={styles.report_btns_wrapper}>
                <a href="#" className={styles.active} onClick={() => {setContentShow()}}>REPORT</a>

                {/* use for later w functions
                <a href="#" onClick={() => {setContentShow('report_content_paid_scores_wrap')}}>SCORES</a>
                <a href="#" onClick={() => {setContentShow('report_content_download_wrap')}}>DOWNLOAD</a>
                */}
            </div>
            
            <div className={styles.report_content_wrap}>
              <div className={`${styles.report_content_item} ${styles.active}`} key={'report_content_free_wrap'}>
                {riskScore > 0 && (
                  <>
                    <div className={styles.normal_text_wrap}>
                      {((riskScore >= 0) && (riskScore <= 1)) && (
                        <p>Your score is below the level usually found for individuals already known to be suffering from a mood or anxiety disorder. Despite this low score, it is still important to refer to the information and recommendations below concerning your risk for each of the four conditions described.</p>
                      )}

                      {((riskScore >= 2) && (riskScore <= 32)) && (
                        <>
                          <p>Your score is in the lower range as compared to individuals already known to be suffering from a mood or anxiety disorder.</p>

                          <p>Despite this relatively low score, your symptoms may be impacting your life, livelihood, and general well-being. Read closely the information and recommendations below concerning your risk of each of the four conditions described.</p>
                        </>
                      )}

                      {((riskScore >= 33) && (riskScore <= 50)) && (
                        <>
                          <p>Your score is in the mid-range as compared to individuals already known to be suffering from a mood or anxiety disorder.</p>

                          <p>This is a significant finding, as it suggests that your symptoms are probably impacting your life and general well-being. Read carefully the information and recommendations below concerning your risk of each of the four conditions described.</p>
                        </>
                      )}

                      {((riskScore >= 51) && (riskScore <= 108)) && (
                        <>
                          <p>Your score is in the high range as compared to individuals already known to be suffering from a mood or anxiety disorder.</p>

                          <p>This is cause for real concern, as it suggests that your symptoms are impacting your life and general health. Read carefully the information and recommendations below concerning your risk of each of the four conditions described.</p>
                        </>
                      )}
                    </div>

                    <div className={styles.bold_text_wrap}>
                      <h3>Buy Mooditude Premium </h3>

                      <p>Get your complete report that shows your risk for Depression, an Anxiety Disorder, Bipolar Disorder, and Post Traumatic Stress Disorder. And track your symptoms overtime to get a complete picture of your mental health.</p>
                    </div>

                    <Button 
                      size="large" 
                      className={styles.report_btn} 
                      variant="contained"   
                    >
                      BUY MOODITUDE PREMIUM
                    </Button>

                    <div className={styles.download_app_wrap}>
                      <h4>Download</h4>
                      <p>For the full experience download Mooditude’s mobile app and login with your credentials. </p>

                      <div className={styles.app_btns}>
                        <a href="#">
                          <img src="/Apple.png" alt="" />
                        </a>  

                        <a href="#">
                          <img src="/Android.png" alt="" />
                        </a>  
                      </div>
                    </div>
                  </>
                )}
              </div> 

              {/*<div className={styles.report_content_item} key={'report_content_paid_wrap'}>
              </div> 

              <div className={styles.report_content_item} key={'report_content_paid_scores_wrap'}>
              </div> 

              <div className={styles.report_content_item} key={'report_content_download_wrap'}>
              </div> */}
            </div> 
          </div>
        </div>
      </div>
    </Layout>
  )
}