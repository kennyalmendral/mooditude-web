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

import { Line } from 'react-chartjs-3'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

export default function AssessmentWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [riskScore, setRiskScore] = useState(0)
  const [assessmentDate, setAssessmentDate] = useState(null)

  const [chartData, setChartData] = useState(null)

  // const [dummy, setDummy] = useState('expired')
  const [dummy, setDummy] = useState('')
  const [allRiskLevel, setAllRiskLevel] = useState('none')

  const [assessments, setAssessments] = useState([])

  useEffect(() => {
    if (assessments.length > 0) {
      firebaseAuth.onAuthStateChanged(user => {
        if (user) {
          const updateUserM3AssessmentScores = firebaseFunctions.httpsCallable('updateUserM3AssessmentScores')

          assessments.forEach(value => {
            updateUserM3AssessmentScores({
              userId: user.uid,
              epochId: value.id,
              rawData: value.rawData,
            }).then(result => {
              console.log(result.data)

              setRiskScore(result.data.allScore)
              setAllRiskLevel(result.data.allRiskLevel)

              setAssessmentDate(new Date(value.createDate.seconds * 1000).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }))

              const data = {
                labels: [
                  new Date(value.createDate.seconds * 1000).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }),
                ],
                datasets: [
                  {
                    label: 'Depression',
                    data: [parseInt(result.data.depressionScore)],
                    backgroundColor: '#6FCF97',
                    type: 'bar'
                  },
                  {
                    label: 'Anxiety',
                    data: [parseInt(result.data.anxietyScore)],
                    backgroundColor: '#D68AFA',
                    type: 'bar'
                  },
                  {
                    label: 'PTSD',
                    data: [parseInt(result.data.ptsdScore)],
                    backgroundColor: '#56CCF2',
                    type: 'bar'
                  },
                  {
                    label: 'Bipolar',
                    data: [parseInt(result.data.bipolarScore)],
                    backgroundColor: '#DC957E',
                    type: 'bar'
                  },
                  {
                    label: 'Overall Score',
                    data: [parseInt(result.data.overallScore)],
                    backgroundColor: '#2968EA',
                    type: 'bar'
                  },
                ]
              }

              setChartData(data)
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
        usersM3AssessmentScoresRef = firebaseStore
          .collection('M3Assessment')
          .doc(user.uid)
          .collection('scores')

        unsubscribe = usersM3AssessmentScoresRef
          .onSnapshot(querySnapshot => {
            querySnapshot.forEach(doc => {
              if (doc) {
                let docData = doc.data()
                setAssessments(assessments => [...assessments, docData])
              }
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

  const handleClickAssessment = () => {
    console.log('handleClickAssessment')
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
                  onClick={() => router.push('/onboarding/get-started')}
                >
                  TAKE ASSESSMENT
                </Button>
              </div>
            : 
            <>
              <p className={styles.date_text}>{assessmentDate}</p> 

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
                onClick={() => location.href = '/assessment/report'}
              >
                FULL REPORT
              </Button>
            </>
           }
            
          </div>
          <div className={styles.dashboard_right}>
            {/* <div>
              <img src="/graph.svg" />
            </div> */}
            <div style={{
              backgroundColor: '#F3F4F6',
              borderRadius: '10px',
              padding: '20px'
            }}>
              {chartData && (
                <Line 
                  data={chartData}
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
          </div>
        </div>

        <div className={styles.assessment_list_wrap}>
          <h3>All Assessments</h3>

          <div className={styles.assessment_list_inner_wrap}>
            {assessments.length > 0 && (
              <>
                {assessments.map(assessment => (
                  <div 
                    className={`${styles.assessment_item} 
                    ${styles.active}`} 
                    style={{ 
                      width: '100%', 
                      alignItems: 'center', 
                    }} 
                    key={assessment.id} 
                    onClick={handleClickAssessment}
                  >
                    <div className={styles.ai_score}>
                      <div className={`${styles.rating_wrap} ${styles.rating_wrap_small}`}>
                        {assessment.allScore}
                      </div>
                    </div>
    
                    <div className={styles.ai_details} style={{ textAlign: 'left' }}>
                      
                      <h4>{allRiskLevel.charAt(0).toUpperCase() + allRiskLevel.slice(1)} Risk</h4>

                      <p>{new Date(assessment.createDate.seconds * 1000).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</p>
                    </div>
                    
                    
                    <div 
                      className={styles.ai_action} 
                      onClick={() => location.href = '/assessment/report'}
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