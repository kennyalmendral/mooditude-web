import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import { format, differenceInWeeks } from 'date-fns'

import Button from '@mui/material/Button'

import Firebase from 'lib/Firebase'

import GridLoader from 'react-spinners/GridLoader'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [name, setName] = useState('')

  const [riskScore, setRiskScore] = useState(0)
  const [riskLevel, setRiskLevel] = useState('')
  const [latestAssessment, setLatestAssessment] = useState({})
  const [latestAssessmentReportUrl, setLatestAssessmentReportUrl] = useState('')

  const [weekDifference, setWeekDifference] = useState(0)
  const [isReportOutdated, setIsReportOutdated] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)

  const [grant, setGrant] = useState({})

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      setIsMobileView(true)
    } else {
      setIsMobileView(false)
    }
  }, [])

  useEffect(() => {
    if (authUser) {
      let assessments = []

      firebaseStore
        .collection('Users')
        .doc(authUser.uid)
        .get()
        .then(doc => {
          doc.data() && setName(doc.data().name)

          firebaseStore
            .collection('Subscribers')
            .doc(authUser.uid)
            .get()
            .then(doc => {
              if (doc && doc.data()) {
                doc.data().grant && setGrant(doc.data().grant)
              }

              firebaseStore
                .collection('M3Assessment')
                .doc(authUser.uid)
                .collection('scores')
                .get()
                .then(querySnapshot => {
                  if ((querySnapshot != null) || (querySnapshot != undefined)) {
                    querySnapshot.forEach(doc => {
                      let assessment = {
                        date: new Date(doc.data().createDate.seconds * 1000),
                        data: doc.data()
                      }
          
                      assessments.push(assessment)
                    })
          
                    assessments.sort((prevDate, nextDate) => nextDate.date - prevDate.date)
          
                    setLatestAssessment(assessments[0])

                    setChecking(false)
                  }
                })
            })
        })
    }
  }, [authUser])

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (latestAssessment) {
      if (Object.keys(latestAssessment).length > 0) {
        if (latestAssessment.data.allScore <= 1) {
          setRiskLevel('unlikely')
        } else if ((latestAssessment.data.allScore >= 2) && (latestAssessment.data.allScore <= 32)) {
          setRiskLevel('low')
        } else if ((latestAssessment.data.allScore >= 33) && (latestAssessment.data.allScore <= 50)) {
          setRiskLevel('medium')
        } else if ((latestAssessment.data.allScore >= 51) && (latestAssessment.data.allScore <= 108)) {
          setRiskLevel('high')
        }
  
        authUser && setLatestAssessmentReportUrl(`/assessment/report/${authUser.uid}/${latestAssessment.data.id}`)
  
        setRiskScore(latestAssessment.data.allScore)
  
        setWeekDifference(differenceInWeeks(new Date(), new Date(latestAssessment.data.createDate.seconds * 1000)))
      }
    }
  }, [authUser, latestAssessment])

  useEffect(() => {
    weekDifference >= 2 && setIsReportOutdated(true)
  }, [weekDifference])

  return (
    <Layout title={`Welcome | ${SITE_NAME}`}>
      {checking && (
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
      )}

      {!checking && (
        <div className={styles.onboarding_wrapper}>
          <div className={`${styles.onboarding_inner_wrapper} ${styles.welcome_page}`}>
            <div className={styles.top_section}>
              {name && (
                <>
                  <h6>HOME</h6>
                  <h1>Greetings, {name}</h1> 
                </> 
              )}
            </div>

            <div className={styles.content}>
              <div className={styles.content_row}>
                {(!isReportOutdated && (latestAssessment != null)) && (
                  <div className={`${styles.content_col} ${styles.score}`}>
                    <Link href={latestAssessmentReportUrl}>
                      <a>
                        <div>
                          <strong>{riskScore}</strong>
                        </div>

                        {riskLevel == 'unlikely' && (
                          <>
                            <h3 style={{ marginBottom: '4px' }}>Unlikely Risk</h3>
                            <p>Score of {riskScore} shows that it is unlikely you are suffering from a mental health condition at this time.</p>
                          </>
                        )}

                        {riskLevel == 'low' && (
                          <>
                            <h3 style={{ marginBottom: '4px' }}>Low Risk</h3>
                            <p>Score of {riskScore} suggests that you have a low risk of a mental health condition.</p>
                          </>
                        )}

                        {riskLevel == 'medium' && (
                          <>
                            <h3 style={{ marginBottom: '4px' }}>Medium Risk</h3>
                            <p>Score of {riskScore} suggests that you have a medium risk of a mental health condition.</p>
                          </>
                        )}

                        {riskLevel == 'high' && (
                          <>
                            <h3 style={{ marginBottom: '4px' }}>High Risk</h3>
                            <p>Score of {riskScore} suggests that you have a high risk of a mental health condition.</p>
                          </>
                        )}

                        <div className={styles.arrow_container}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.172 7L6.808 1.636L8.222 0.222L16 8L8.222 15.778L6.808 14.364L12.172 9H0V7H12.172Z" fill="#1CA566"/>
                          </svg>
                        </div>
                      </a>
                    </Link>
                  </div>
                )}
                
                {router.query.product != null && (
                  <div className={`${styles.content_col} ${styles.retry_buy}`}>
                    <Link href="https://play.google.com/store/apps/details?id=com.health.mental.mooditude">
                      <a target="_blank">
                        <div>
                          <img src="/dollar.svg" />
                        </div>
                        
                        <h3>Retry Buying [Product Title]</h3>

                        <div className={styles.arrow_container}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.172 7L6.808 1.636L8.222 0.222L16 8L8.222 15.778L6.808 14.364L12.172 9H0V7H12.172Z" fill="#1CA566"/>
                          </svg>
                        </div>
                      </a>
                    </Link>
                  </div>
                )}
                
                <div className={`${styles.content_col} ${styles.download}`}>
                  <Link href={isMobileView ? "https://7ubx.app.link/website" : '/download'}>
                    <a target={isMobileView ? '_blank' : '_self'}>
                      <div>
                        <img src="/download.svg" />
                      </div>
                      
                      <h3>Download Mobile App for Full Experience</h3>

                      <div className={styles.arrow_container}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.172 7L6.808 1.636L8.222 0.222L16 8L8.222 15.778L6.808 14.364L12.172 9H0V7H12.172Z" fill="#1CA566"/>
                        </svg>
                      </div>
                    </a>
                  </Link>
                </div>

                <div className={`${styles.content_col} ${styles.stats}`}>
                  <Link href="/assessment">
                    <a>
                      <div>
                        <img src="/stats.svg" />
                      </div>
                      
                      <h3>Assess Your Mental Health Conditions</h3>

                      <div className={styles.arrow_container}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.172 7L6.808 1.636L8.222 0.222L16 8L8.222 15.778L6.808 14.364L12.172 9H0V7H12.172Z" fill="#1CA566"/>
                        </svg>
                      </div>
                    </a>
                  </Link>
                </div>
                
                {(grant.licenseType && (grant.licenseType != 'Premium')) && (
                  <div className={`${styles.content_col} ${styles.buy}`}>
                    <Link href="/buy">
                      <a>
                        <div>
                          <img src="/crown.svg" />
                        </div>
                        
                        <h3>Buy Mooditude Premium</h3>

                        <div className={styles.arrow_container}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.172 7L6.808 1.636L8.222 0.222L16 8L8.222 15.778L6.808 14.364L12.172 9H0V7H12.172Z" fill="#1CA566"/>
                          </svg>
                        </div>
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            {/* <div className={styles.download_app_wrap}>
              <h4>Download</h4>
              <p>For the full experience download Mooditude’s mobile app and login with your credentials. </p>

              <div className={styles.app_btns}>
                <a href="https://apps.apple.com/us/app/mooditude-cbt-therapy/id1450661800" target="_blank">
                  <img src="/Apple.svg" alt="" />
                </a>  

                <a href="https://play.google.com/store/apps/details?id=com.health.mental.mooditude" target="_blank">
                  <img src="/Android.svg" alt="" />
                </a>  
              </div>
            </div> */}
          </div>
        </div>
      )}
    </Layout>
  )
}