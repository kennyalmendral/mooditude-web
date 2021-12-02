import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Assessment.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { Line } from 'react-chartjs-3'

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()
import GridLoader from "react-spinners/GridLoader"

export default function AssessmentWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [currentRiskScore, setCurrentRiskScore] = useState(0)
  const [currentAssessmentDate, setCurrentAssessmentDate] = useState(null)

  const [currentChartData, setCurrentChartData] = useState(null)

  const [currentFullReportLink, setCurrentFullReportLink] = useState('')

  const [hasNoAssessment, setHasNoAssessment] = useState(true)
  const [checking, setChecking] = useState(true)
  
  const [currentAllRiskLevel, setCurrentAllRiskLevel] = useState('none')

  const [assessments, setAssessments] = useState([])

  useEffect(() => {
    if (Object.keys(assessments).length > 0) {
      setHasNoAssessment(false)

      assessments[0] && setCurrentRiskScore(assessments[0].allScore)

      assessments[0] && setCurrentAssessmentDate(new Date(assessments[0].createDate.seconds * 1000).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }))

      assessments[0] && setCurrentAllRiskLevel(assessments[0].allRiskLevel)

      assessments[0] && setCurrentChartData({
        labels: [
          new Date(assessments[0].createDate.seconds * 1000).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
        ],
        datasets: [
          {
            label: 'Depression',
            data: [parseInt(assessments[0].depressionScore)],
            backgroundColor: '#6FCF97',
            type: 'bar'
          },
          {
            label: 'Anxiety',
            data: [parseInt(assessments[0].anxietyScore)],
            backgroundColor: '#D68AFA',
            type: 'bar'
          },
          {
            label: 'PTSD',
            data: [parseInt(assessments[0].ptsdScore)],
            backgroundColor: '#56CCF2',
            type: 'bar'
          },
          {
            label: 'Bipolar',
            data: [parseInt(assessments[0].bipolarScore)],
            backgroundColor: '#DC957E',
            type: 'bar'
          },
          {
            label: 'Overall Score',
            data: [parseInt(assessments[0].overallScore)],
            backgroundColor: '#2968EA',
            type: 'line'
          }
        ]
      })
      
      assessments[0] && setCurrentFullReportLink(`/assessment/report/${authUser.uid}/${assessments[0].id}`)
    } else {
      setHasNoAssessment(true)
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
    setChecking(true)
    firebaseAuth.onAuthStateChanged(user => {
      
      if (user) {
        usersM3AssessmentScoresRef = firebaseStore
          .collection('M3Assessment')
          .doc(user.uid)
          .collection('scores')

        unsubscribe = usersM3AssessmentScoresRef
          .onSnapshot(querySnapshot => {
            if (!querySnapshot.empty) {
              querySnapshot.forEach(doc => {
                if (doc) {
                  let docData = doc.data()
  
                  const updateUserM3AssessmentScores = firebaseFunctions.httpsCallable('updateUserM3AssessmentScores')
                
                  updateUserM3AssessmentScores({
                    userId: user.uid,
                    epochId: docData.id,
                    rawData: docData.rawData,
                  }).then(result => {
                    let mergedData = {
                      ...docData,
                      ...result.data
                    }
                    setChecking(false)
                    setAssessments(assessments => [...assessments, mergedData])
  
                  })
                } else {
                  setChecking(false)
                }
              })
            } else {
              setChecking(false)
            }
          })
      } else {
        setChecking(false)
        unsubscribe && unsubscribe()
      }
    })

    // setChecking(false)
  }, [])

  const handleTakeAssessment = () => {
    if (authUser) {
      localStorage.removeItem(`${authUser.uid}_assessmentStep1Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep2Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep3Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep4Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep5Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep6Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep7Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep8Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep9Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep10Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep11Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep12Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep13Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep14Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep15Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep16Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep17Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep18Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep19Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep20Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep21Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep23Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep24Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep25Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep26Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep28Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep29Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep30Answer`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep31Answer`)

      localStorage.removeItem(`${authUser.uid}_assessmentStep1Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep2Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep3Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep4Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep5Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep6Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep7Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep8Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep9Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep10Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep11Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep12Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep13Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep14Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep15Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep16Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep17Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep18Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep19Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep20Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep21Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep23Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep24Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep25Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep26Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep28Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep29Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep30Time`)
      localStorage.removeItem(`${authUser.uid}_assessmentStep31Time`)

      localStorage.setItem(`${authUser.uid}_currentAssessmentStep`, 0)
      localStorage.setItem(`${authUser.uid}_onboardingStep`, 1)

      router.push('/onboarding/get-started')
    }
  }

  const handleStart = () => {
    localStorage.getItem(`${authUser.uid}_currentAssessmentStep`) === null && localStorage.setItem(`${authUser.uid}_currentAssessmentStep`, 0) 

    router.push(`/assessment/1`)
  }

  const handleClickAssessment = (riskScore, assessmentDate, riskLevel, chartData, fullReportLink) => {
    console.log(riskScore, assessmentDate, riskLevel, chartData, fullReportLink)

    setCurrentRiskScore(riskScore)
    setCurrentAssessmentDate(assessmentDate)
    setCurrentAllRiskLevel(riskLevel)
    setCurrentChartData(chartData)
    setCurrentFullReportLink(fullReportLink)
  }

  return (
    <Layout title={`Assessments | ${SITE_NAME}`}>
      {
        checking ? 

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
            <GridLoader color={'#1CA566'} loading={true} size={10} />
          </div>
        : 
        <div className={`${styles.onboarding_wrapper} ${styles.with_gray}`}>
          <div className={`${styles.assessment_wrap} ${styles.dashboard_page}`}>
            <div className={styles.dashboard_left}>
             <h1>Your Mental<br/> Wellbeing Score</h1>

             {
              hasNoAssessment == true ? 
                <div className={styles.dashboard_expired}>
                  <div className={styles.dashboard_expired_img}><img src="/premium.svg" /></div>
                  <h3>Assess Your <br/>Mental Wellbeing<br/> Score</h3>

                  {/* <p>Your wellbeing score is outdated.</p> */}

                  <Button 
                    size="large" 
                    className={styles.take_assessment_btn} 
                    variant="contained" 
                    onClick={handleTakeAssessment}
                  >
                    TAKE ASSESSMENT
                  </Button>
                </div>
              : 
              <>
                <p className={styles.date_text}>{currentAssessmentDate}</p> 

                {(currentRiskScore > -1) && (
                  <>
                    <div className={styles.rating_wrap}>
                      <div className={styles.rating_outer_wrap}>
                        <div className={styles.rating_inner_wrap}>
                          {currentRiskScore}
                        </div> 
                      </div> 
                    </div>

                    {currentAllRiskLevel == 'unlikely' && (
                      <>
                        <h2>Unlikely Risk</h2>
                        <p>Score of {currentRiskScore} shows that it is unlikely you are suffering from a mental health condition at this time.</p>
                      </>
                    )}

                    {currentAllRiskLevel == 'low' && (
                      <>
                        <h2>Low Risk</h2>
                        <p>Score of {currentRiskScore} suggests that you have a low risk of a mental health condition.</p>
                      </>
                    )}

                    {currentAllRiskLevel == 'medium' && (
                      <>
                        <h2>Medium Risk</h2>
                        <p>Score of {currentRiskScore} suggests that you have a medium risk of a mental health condition.</p>
                      </>
                    )}

                    {currentAllRiskLevel == 'high' && (
                      <>
                        <h2>High Risk</h2>
                        <p>Score of {currentRiskScore} suggests that you have a high risk of a mental health condition.</p>
                      </>
                    )}
                
                    {/* <div className={styles.scale_img_wrap}>
                      <img src="/scale.svg" />
                    </div> */}
                  </>
                )}

                <Button 
                  size="large" 
                  className={styles.full_report_btn} 
                  variant="contained" 
                  onClick={() => router.push(currentFullReportLink)}
                >
                  FULL REPORT
                </Button>
              </>
             }
              
            </div>
            <div className={styles.dashboard_right}>
              {hasNoAssessment == true && (
                 <div style={{ marginBottom: '40px' }}>
                  <img src="/graph.svg" />
                </div>
              )}

              {hasNoAssessment == false && (
                <div style={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: '10px',
                  padding: '20px',
                }}>
                  {currentChartData && (
                    <Line 
                      data={currentChartData}
                      options={{
                        responsive: true,
                        scales: {
                          xAxes: [{
                            offset: true
                          }],
                          yAxes: [{
                            ticks: {
                              min: 0,
                              max: 100,
                              callback: function(value) {
                                return value + '%'
                              }
                            }
                          }]
                        },
                        tooltips: {
                          callbacks: {
                            label: function(tooltipItem, data) {
                              var index = tooltipItem.index;
                              var currentValue = data.datasets[tooltipItem.datasetIndex].data[index];
                              var total = 0;
                              data.datasets.forEach(function(el){
                                total = total + el.data[index];
                              });
                              var percentage = parseFloat((currentValue/total*100).toFixed(1));
                              return currentValue + ' (' + percentage + '%)';
                            },
                            title: function(tooltipItem, data) {
                              return data.datasets[tooltipItem[0].datasetIndex].label;
                            }                        
                          }
                        }
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {Object.keys(assessments).length > 0 && (
            <div className={styles.assessment_list_wrap}>
              <h3>All Assessments</h3>

              <div className={styles.assessment_list_inner_wrap}>
                {assessments.length > 0 && (
                  <>
                    {assessments.map(assessment => (
                      <div 
                        className={`${styles.assessment_item} 
                        `} 
                        style={{ 
                          width: '100%', 
                          alignItems: 'center', 
                        }} 
                        key={assessment.id} 
                        onClick={() => handleClickAssessment(
                          assessment.allScore, 
                          new Date(assessment.createDate.seconds * 1000).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }),
                          assessment.allRiskLevel,
                          {
                            labels: [
                              new Date(assessment.createDate.seconds * 1000).toLocaleString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              }),
                            ],
                            datasets: [
                              {
                                label: 'Depression',
                                data: [parseInt(assessment.depressionScore)],
                                backgroundColor: '#6FCF97',
                                type: 'bar'
                              },
                              {
                                label: 'Anxiety',
                                data: [parseInt(assessment.anxietyScore)],
                                backgroundColor: '#D68AFA',
                                type: 'bar'
                              },
                              {
                                label: 'PTSD',
                                data: [parseInt(assessment.ptsdScore)],
                                backgroundColor: '#56CCF2',
                                type: 'bar'
                              },
                              {
                                label: 'Bipolar',
                                data: [parseInt(assessment.bipolarScore)],
                                backgroundColor: '#DC957E',
                                type: 'bar'
                              },
                              {
                                label: 'Overall Score',
                                data: [parseInt(assessment.overallScore)],
                                backgroundColor: '#2968EA',
                                type: 'line'
                              }
                            ]
                          },
                          `/assessment/report/${authUser.uid}/${assessment.id}`
                        )}
                      >
                        <div className={styles.ai_score}>
                          <div className={`${styles.rating_wrap} ${styles.rating_wrap_small}`}>
                            {assessment.allScore}
                          </div>
                        </div>
        
                        <div className={styles.ai_details} style={{ textAlign: 'left' }}>
                          
                          <h4>{assessment.allRiskLevel.charAt(0).toUpperCase() + assessment.allRiskLevel.slice(1)} Risk</h4>

                          <p>{new Date(assessment.createDate.seconds * 1000).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}</p>
                        </div>
                        
                        
                        <div 
                          className={styles.ai_action} 
                          onClick={() => router.push(`/assessment/report/${authUser.uid}/${assessment.id}`)}
                          style={{
                            cursor: 'pointer'
                          }}
                        >
                          <ArrowForwardIcon />
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {/* <div className={styles.assessment_item}>
                  <div className={styles.ai_score}>
                    <div className={`${styles.rating_wrap} ${styles.rating_wrap_small}`}>
                      {currentRiskScore}  
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
                      {currentRiskScore}  
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
          )}
        </div>
      }
      
    </Layout>
  )
}