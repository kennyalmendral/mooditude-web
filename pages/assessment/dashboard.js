import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Assessment.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import Firebase from 'lib/Firebase'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

export default function AssessmentWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  const [riskScore, setRiskScore] = useState(76)
  const [dummy, setDummy] = useState('')
  const [allRiskLevel, setAllRiskLevel] = useState('high')

  const [assessments, setAssessments] = useState([])

  useEffect(() => {
    if (assessments.length > 0) {
      firebaseAuth.onAuthStateChanged(user => {
        if (user) {
          const updateUserM3AssessmentScores = firebaseFunctions.httpsCallable('updateUserM3AssessmentScores')

          assessments.forEach(value => {
            updateUserM3AssessmentScores({
              userId: user.uid,
              epochId: parseInt(value.id),
              rawData: value.rawData,
            }).then(result => {
              console.log(result)
            }).catch(error => {
              console.log('error:', error)
            })
          })
        }
      })
    }
  }, [assessments])

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    let usersM3AssessmentScoresRef
    let unsubscribe

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        // usersM3AssessmentScoresRef = firebaseStore
        //   .collection('M3Assessment')
        //   .doc(user.uid)
        //   .collection('scores')

        usersM3AssessmentScoresRef = firebaseStore
          .collection('M3Assessment/DX3aK3upPPUpfItJlfAdSY5cJko1/scores')
        //   .doc(user.uid)
        //   .collection('scores')

        unsubscribe = usersM3AssessmentScoresRef
          .onSnapshot(querySnapshot => {
            querySnapshot.forEach(doc => {
              let docData = doc.data()

              setAssessments(assessments => [...assessments, docData])
            })
          })
      } else {
        unsubscribe && unsubscribe()
      }
    })
  }, [])

  const handleStart = () => {
    localStorage.getItem(`${authUser.uid}_currentAssessmentStep`) === null && localStorage.setItem(`${authUser.uid}_currentAssessmentStep`, 0) 

    router.push(`/assessment/1`)
  }

  return (
    <Layout title={`Assessments | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper} ${styles.with_gray}`}>
        <div className={`${styles.assessment_wrap} ${styles.dashboard_page}`}>
          <div className={styles.dashboard_left}>
            
            
           <h1>Your Mental<br/> Wellbeing Score</h1>

           {
            dummy == 'expired' ? 
              <div className={styles.dashboard_expired}>
                <div className={styles.dashboard_expired_img}><img src="/premium.svg" /></div>
                <h3>Assess Your <br/>Mental Wellbeing<br/> Score</h3>
                <p>Your wellbeing score is outdated. </p>

                <Button 
                  size="large" 
                  className={styles.take_assessment_btn} 
                  variant="contained" 
                  
                >
                  TAKE ASSESSMENT
                </Button>
              </div>
            : 
            <>
              <p className={styles.date_text}>July 12, 2021</p> 
              

              {riskScore > 0 && (
                <>
                  <div className={styles.rating_wrap}>
                    <div className={styles.rating_outer_wrap}>
                      <div className={styles.rating_inner_wrap}>
                        {riskScore}
                      </div> 
                    </div> 
                  </div>

                  {allRiskLevel == 'unlikely' && (
                    <>
                      <h2>Unlikely Risk</h2>
                      <p>Score of {riskScore} shows that it is unlikely you are suffering from a mental health condition at this time.</p>
                    </>
                  )}

                  {allRiskLevel == 'low' && (
                    <>
                      <h2>Low Risk</h2>
                      <p>Score of {riskScore} suggests that you have a low risk of a mental health condition.</p>
                    </>
                  )}

                  {allRiskLevel == 'medium' && (
                    <>
                      <h2>Medium Risk</h2>
                      <p>Score of {riskScore} suggests that you have a medium risk of a mental health condition.</p>
                    </>
                  )}

                  {allRiskLevel == 'high' && (
                    <>
                      <h2>High Risk</h2>
                      <p>Score of {riskScore} suggests that you have a high risk of a mental health condition.</p>
                    </>
                  )}
              
                  <div className={styles.scale_img_wrap}>
                    <img src="/scale.svg" />
                  </div>
                </>
              )}

              <Button 
                size="large" 
                className={styles.full_report_btn} 
                variant="contained" 
                
              >
                FULL REPORT
              </Button>
            </>
           }
            
          </div>
          <div className={styles.dashboard_right}>
            <div>
              <img src="/graph.svg" />
            </div>
            
          </div>
        </div>

        <div className={styles.assessment_list_wrap}>
          <h3>All Assessments</h3>

          <div className={styles.assessment_list_inner_wrap}>
            {assessments.length > 0 && (
              <>
                {assessments.map(assessment => (
                  <div className={`${styles.assessment_item} ${styles.active}`} key={assessment.id}>
                    <div className={styles.ai_score}>
                      <div className={`${styles.rating_wrap} ${styles.rating_wrap_small}`}>
                        {assessment.rawData.split(',').map((value, index) => (
                          <>
                            {((index != 7) || (index != 9)) && (
                              <p>{value += parseInt(value)}</p>
                            )}
                          </>
                        ))}
                      </div>
                    </div>
    
                    <div className={styles.ai_details}>
                      
                      <h4>High Risk</h4>

                      <p>{new Date(assessment.createDate.seconds * 1000).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</p>
                    </div>
    
                    <div className={styles.ai_action}><ArrowForwardIcon /></div>
                  </div>
                ))}
              </>
            )}
            {/* <div className={styles.assessment_item}>
              <div className={styles.ai_score}>
                <div className={`${styles.rating_wrap} ${styles.rating_wrap_small}`}>
                  {riskScore}  
                </div>
              </div>

              <div className={styles.ai_details}>
                <h4>High Risk</h4>
                <p>July 12, 2021</p>
              </div>

              <div className={styles.ai_action}><ArrowForwardIcon /></div>
            </div>
            
            <div className={`${styles.assessment_item} ${styles.active}`}>
              <div className={styles.ai_score}>
                <div className={`${styles.rating_wrap} ${styles.rating_wrap_small}`}>
                  {riskScore}  
                </div>
              </div>

              <div className={styles.ai_details}>
                <h4>High Risk</h4>
                <p>July 12, 2021</p>
              </div>

              <div className={styles.ai_action}><ArrowForwardIcon /></div>
            </div> */}
          </div>
        </div>
      </div>
    </Layout>
  )
}