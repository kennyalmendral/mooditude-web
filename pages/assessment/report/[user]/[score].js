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

import { format, differenceInWeeks } from 'date-fns'

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

import GridLoader from "react-spinners/GridLoader"

export default function AssessmentReport(props) {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [showLoader, setShowLoader] = useState(false)

  const [buyPremium, setBuyPremium] = useState(true)
  const [isReportVisible, setIsReportVisible] = useState(true)
  const [isScoresVisible, setIsScoresVisible] = useState(false)
  const [isDownloadVisible, setIsDownloadVisible] = useState(false)

  const [loadingText, setLoadingText] = useState('Analyzing your responses...')
  
  const [assessmentScores, setAssessmentScores] = useState({})
  const [riskScore, setRiskScore] = useState(0)
  const [allRiskLevel, setAllRiskLevel] = useState('')
  const [depressionRiskScore, setDepressionRiskScore] = useState(0)
  const [depressionRiskLevel, setDepressionRiskLevel] = useState('')
  const [anxietyRiskScore, setAnxietyRiskScore] = useState(0)
  const [anxietyRiskLevel, setAnxietyRiskLevel] = useState('')
  const [ptsdRiskScore, setPtsdRiskScore] = useState(0)
  const [ptsdRiskLevel, setPtsdRiskLevel] = useState('')
  const [bipolarRiskScore, setBipolarRiskScore] = useState(0)
  const [bipolarRiskLevel, setBipolarRiskLevel] = useState('')
  const [hasSuicidalThoughts, setHasSuicidalThoughts] = useState(false)
  const [usedAlcohol, setUsedAlcohol] = useState(false)
  const [usedDrug, setUsedDrug] = useState(false)

  const [thoughtsOfSuicideAnswer, setThoughtsOfSuicideAnswer] = useState(0)
  const [impairsWorkSchoolAnswer, setImpairsWorkSchoolAnswer] = useState(0)
  const [impairsFriendsFamilyAnswer, setImpairsFriendsFamilyAnswer] = useState(0)
  const [ledToUsingAlcoholAnswer, setLedToUsingAlcoholAnswer] = useState(0)
  const [ledToUsingDrugAnswer, setLedToUsingDrugAnswer] = useState(0)

  const [mostOfTheTimeAnswerCount, setMostOfTheTimeAnswerCount] = useState(0)
  const [oftenAnswerCount, setOftenAnswerCount] = useState(0)
  const [sometimesAnswerCount, setSometimesAnswerCount] = useState(0)
  const [rarelyAnswerCount, setRarelyAnswerCount] = useState(0)
  const [noneAnswerCount, setNoneAnswerCount] = useState(0)

  const [mostOfTheTimeAnswerQuestions, setMostOfTheTimeAnswerQuestions] = useState([])
  const [oftenAnswerQuestions, setOftenAnswerQuestions] = useState([])
  const [sometimesAnswerQuestions, setSometimesAnswerQuestions] = useState([])
  const [rarelyAnswerQuestions, setRarelyAnswerQuestions] = useState([])
  const [noneAnswerQuestions, setNoneAnswerQuestions] = useState([])

  const [assessmentDate, setAssessmentDate] = useState(null)
  const [licenseType, setLicenseType] = useState('free')
  const [checking, setChecking] = useState(true)

  const [weekDifference, setWeekDifference] = useState('')
  const [isReportOutdated, setIsReportOutdated] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [reportLink, setReportLink] = useState('')

  const [userProfile, setUserProfile] = useState({})

  const [paymentFailed, setPaymentFailed] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    userProfile && console.log(userProfile)
  }, [userProfile])

  useEffect(() => {
    setWeekDifference(differenceInWeeks(new Date(), new Date(assessmentDate)))
  }, [assessmentDate])
  
  useEffect(() => {
    console.log(`usedDrug: ${usedDrug}`, `usedAlcohol: ${usedAlcohol}`)
  }, [usedDrug, usedAlcohol])

  useEffect(() => {
    if ((allRiskLevel == 'high') && (weekDifference >= 2)) {
      setIsReportOutdated(true)
    } else if ((allRiskLevel == 'medium') && (weekDifference >= 4)) {
      setIsReportOutdated(true)
    } else if ((allRiskLevel == 'low') && (weekDifference >= 8)) {
      setIsReportOutdated(true)
    } else if ((allRiskLevel == 'unlikely') && (weekDifference >= 26)) {
      setIsReportOutdated(true)
    } else {
      setIsReportOutdated(false)
    }
  }, [weekDifference])

  useEffect(() => {
    setMostOfTheTimeAnswerQuestions([])
    setOftenAnswerQuestions([])
    setSometimesAnswerQuestions([])
    setRarelyAnswerQuestions([])
    setNoneAnswerQuestions([])

    if (authUser) {
      let assessmentUserId = router.query.user
      let assessmentScoreId = router.query.score

      firebaseStore
        .collection('Users')
        .doc(authUser.uid)
        .get()
        .then(doc => {
          if (doc.data()) {
            if (doc.data().customerType) {
              setLicenseType(doc.data().customerType)
            }
          }
        })
      
      firebaseDatabase
        .ref()
        .child('users')
        .child(authUser.uid)
        .once('value')
        .then((snapshot) => {
          const snapshotValue = snapshot.val()

          if (snapshotValue != null) {
            setUserProfile(snapshotValue)
          }
        })
        .catch(error => {
          console.log('error', error)
        })

      firebaseStore
        .collection('M3Assessment')
        .doc(assessmentUserId)
        .collection('scores')
        .doc(assessmentScoreId)
        .get()
        .then(doc => {
          let docData = doc.data()
          
          setAssessmentScores(docData)

          const updateUserM3AssessmentScores = firebaseFunctions.httpsCallable('updateUserM3AssessmentScores')
  
          updateUserM3AssessmentScores({
            userId: assessmentUserId,
            epochId: assessmentScoreId,
            rawData: docData.rawData,
          }).then(result => {
            setRiskScore(result.data.allScore)
            setAllRiskLevel(result.data.allRiskLevel)
            setDepressionRiskScore(result.data.depressionScore)
            setDepressionRiskLevel(result.data.depressionRiskLevel)
            setAnxietyRiskScore(result.data.anxietyScore)
            setAnxietyRiskLevel(result.data.anxietyRiskLevel)
            setPtsdRiskScore(result.data.ptsdScore)
            setPtsdRiskLevel(result.data.ptsdRiskLevel)
            setBipolarRiskScore(result.data.bipolarScore)
            setBipolarRiskLevel(result.data.bipolarRiskLevel)
            setHasSuicidalThoughts(result.data.hasSuicidalThoughts)
            setUsedAlcohol(result.data.usedAlcohol)
            setUsedDrug(result.data.usedDrug)
            setThoughtsOfSuicideAnswer(result.data.thoughtsOfSuicideAnswer)
            setImpairsWorkSchoolAnswer(result.data.impairsWorkSchoolAnswer)
            setImpairsFriendsFamilyAnswer(result.data.impairsFriendsFamilyAnswer)
            setLedToUsingAlcoholAnswer(result.data.ledToUsingAlcoholAnswer)
            setLedToUsingDrugAnswer(result.data.ledToUsingDrugAnswer)
            
            if (docData.createDate) {
              setAssessmentDate(new Date(docData.createDate.seconds * 1000).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }))
            }
            setMostOfTheTimeAnswerCount(docData.rawData.split(',').filter(x => x == 4).length)
            setOftenAnswerCount(docData.rawData.split(',').filter(x => x == 3).length)
            setSometimesAnswerCount(docData.rawData.split(',').filter(x => x == 2).length)
            setRarelyAnswerCount(docData.rawData.split(',').filter(x => x == 1).length)
            setNoneAnswerCount(docData.rawData.split(',').filter(x => x == 0).length)

            firebaseDatabase
              .ref()
              .child('users')
              .child(authUser.uid)
              .update({
                assessmentScore: result.data.allScore,
                assessmentDate: docData.createDate.seconds * 1000
              })

            setChecking(false)
          })
        })
    }
  }, [authUser, router])

  useEffect(() => {
    assessmentScores && console.log('Assessment scores: ', assessmentScores)
  }, [assessmentScores])

  useEffect(() => {
    if (mostOfTheTimeAnswerCount > 0) {
      assessmentScores.rawData.split(',').forEach((value, index) => {
        value == 4 && setMostOfTheTimeAnswerQuestions(mostOfTheTimeAnswerQuestions => [...mostOfTheTimeAnswerQuestions, index])
      })
    }
  }, [mostOfTheTimeAnswerCount])

  useEffect(() => {
    if (oftenAnswerCount > 0) {
      assessmentScores.rawData.split(',').forEach((value, index) => {
        value == 3 && setOftenAnswerQuestions(oftenAnswerQuestions => [...oftenAnswerQuestions, index])
      })
    }
  }, [oftenAnswerCount])

  useEffect(() => {
    if (sometimesAnswerCount > 0) {
      assessmentScores.rawData.split(',').forEach((value, index) => {
        value == 2 && setSometimesAnswerQuestions(sometimesAnswerQuestions => [...sometimesAnswerQuestions, index])
      })
    }
  }, [sometimesAnswerCount])

  useEffect(() => {
    if (rarelyAnswerCount > 0) {
      assessmentScores.rawData.split(',').forEach((value, index) => {
        value == 1 && setRarelyAnswerQuestions(rarelyAnswerQuestions => [...rarelyAnswerQuestions, index])
      })
    }
  }, [rarelyAnswerCount])

  useEffect(() => {
    if (noneAnswerCount > 0) {
      assessmentScores.rawData.split(',').forEach((value, index) => {
        value == 0 && setNoneAnswerQuestions(noneAnswerQuestions => [...noneAnswerQuestions, index])
      })
    }
  }, [noneAnswerCount])

  useEffect(() => {
    if (isDownloading) {
      const unloadCallback = (event) => {
        event.preventDefault();
        event.returnValue = "";
        return "";
      };

      window.addEventListener("beforeunload", unloadCallback);
      return () => window.removeEventListener("beforeunload", unloadCallback);
    }
  }, [isDownloading])

  useEffect(() => {
    if (router.query.checkout_cancelled) {
      setPaymentFailed(true)
    } else {
      setPaymentFailed(false)
    }
  }, [router])

  useEffect(() => {
    if (router.query.type == 'subscription') {
      const getStripeSubscription = firebaseFunctions.httpsCallable('getStripeSubscription')
    
      getStripeSubscription({
        session_id: new URLSearchParams(window.location.search).get('session_id')
      }).then(result => {
        let session = result.data.session
        let subscription = result.data.subscription

        console.log(session, subscription)

        if (authUser) {
          firebaseDatabase
            .ref()
            .child('users')
            .child(authUser.uid)
            .update({
              customerType: 'premium',
              expiryDate: subscription.current_period_end * 1000,
              paymentStatus: 'active',
              paymentType: 'stripe'
            })
            .then(() => {
              firebaseStore
                .collection('Users')
                .doc(authUser.uid)
                .update({
                  customerType: 'premium'
                })
                .then(() => {
                  firebaseStore
                    .collection('Subscribers')
                    .doc(authUser.uid)
                    .set({
                      grant: {
                        expiryDate: subscription.current_period_end * 1000,
                        grantType: 'Purchase',
                        licenseType: 'Premium',
                        productType: 'Subscription',
                        transactionDate: subscription.created * 1000,
                        transactionId: subscription.id
                      }
                    })
                    .then(() => {
                      setPaymentSuccess(true)
                      setLicenseType('premium')
                    })
                })
            })
        }
      })
    } else if (router.query.type == 'payment') {
      const getStripePayment = firebaseFunctions.httpsCallable('getStripePayment')
    
      getStripePayment({
        session_id: new URLSearchParams(window.location.search).get('session_id')
      }).then(result => {
        let session = result.data.session
        let paymentIntent = result.data.paymentIntent

        console.log(session, paymentIntent)

        if (authUser) {
          firebaseDatabase
            .ref()
            .child('users')
            .child(authUser.uid)
            .update({
              customerType: 'premium',
              expiryDate: '',
              paymentStatus: 'active',
              paymentType: 'stripe'
            })
            .then(() => {
              firebaseStore
                .collection('Users')
                .doc(authUser.uid)
                .update({
                  customerType: 'premium'
                })
                .then(() => {
                  firebaseStore
                    .collection('M3Assessment')
                    .doc(router.query.user)
                    .collection('scores')
                    .doc(router.query.score)
                    .update({
                      purchasedDate: paymentIntent.created * 1000,
                      stripeInvoiceId: paymentIntent.id
                    })
                    .then(() => {
                      setPaymentSuccess(true)
                      setLicenseType('premium')
                    })
                })
            })
        }
      })
    }
  }, [router, authUser])

  const getQuestion = (index) => {
    switch (index) {
      case 0:
        return "Feel sad/unhappy"
      case 1:
        return "Can't concentrate/focus"
      case 2:
        return "Nothing gives pleasure"
      case 3:
        return "Tired, no energy"
      case 4:
        return "Suicidal thoughts"
      case 5:
        return "Difficulty sleeping"
      case 6:
        return "Sleeping too much"
      case 7:
        return "Decreased appetite"
      case 8:
        return "Increased appetite"
      case 9:
        return "Tense anxious can't sit"
      case 10:
        return "Worried or fearful"
      case 11:
        return "Anxiety/panic attacks"
      case 12:
        return "Worried about dying/losing control"
      case 13:
        return "Nervous in social situations"
      case 14:
        return "Nightmares, flashbacks"
      case 15:
        return "Jumpy, startled easily"
      case 16:
        return "Avoid places"
      case 17:
        return "Dull, numb, or detached"
      case 18:
        return "Can’t get thoughts out"
      case 19:
        return "Must repeat rituals"
      case 20:
        return "Need to check/recheck things"
      case 21:
        return "More energy than usual"
      case 22:
        return "Irritable angry"
      case 23:
        return "Excited revved high"
      case 24:
        return "Needed less sleep"
      case 25:
        return "Interferes with work/school"
      case 26:
        return "Affects friends/family relationships"
      case 27:
        return "Has led to alcohol to get by"
      case 28:
        return "Has led to using drugs"
    }
  }

  const handleDownload = (e) => {
    e.preventDefault()

    setIsDownloading(true)

    if (router) {
      const generatePDFReport = firebaseFunctions.httpsCallable('generatePDFReport')

      generatePDFReport({
        userId: router.query.user,
        scoreId: router.query.score,
        assessmentDate: assessmentDate,
        assessmentScores: assessmentScores,
        userProfile: userProfile,
        allRiskLevel: allRiskLevel,
        depressionRiskLevel: depressionRiskLevel,
        anxietyRiskLevel: anxietyRiskLevel,
        ptsdRiskLevel: ptsdRiskLevel,
        bipolarRiskLevel: bipolarRiskLevel,
        hasSuicidalThoughts: hasSuicidalThoughts,
        usedAlcohol: usedAlcohol,
        usedDrug: usedDrug,
        thoughtsOfSuicideAnswer: thoughtsOfSuicideAnswer,
        impairsWorkSchoolAnswer: impairsWorkSchoolAnswer,
        impairsFriendsFamilyAnswer: impairsFriendsFamilyAnswer,
        ledToUsingAlcoholAnswer: ledToUsingAlcoholAnswer,
        ledToUsingDrugAnswer: ledToUsingDrugAnswer,
        anxietyRiskScore: anxietyRiskScore,
        ptsdRiskScore: ptsdRiskScore,
        bipolarRiskScore, bipolarRiskScore,
        mostOfTheTimeAnswerCount: mostOfTheTimeAnswerCount,
        mostOfTheTimeAnswerQuestions: mostOfTheTimeAnswerQuestions,
        noneAnswerCount: noneAnswerCount,
        noneAnswerQuestions: noneAnswerQuestions,
        oftenAnswerCount: oftenAnswerCount,
        oftenAnswerQuestions: oftenAnswerQuestions,
        sometimesAnswerCount: sometimesAnswerCount,
        sometimesAnswerQuestions: sometimesAnswerQuestions,
        rarelyAnswerCount: rarelyAnswerCount,
        rarelyAnswerQuestions: rarelyAnswerQuestions
      }).then(result => {
        setIsDownloading(false)
        
        if (authUser) {
          firebaseStore
            .collection('M3Assessment')
            .doc(router.query.user)
            .collection('scores')
            .doc(router.query.score)
            .update({
              pdfDoc: result.data.url[0]
            })     
        }
        
        setReportLink(result.data.url[0])
      }).catch(err => {
        setIsDownloading(false)
        
        console.log(err)
      })
    }
  }

  const selectPlan = (plan, duration) => {
    setChecking(true)

    setLoadingText('Please wait...')

    const processStripeSubscriptionOnSignUp = firebaseFunctions.httpsCallable('processStripeSubscriptionOnSignUp')

    processStripeSubscriptionOnSignUp({
      type: plan,
      duration: duration,
      mode: plan == 'subscription' ? 'subscription' : 'payment',
      customerEmail: authUser && authUser.email,
      redirectUrl: window.location.origin + `/assessment/report/${router.query.user}/${router.query.score}`,
      cancelUrl: window.location.origin + `/assessment/report/${router.query.user}/${router.query.score}`
    }).then(result => {
      location.href = result.data.session.url
    })
  }

  return (
    <Layout title={`Assessment Full Report | ${SITE_NAME}`}>
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
            <RingLoader color={'#f8e71c'} loading={true} size={250} />
            
            <p>{loadingText}</p>
          </div>
        : 
          <div className={`${styles.onboarding_wrapper}`} style={{ position: 'relative' }}>
            {showLoader && (
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
            <div className={styles.results_header_wrap}>
              {assessmentDate && (
                <p className={styles.date_text}>{assessmentDate}</p> 
              )}

              <h1>Your Mental Wellbeing Score</h1>
            </div>

            <div className={`${styles.assessment_wrap} ${styles.report_page}`}>
              <div className={styles.white_wrap}>
                {/*<h1>Your Mental <br/>Wellbeing Score</h1>*/}

                {/*{assessmentDate && (
                  <p className={styles.date_text}>{assessmentDate}</p> 
                )}*/}

                {riskScore > -1 && (
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
                        <p className={styles.riskText}>Score of {riskScore} shows that it is unlikely you are suffering from a mental health condition at this time.</p>
                      </>
                    )}

                    {allRiskLevel == 'low' && (
                      <>
                        <h2>Low Risk</h2>
                        <p className={styles.riskText}>Score of {riskScore} suggests that you have a low risk of a mental health condition.</p>
                      </>
                    )}

                    {allRiskLevel == 'medium' && (
                      <>
                        <h2>Medium Risk</h2>
                        <p className={styles.riskText}>Score of {riskScore} suggests that you have a medium risk of a mental health condition.</p>
                      </>
                    )}

                    {allRiskLevel == 'high' && (
                      <>
                        <h2>High Risk</h2>
                        <p className={styles.riskText}>Score of {riskScore} suggests that you have a high risk of a mental health condition.</p>
                      </>
                    )}
        
                    <div className={styles.scale_img_wrap}>
                      <img src="/scale.svg" />
                    </div>
                  </>
                )}
              </div>

              {isReportOutdated && (
                <div className={styles.report_right_wrap}>
                  <div>
                    <img src="/outdated.png" />
                  </div>
                </div>
              )}

              {!isReportOutdated && (
                <div className={styles.report_right_wrap}>
                  <div className={styles.yellow_wrap}>
                    <h4>Your score is valid for 2-weeks</h4>

                    <p>Recommended frequency to test your mental <br/> health conditions:</p>
                    <p>If your risk is:</p>

                    <ul>
                      <li><span>High</span> <span>Test every two week</span></li>
                      <li><span>Medium</span> <span>Test every month</span></li>
                      <li><span>Low</span> <span>Test once every other month</span></li>
                      <li><span>None</span> <span>Test every six months</span></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.results_bottom_wrap}>
              {paymentFailed && (
                <div className={styles.error_alert} style={{ marginBottom: '40px' }}>
                  <span onClick={() => location.href =`/assessment/report/${router.query.user}/${router.query.score}`}><img src="/close.svg" /></span>

                  <h2>Payment didn't go through</h2>
                  <p>Either you cancelled your payment or your card didn't work.</p>
                </div>
              )}

              {paymentSuccess && (
                <div className={styles.success_alert} style={{ marginBottom: '40px' }}>
                  <span onClick={() => location.href =`/assessment/report/${router.query.user}/${router.query.score}`}><img src="/close.svg" /></span>

                  <h2>Thank you for your patronage!</h2>
                  <p>You took the right step in managing your mental health.</p>
                </div>
              )}
              {
                licenseType != 'free' ? 
                  <div className={styles.report_btns_wrapper}>
                      <a
                        href="#" 
                        className={isReportVisible ? styles.active : ''} 
                        onClick={() => {
                          setIsScoresVisible(false)
                          setIsDownloadVisible(false)
                          setIsReportVisible(true)
                        }}>REPORT</a>

                      {((licenseType == 'premium') || (userProfile.customerType == 'premium')) && (
                        <>
                          <a 
                            href="#" 
                            className={isScoresVisible ? styles.active : ''} 
                            onClick={() => {
                              setIsReportVisible(false)
                              setIsDownloadVisible(false)
                              setIsScoresVisible(true)
                            }}
                          >
                            SCORES
                          </a>

                          <a 
                            href="#" 
                            className={isDownloadVisible ? styles.active : ''}
                            onClick={() => {
                              setIsScoresVisible(false)
                              setIsDownloadVisible(true)
                              setIsReportVisible(false)
                            }}>DOWNLOAD</a>
                        </>
                      )}
                  </div>
                : ''
              }
              
              {
                licenseType == 'free' ? 
                <div>
                  <div className={styles.result_pricing_section}>
                    <div className={styles.result_pricing_section_item}>
                      <h4>Full Report</h4>

                      <h3>$14</h3>
                      <p>One-time</p>

                      <Button 
                        size="large" 
                        className={styles.report_btn} 
                        variant="contained" 
                        onClick={() => selectPlan('payment', null)} 
                        style={{
                          marginBottom: '15px',
                          fontSize: '18px',
                          fontWeight: '500',
                          fontFamily: 'Circular STD'
                        }} 
                      >
                        Buy
                      </Button>  
                    </div>  

                    <div className={styles.result_pricing_section_item}>
                      <h4>Unlimited Reports &amp; Mooditude App</h4>

                      <h3>$39</h3>
                      <p>per 3-month</p>

                      <Button 
                        size="large" 
                        className={styles.report_btn} 
                        variant="contained" 
                        onClick={() => selectPlan('subscription', 3)} 
                        style={{
                          marginBottom: '15px',
                          fontSize: '18px',
                          fontWeight: '500',
                          fontFamily: 'Circular STD'
                        }} 
                      >
                        SUBSCRIBE
                      </Button>  
                    </div>  

                    <div className={styles.result_pricing_section_item}>
                      <div className={styles.discount}>Best Value — Save $80</div>

                      <h4>Unlimited Reports &amp; Mooditude App</h4>

                      <h3>$89</h3>
                      <p>per year</p>

                      <Button 
                        size="large" 
                        className={styles.report_btn} 
                        variant="contained" 
                        onClick={() => selectPlan('subscription', null)} 
                        style={{
                          marginBottom: '15px',
                          fontSize: '18px',
                          fontWeight: '500',
                          fontFamily: 'Circular STD'
                        }} 
                      >
                        SUBSCRIBE
                      </Button>  
                    </div>  
                  </div>
                  <div className={styles.pricing_section_text}>
                    <ul>
                      <li>
                        Learn more about Mooditude apps
                        {' '}
                        <Link href="/buy">
                          <a>here</a>
                        </Link>
                        .
                      </li>
                    </ul>
                  </div>
                </div>
                : 
                <div className={styles.report_main_section_wrap}>
                  <div className={styles.report_content_wrap}>
                    {isReportVisible && (
                      <div className={`${styles.report_content_item} ${styles.active}`} key={'report_content_free_wrap'}>
                        {riskScore > -1 && (
                          <>
                            <div className={styles.normal_text_wrap}>
                              <p>Your responses have been analyzed and compared to the responses of other individuals with and without mood and anxiety disorders.</p>

                              {allRiskLevel == 'unlikely' && (
                                <p><strong>Your score is below the level usually found for individuals already known to be suffering from a mood or anxiety disorder.</strong></p>
                              )}

                              {allRiskLevel == 'low' && (
                                <>
                                  <p><strong>Your score is in the lower range as compared to individuals already known to be suffering from a mood or anxiety disorder.</strong></p>

                                  <p><strong>Despite this relatively low score, your symptoms may be impacting your life, livelihood, and general well-being.</strong></p>
                                </>
                              )}

                              {allRiskLevel == 'medium' && (
                                <>
                                  <p><strong>Your score is in the mid-range as compared to individuals already known to be suffering from a mood or anxiety disorder.</strong></p>

                                  <p><strong>This is a significant finding, as it suggests that your symptoms are probably impacting your life and general well-being.</strong></p>
                                </>
                              )}

                              {allRiskLevel == 'high' && (
                                <>
                                  <p><strong>Your score is in the high range as compared to individuals already known to be suffering from a mood or anxiety disorder.</strong></p>

                                  <p><strong>This is cause for real concern, as it suggests that your symptoms are impacting your life and general health.</strong></p>
                                </>
                              )}

                              <p>Read carefully the information and recommendations below concerning your risk of each of the four conditions described.</p>
                            </div>
                            
                            <div className={styles.report_content_crisis_section}>
                              <h4>Your response to a question related to suicidal thoughts raises a red flag.</h4>
                              <h3>Are you in crisis?</h3>
                              <p>Please call National Suicide Prevention Lifeline or proceed <br/>directly to an emergency room.</p>
                            </div>
                              {licenseType == 'free' && (
                                <>
                                  { buyPremium ? 
                                  <div className={styles.bold_text_wrap}
                                    style={{
                                      background: '#F3F4F6',
                                      padding: '22px 18px 32px',
                                      borderRadius: '8px',
                                      marginBottom: '70px',
                                      filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
                                    }}
                                  >
                                    <div>
                                      <img src="/crown.svg" />
                                    </div>

                                    <p style={{ fontSize: '16px', fontWeight: 'normal' }}>Buy Mooditude Premium to get your complete report showing your mental health risks and recommendations to overcome those risks.</p>

                                    <p style={{ fontSize: '16px', fontWeight: 'normal' }}>Your purchase includes:</p>

                                    <ul style={{
                                      fontFamily: 'Circular STD',
                                      fontWeight: 'normal',
                                      color: '#072B4F',
                                      listStyle: 'none',
                                      paddingLeft: '0'
                                    }}>
                                      <li style={{ 
                                        marginBottom: '18px',
                                        position: 'relative',
                                        paddingLeft: '40px'
                                      }}>
                                        <img 
                                          src="/check.svg" 
                                          style={{
                                            position: 'absolute',
                                            top: '0',
                                            left: '0'
                                          }}
                                        />
                                        Unlimited quiz so you can track your progress over time
                                      </li>

                                      <li style={{ 
                                        marginBottom: '18px',
                                        position: 'relative',
                                        paddingLeft: '40px'
                                      }}>
                                        <img 
                                          src="/check.svg" 
                                          style={{
                                            position: 'absolute',
                                            top: '0',
                                            left: '0'
                                          }}
                                        />
                                        Access to 800+ minutes of self-care activities, and
                                      </li>

                                      <li style={{ 
                                        marginBottom: '18px',
                                        position: 'relative',
                                        paddingLeft: '40px'
                                      }}>
                                        <img 
                                          src="/check.svg" 
                                          style={{
                                            position: 'absolute',
                                            top: '0',
                                            left: '0'
                                          }}
                                        /> Goal Settings and Habit building features
                                      </li>
                                    </ul>

                                    <Button 
                                      size="large" 
                                      className={styles.report_btn} 
                                      variant="contained" 
                                      href={'/buy'}
                                      style={{
                                        marginBottom: '15px',
                                        fontSize: '14px',
                                        fontWeight: '300',
                                        fontFamily: 'Circular STD'
                                      }} 
                                    >
                                      BUY MOODITUDE PREMIUM
                                    </Button>
                                    
                                    {/*<div>
                                      <Link href="#" >
                                        <a onClick={e => {e.preventDefault();setBuyPremium(false)}} style={{
                                          fontSize: '14px',
                                          fontWeight: '300',
                                          fontFamily: 'Circular STD'
                                        }}>NO THANKS</a>
                                      </Link>
                                    </div>*/}
                                  </div>
                                   : '' }
                                  <div className={styles.download_app_wrap}>
                                    <h4>Download</h4>
                                    <p>For the full experience download Mooditude’s mobile app and login with your credentials. </p>

                                    <div className={styles.app_btns}>
                                      <a href="https://apps.apple.com/us/app/mooditude-cbt-therapy/id1450661800" target="_blank">
                                        <img src="/Apple.png" alt="" />
                                      </a>  

                                      <a href="https://play.google.com/store/apps/details?id=com.health.mental.mooditude" target="_blank">
                                        <img src="/Android.png" alt="" />
                                      </a>  
                                    </div>
                                  </div>
                                </>
                              )}

                            {((licenseType == 'premium') || (userProfile.customerType == 'premium')) && (
                              <>
                                <div className={styles.report_risks_wrap} >
                                  {/*<img src="/warning.svg" alt="Disorder Risks" />*/}
                                  <h2>Risks</h2>


                                  <div className={styles.report_risks_flex_wrap}>
                                    <div 
                                      className={`
                                        ${styles.report_risks_flex_item} 
                                        ${ depressionRiskLevel == 'unlikely' ? styles.unlikely : '' } 
                                        ${ depressionRiskLevel == 'low' ? styles.low : '' } 
                                        ${ depressionRiskLevel == 'medium' ? styles.medium : '' } 
                                        ${ depressionRiskLevel == 'high' ? styles.high : '' } 
                                      `}
                                    >
                                      <h3>Depression</h3>
                                      <h4>{depressionRiskLevel.charAt(0).toUpperCase() + depressionRiskLevel.slice(1)} Risk</h4>

                                      {depressionRiskLevel == 'unlikely' && (
                                        <>
                                          {/*<img src="/unlikely-risk.svg" alt="Unlikely" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>This low score means you have few symptoms of depression at this time.</p>
                                        </>
                                      )}

                                      {depressionRiskLevel == 'low' && (
                                        <>
                                          {/*<img src="/low-risk.svg" alt="Low" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the depression scale tend to have a 1 in 3 chance of suffering from depression.</p>
                                        </>
                                      )}

                                      {depressionRiskLevel == 'medium' && (
                                        <>
                                          {/*<img src="/medium-risk.svg" alt="Medium" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the depression scale tend to have a 2 in 3 chance of suffering from depression.</p>
                                        </>
                                      )}

                                      {depressionRiskLevel == 'high' && (
                                        <>
                                          {/*<img src="/high-risk.svg" alt="High" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the depression scale typically have a 90% chance of suffering from depression.</p>
                                        </>
                                      )}
                                    </div>

                                    <div className={`
                                        ${styles.report_risks_flex_item} 
                                        ${ anxietyRiskLevel == 'unlikely' ? styles.unlikely : '' } 
                                        ${ anxietyRiskLevel == 'low' ? styles.low : '' } 
                                        ${ anxietyRiskLevel == 'medium' ? styles.medium : '' } 
                                        ${ anxietyRiskLevel == 'high' ? styles.high : '' } 
                                      `}>
                                      <h3 >Anxiety</h3>
                                      <h4 className={`

                                      `}>{anxietyRiskLevel.charAt(0).toUpperCase() + anxietyRiskLevel.slice(1)} Risk</h4>
                                      {anxietyRiskLevel == 'unlikely' && (
                                        <>
                                          {/*<img src="/unlikely-risk.svg" alt="Unlikely" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>This low score means you do not have symptoms of an anxiety disorder at this time.</p>
                                        </>
                                      )}

                                      {anxietyRiskLevel == 'low' && (
                                        <>
                                          {/*<img src="/low-risk.svg" alt="Low" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the anxiety scale tend to have a 1 in 3 chance of suffering from an anxiety disorder.</p>
                                        </>
                                      )}

                                      {anxietyRiskLevel == 'medium' && (
                                        <>
                                          {/*<img src="/medium-risk.svg" alt="Medium" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the anxiety scale tend to have about a 50% chance of suffering from an anxiety disorder.</p>
                                        </>
                                      )}

                                      {anxietyRiskLevel == 'high' && (
                                        <>
                                          {/*<img src="/high-risk.svg" alt="High" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the anxiety scale tend to have a 90% chance of suffering from an anxiety disorder.</p>
                                        </>
                                      )}
                                    </div>

                                  </div>

                                  <div className={styles.report_risks_flex_wrap}>
                                    <div 
                                      className={`
                                        ${styles.report_risks_flex_item} 
                                        ${ ptsdRiskLevel == 'unlikely' ? styles.unlikely : '' } 
                                        ${ ptsdRiskLevel == 'low' ? styles.low : '' } 
                                        ${ ptsdRiskLevel == 'medium' ? styles.medium : '' } 
                                        ${ ptsdRiskLevel == 'high' ? styles.high : '' } 
                                      `}
                                    >
                                      <h3 >PTSD</h3>
                                      <h4>{ptsdRiskLevel.charAt(0).toUpperCase() + ptsdRiskLevel.slice(1)} Risk</h4>
                                      {ptsdRiskLevel == 'unlikely' && (
                                        <>
                                          {/*<img src="/unlikely-risk.svg" alt="Unlikely" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>This low score means you do not have symptoms of posttraumatic stress disorder (PTSD) at this time.</p>
                                        </>
                                      )}

                                      {ptsdRiskLevel == 'low' && (
                                        <>
                                          {/*<img src="/low-risk.svg" alt="Low" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>Many individuals who have posttraumatic stress disorder (PTSD) respond to the scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, your risk of PTSD is just 1 in 8, though there could be another underlying mood or anxiety condition. (Naturally, if you have experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)</p>
                                        </>
                                      )}

                                      {ptsdRiskLevel == 'medium' && (
                                        <>
                                          {/*<img src="/medium-risk.svg" alt="Medium" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>Most individuals who have posttraumatic stress disorder (PTSD) respond to the scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, your risk of PTSD is just 1 in 5, though there could be another underlying mood or anxiety condition. (Naturally, if you have experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)</p>
                                        </>
                                      )}

                                      {ptsdRiskLevel == 'high' && (
                                        <>
                                          {/*<img src="/high-risk.svg" alt="High" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>Most individuals who have posttraumatic stress disorder (PTSD) respond to the PTSD scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, the likelihood that you have PTSD is about 1 in 3, though there is a high likelihood of another underlying mood or anxiety condition. Further assessment may help clarify these results. (Naturally, if you are aware of having experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)</p>
                                        </>
                                      )}
                                    </div>

                                    <div className={`
                                        ${styles.report_risks_flex_item} 
                                        ${ bipolarRiskLevel == 'unlikely' ? styles.unlikely : '' } 
                                        ${ bipolarRiskLevel == 'low' ? styles.low : '' } 
                                        ${ bipolarRiskLevel == 'medium' ? styles.medium : '' } 
                                        ${ bipolarRiskLevel == 'high' ? styles.high : '' } 
                                      `}>
                                      <h3 >Bipolar</h3>
                                      <h4 >{bipolarRiskLevel.charAt(0).toUpperCase() + bipolarRiskLevel.slice(1)} Risk</h4>
                                      {bipolarRiskLevel == 'unlikely' && (
                                        <>
                                          {/*<img src="/unlikely-risk.svg" alt="Unlikely" />*/}
                                          <p style={{ color: '#072B4F', marginTop: '5px' }}>This low score means you do not have symptoms of bipolar disorder at this time.</p>
                                        </>
                                      )}

                                      {bipolarRiskLevel == 'low' && (
                                        <>
                                          {/*<img src="/low-risk.svg" alt="Low" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>People scoring in this range of the bipolar scale tend to have a 1 in 9 chance of having bipolar disorder. Nonetheless, more than a third of people in this range have some type of mood or anxiety condition. Further assessment may help clarify these results.</p>
                                        </>
                                      )}

                                      {bipolarRiskLevel == 'medium' && (
                                        <>
                                          {/*<img src="/medium-risk.svg" alt="Medium" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>People scoring in this range of the bipolar scale tend to have a 1 in 3 chance of having bipolar disorder, or possible another mood or anxiety condition. Further assessment may help clarify these results.</p>
                                        </>
                                      )}

                                      {bipolarRiskLevel == 'high' && (
                                        <>
                                          {/*<img src="/high-risk.svg" alt="High" />*/}
                                          <p style={{ fontFamily: 'Circular Std', color: '#072B4F', marginTop: '5px' }}>People scoring in this range of the bipolar scale tend to have a 50% likelihood of having bipolar disorder. Though the score is high, there is a high false positive rate, so further assessment may help clarify these results.</p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className={styles.results_recommendations}>
                                  {/*<img src="/recommended-actions.svg" alt="Recommended Actions" />*/}
                                  <h2>Recommendations</h2>

                                  {allRiskLevel == 'unlikely' && (
                                    <>
                                      <p>Your responses suggest that you are not suffering from a significant mood or anxiety disorder at the present time. However, before closing the book on this matter there are a few points you should consider.</p>

                                      <p>A small percentage of individuals with mood or anxiety disorders fail to be picked up by the assessment. Therefore, if you find yourself experiencing troubling mood or anxiety-related symptoms then you should certainly present your concerns to your primary care practitioner or perhaps to a mental health clinician.</p>

                                      <p>A tendency to underestimate the effects of your symptoms on friendships, home, or work-life may have resulted in an “all is well” report when perhaps this is not strictly true. Call it “denial,” not wishing to complain, or simply trying to “tough it out,” underreporting trouble could backfire and cause you more distress in the future. Avoid the pitfall of assuming that the way you feel “is to be expected considering my circumstances.” While bad feelings are naturally the result of difficult and stressful life situations, mood and anxiety disorders are real medical conditions that may be triggered by such stresses. When they do arise, these conditions make it more difficult to cope with the problems confronting you, and so it is always in your best interest to get them evaluated.</p>

                                      <p>Milder or subclinical varieties of mood and anxiety occasionally develop into more serious conditions. In such instances, symptoms may be less severe but nonetheless distracting or annoying, slowing you down or making things more stressful than they should be. If you feel this may apply to you, you should consider raising the issue with your physician and sharing your responses to these questions.</p>

                                      <p>Mood and anxiety disorders typically come in episodes. Therefore, even if you are feeling fine now, it is in your best interest to revisit this checklist every 6 months or so. Naturally, if at any point you find yourself experiencing some of the symptoms described in the assessment, please return and repeat the checklist at your first opportunity.</p>

                                      <p>Mooditude has over 800 minutes of self-care activities. Make a habit of practicing one of them for just 10 minutes per day. This will help you maintain your mental well-being.</p>
                                    </>
                                  )}
                                  
                                  {allRiskLevel == 'low' && (
                                    <>
                                      <p>Your low overall score means that your symptoms are somewhat milder than average. However, mild symptoms still may have a negative effect on your well-being and, when left untreated, can grow worse with time. You may possibly benefit from contacting your physician or a mental health care provider to begin a discussion of your responses to these questions. It is important for you to share these results with your physician.</p>

                                      <p>Mood and anxiety disorders can affect not only your general sense of well-being but your physical health as well, increasing the risk or severity of heart disease, stroke, diabetes, chronic pain, and other chronic health conditions.</p>
                                    </>
                                  )}

                                  {allRiskLevel == 'medium' && (
                                    <>
                                      <p>Your overall score suggests that you would benefit from contacting your physician or a mental health care provider to begin a discussion of your responses to these questions.  It is important for you to share these results with your physician.</p>

                                      <p>Mood and anxiety disorders can affect not only your general sense of well-being but your physical health as well, increasing the risk or severity of heart disease, stroke, diabetes, chronic pain, and other chronic health conditions.</p>
                                    </>
                                  )}

                                  {allRiskLevel == 'high' && (
                                    <>
                                      <p>Your overall score suggests that you would benefit from contacting your physician or a mental health care provider as soon as possible to begin a discussion of your responses to these questions.  It is important for you to share these results with your physician.</p>

                                      <p>Mood and anxiety disorders can affect not only your general sense of well-being but your physical health as well, increasing the risk or severity of heart disease, stroke, diabetes, chronic pain, and other chronic health conditions.</p>
                                    </>
                                  )}

                                  <Button 
                                    size="large" 
                                    className={styles.report_btn} 
                                    variant="contained" 
                                    style={{
                                      marginTop: '10px',
                                      marginBottom: '60px',
                                      fontFamily: 'Circular STD',
                                      
                                    }} 
                                    onClick={() => alert('Coming soon...')}
                                  >
                                    FIND THE RIGHT THERAPIST
                                  </Button>
                                </div>

                                <div className={styles.results_thoughts_wrap}>
                                  {(usedDrug && usedAlcohol) && (
                                    <div className={styles.results_thoughts_item}>
                                      <h4>Substance Abuse</h4>

                                      <p>Your responses indicated that you have occasionally used alcohol and non-prescribed drugs to manage some of the symptoms.</p>

                                      <p>Self-medication for such symptoms, even when this appears to be effective, often will make such symptoms worse over the long term. We strongly urge you to share your responses to these questions with your physician and to begin an honest discussion about your alcohol and drug use patterns.</p>

                                      <p>It is likely that a more appropriate and more effective means for managing your symptoms can be found, bringing with it a real chance for improvement in your functioning, quality of life, and overall health.</p>
                                    </div>
                                  )}

                                  {(usedDrug && !usedAlcohol) && (
                                    <div className={styles.results_thoughts_item}>
                                      <h4>Drug Abuse</h4>

                                      <p>Your responses indicated that you have occasionally used non-prescribed drugs to manage some of the symptoms.</p>

                                      <p>Self-medication for such symptoms, even when this appears to be effective, is likely to make such symptoms worse over the long term. We strongly urge you to share the responses to these questions with your physician and to begin an honest discussion about your drug use patterns.</p>

                                      <p>It is likely that a more appropriate and more effective means for managing your symptoms can be found, bringing with it a real chance for improvement in your functioning, quality of life, and overall health.</p>
                                    </div>
                                  )}

                                  {(usedAlcohol && !usedDrug) && (
                                    <div className={styles.results_thoughts_item}>
                                      <h4>Alcohol Abuse</h4>

                                      <p>Your responses suggest that you have occasionally used alcohol to manage some of the symptoms.</p>

                                      <p>Self-medication for such symptoms, even when this appears to be effective, often will make such symptoms worse over the long term. We strongly urge you to share your assessment results with your physician and to begin an honest discussion about your alcohol use patterns.</p>

                                      <p>It is virtually certain that a more appropriate and more effective means for managing your symptoms can be found, bringing with it a real chance for improvement in your functioning, quality of life, and overall health.</p>
                                    </div>
                                  )}

                                  {hasSuicidalThoughts && (
                                    <>
                                      <div className={styles.results_thoughts_item}>
                                        <h4>Suicidality</h4>

                                        <p style={{ fontFamily: 'Circular Std', margin: '20px 0' }}>It is very important, first of all, to point out that having such a thought does not automatically place you at risk for actual suicide. On the other hand, individuals who report suicidal thinking on closer examination are usually found to have a mood or anxiety disorder. This is true even for those who feel that due to life circumstances they have legitimate reasons for having such thoughts. Given this fact, it is crucial that you present your results to your physician and to begin a discussion of this very issue.</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                                
                                <div className={styles.disclaimer}>
                                  <h5>Disclaimer</h5>
                                  
                                  <p>Mooditude is not engaged in rendering medical or other professional services, and the use of the assessment is not intended to create and does not create any medical or other professional services relationship.</p>

                                  <p>Use of this assessment is not an adequate substitute for obtaining medical or other professional advice, diagnosis, or treatment from a qualified licensed health care provider.</p>

                                  <p>This assessment is not intended for anyone under eighteen (18) years of age and is provided "as is" without any warranties of any kind, either express or implied, and Mooditude disclaims all warranties, including liability for indirect or consequential damages.</p>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {isScoresVisible && (
                      <div className={styles.report_content_item} key={'report_content_paid_wrap'}>
                        <div className={styles.scores_section} style={{ width: '400px' }}>
                          <h2 >Diagnosis Risks</h2>

                          <div className={styles.diagnosis_risks}>
                            <div
                              className={`
                                ${depressionRiskLevel == 'high' ? styles.risk_high : ''} 
                                ${depressionRiskLevel == 'medium' ? styles.risk_medium : ''} 
                                ${depressionRiskLevel == 'low' ? styles.risk_low : ''} 
                                ${depressionRiskLevel == 'unlikely' ? styles.risk_unlikely : ''} 
                              `}
                            >
                              <div className={styles.risk_score}>{depressionRiskScore}</div>
                              <h3>Depression Risks</h3>
                              <h3>{depressionRiskLevel.charAt(0).toUpperCase() + depressionRiskLevel.slice(1)}</h3>
                            </div>

                          

                            <div
                              className={`
                                ${anxietyRiskLevel == 'high' ? styles.risk_high : ''} 
                                ${anxietyRiskLevel == 'medium' ? styles.risk_medium : ''} 
                                ${anxietyRiskLevel == 'low' ? styles.risk_low : ''} 
                                ${anxietyRiskLevel == 'unlikely' ? styles.risk_unlikely : ''} 
                              `}
                            >
                              <div className={styles.risk_score}>{anxietyRiskScore}</div>
                              <h3>Anxiety Risks</h3>
                              <h3>{anxietyRiskLevel.charAt(0).toUpperCase() + anxietyRiskLevel.slice(1)}</h3>
                            </div>

                            <div
                              className={`
                                ${ptsdRiskLevel == 'high' ? styles.risk_high : ''} 
                                ${ptsdRiskLevel == 'medium' ? styles.risk_medium : ''} 
                                ${ptsdRiskLevel == 'low' ? styles.risk_low : ''} 
                                ${ptsdRiskLevel == 'unlikely' ? styles.risk_unlikely : ''} 
                              `}
                            >
                              <div className={styles.risk_score}>{ptsdRiskScore}</div>
                              <h3>PTSD Risks</h3>
                              <h3>{ptsdRiskLevel.charAt(0).toUpperCase() + ptsdRiskLevel.slice(1)}</h3>
                            </div>

                            <div
                              className={`
                                ${bipolarRiskLevel == 'high' ? styles.risk_high : ''} 
                                ${bipolarRiskLevel == 'medium' ? styles.risk_medium : ''} 
                                ${bipolarRiskLevel == 'low' ? styles.risk_low : ''} 
                                ${bipolarRiskLevel == 'unlikely' ? styles.risk_unlikely : ''} 
                              `}
                            >
                              
                              <div className={styles.risk_score}>{bipolarRiskScore}</div>
                              <h3>Bipolar Risks</h3>
                              <h3>{bipolarRiskLevel.charAt(0).toUpperCase() + bipolarRiskLevel.slice(1)}</h3>
                            </div>
                          </div>
                        </div>

                        <div className={styles.scores_section} style={{ width: '400px' }}>
                          <h2 style={{ fontWeight: '700' }}>Functional Impairments</h2>

                          <div className={styles.functional_impairments}>
                            <div>
                              {thoughtsOfSuicideAnswer == 0 && <div className={styles.risk_level_unlikely}></div>}
                              {thoughtsOfSuicideAnswer == 1 && <div className={styles.risk_level_unlikely}></div>}
                              {thoughtsOfSuicideAnswer == 2 && <div className={styles.risk_level_low}></div>}
                              {thoughtsOfSuicideAnswer == 3 && <div className={styles.risk_level_medium}></div>}
                              {thoughtsOfSuicideAnswer == 4 && <div className={styles.risk_level_high}></div>}
                              {thoughtsOfSuicideAnswer == 5 && <div className={styles.risk_level_high}></div>}
                              
                              <p>Thoughts of suicide</p>

                              {thoughtsOfSuicideAnswer == 0 && <p>None</p>}
                              {thoughtsOfSuicideAnswer == 1 && <p>Rarely</p>}
                              {thoughtsOfSuicideAnswer == 2 && <p>Sometimes</p>}
                              {thoughtsOfSuicideAnswer == 3 && <p>Often</p>}
                              {thoughtsOfSuicideAnswer == 4 && <p>Most of the time</p>}
                              {thoughtsOfSuicideAnswer == 5 && <p>Most of the time</p>}
                            </div>

                            <div>
                              {impairsWorkSchoolAnswer == 0 && <div className={styles.risk_level_unlikely}></div>}
                              {impairsWorkSchoolAnswer == 1 && <div className={styles.risk_level_unlikely}></div>}
                              {impairsWorkSchoolAnswer == 2 && <div className={styles.risk_level_low}></div>}
                              {impairsWorkSchoolAnswer == 3 && <div className={styles.risk_level_medium}></div>}
                              {impairsWorkSchoolAnswer == 4 && <div className={styles.risk_level_high}></div>}
                              {impairsWorkSchoolAnswer == 5 && <div className={styles.risk_level_high}></div>}
                              
                              <p>Impairs work/school</p>

                              {impairsWorkSchoolAnswer == 0 && <p>None</p>}
                              {impairsWorkSchoolAnswer == 1 && <p>Rarely</p>}
                              {impairsWorkSchoolAnswer == 2 && <p>Sometimes</p>}
                              {impairsWorkSchoolAnswer == 3 && <p>Often</p>}
                              {impairsWorkSchoolAnswer == 4 && <p>Most of the time</p>}
                              {impairsWorkSchoolAnswer == 5 && <p>Most of the time</p>}
                            </div>

                            <div>
                              {impairsFriendsFamilyAnswer == 0 && <div className={styles.risk_level_unlikely}></div>}
                              {impairsFriendsFamilyAnswer == 1 && <div className={styles.risk_level_unlikely}></div>}
                              {impairsFriendsFamilyAnswer == 2 && <div className={styles.risk_level_low}></div>}
                              {impairsFriendsFamilyAnswer == 3 && <div className={styles.risk_level_medium}></div>}
                              {impairsFriendsFamilyAnswer == 4 && <div className={styles.risk_level_high}></div>}
                              {impairsFriendsFamilyAnswer == 5 && <div className={styles.risk_level_high}></div>}
                              
                              <p>Impairs friends/family</p>

                              {impairsFriendsFamilyAnswer == 0 && <p>None</p>}
                              {impairsFriendsFamilyAnswer == 1 && <p>Rarely</p>}
                              {impairsFriendsFamilyAnswer == 2 && <p>Sometimes</p>}
                              {impairsFriendsFamilyAnswer == 3 && <p>Often</p>}
                              {impairsFriendsFamilyAnswer == 4 && <p>Most of the time</p>}
                              {impairsFriendsFamilyAnswer == 5 && <p>Most of the time</p>}
                            </div>

                            <div>
                              {ledToUsingAlcoholAnswer == 0 && <div className={styles.risk_level_unlikely}></div>}
                              {ledToUsingAlcoholAnswer == 1 && <div className={styles.risk_level_unlikely}></div>}
                              {ledToUsingAlcoholAnswer == 2 && <div className={styles.risk_level_low}></div>}
                              {ledToUsingAlcoholAnswer == 3 && <div className={styles.risk_level_medium}></div>}
                              {ledToUsingAlcoholAnswer == 4 && <div className={styles.risk_level_high}></div>}
                              {ledToUsingAlcoholAnswer == 5 && <div className={styles.risk_level_high}></div>}
                              
                              <p>Led to using alcohol</p>

                              {ledToUsingAlcoholAnswer == 0 && <p>None</p>}
                              {ledToUsingAlcoholAnswer == 1 && <p>Rarely</p>}
                              {ledToUsingAlcoholAnswer == 2 && <p>Sometimes</p>}
                              {ledToUsingAlcoholAnswer == 3 && <p>Often</p>}
                              {ledToUsingAlcoholAnswer == 4 && <p>Most of the time</p>}
                              {ledToUsingAlcoholAnswer == 5 && <p>Most of the time</p>}
                            </div>

                            <div>
                              {ledToUsingDrugAnswer == 0 && <div className={styles.risk_level_unlikely}></div>}
                              {ledToUsingDrugAnswer == 1 && <div className={styles.risk_level_unlikely}></div>}
                              {ledToUsingDrugAnswer == 2 && <div className={styles.risk_level_low}></div>}
                              {ledToUsingDrugAnswer == 3 && <div className={styles.risk_level_medium}></div>}
                              {ledToUsingDrugAnswer == 4 && <div className={styles.risk_level_high}></div>}
                              {ledToUsingDrugAnswer == 5 && <div className={styles.risk_level_high}></div>}
                              
                              <p>Led to using drugs</p>

                              {ledToUsingDrugAnswer == 0 && <p>None</p>}
                              {ledToUsingDrugAnswer == 1 && <p>Rarely</p>}
                              {ledToUsingDrugAnswer == 2 && <p>Sometimes</p>}
                              {ledToUsingDrugAnswer == 3 && <p>Often</p>}
                              {ledToUsingDrugAnswer == 4 && <p>Most of the time</p>}
                              {ledToUsingDrugAnswer == 5 && <p>Most of the time</p>}
                            </div>
                          </div>
                        </div>

                        <div className={styles.scores_section} >
                          <h2>Individual Question Score</h2>

                          <div className={styles.questions}>
                            <div className={styles.result_questions_wrap}>
                              <div className={styles.result_questions_item_wrap} style={{ marginBottom: '30px' }}>
                                <h3>Most of the time ({mostOfTheTimeAnswerCount})</h3>

                                {mostOfTheTimeAnswerQuestions.length > 0 && (
                                  <div style={{ marginLeft: '33px' }}>
                                    {mostOfTheTimeAnswerQuestions.map((question) => (
                                      <p key={question}>{getQuestion(parseInt(question))}</p>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className={styles.result_questions_item_wrap} style={{ marginBottom: '30px' }}>
                                <h3>Often ({oftenAnswerCount})</h3>

                                {oftenAnswerQuestions.length > 0 && (
                                  <div style={{ marginLeft: '33px' }}>
                                    {oftenAnswerQuestions.map((question) => (
                                      <p key={question}>{getQuestion(parseInt(question))}</p>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className={styles.result_questions_item_wrap} style={{ marginBottom: '30px' }}>
                                <h3>Sometimes ({sometimesAnswerCount})</h3>

                                {sometimesAnswerQuestions.length > 0 && (
                                  <div style={{ marginLeft: '33px' }}>
                                    {sometimesAnswerQuestions.map((question) => (
                                      <p key={question}>{getQuestion(parseInt(question))}</p>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className={styles.result_questions_item_wrap} style={{ marginBottom: '30px' }}>
                                <h3>Rarely ({rarelyAnswerCount})</h3>

                                {rarelyAnswerQuestions.length > 0 && (
                                  <div style={{ marginLeft: '33px' }}>
                                    {rarelyAnswerQuestions.map((question) => (
                                      <p key={question}>{getQuestion(parseInt(question))}</p>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className={styles.result_questions_item_wrap}>
                                <h3>None ({noneAnswerCount})</h3>

                                {noneAnswerQuestions.length > 0 && (
                                  <div style={{ marginLeft: '33px' }}>
                                    {noneAnswerQuestions.map((question) => (
                                      <p key={question}>{getQuestion(parseInt(question))}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div> 
                    )}

                    {isDownloadVisible && (
                      <div className={styles.report_content_item} key={'report_content_paid_wrap'}>
                        {assessmentScores.pdfDoc == null && (
                          <>
                            <p className={styles.download_text}>Click here to download full report as a PDF.</p>

                            <Button 
                              className={styles.report_btn} 
                              variant="contained" 
                              onClick={handleDownload} 
                              disabled={isDownloading ? true : false} 
                              style={{ marginTop: '0', marginBottom: '0', marginRight: '20px', textTransform: 'none', fontFamily: 'Circular Std', fontWeight: 'normal', fontSize: '14px' }}
                            >
                              {isDownloading && 'Downloading'}
                              {(!isDownloading) && 'Download'}
                            </Button>

                            {(!isDownloading && reportLink != '') && (
                              <a href={reportLink} target="_blank" style={{ fontFamily: 'Circular Std', fontWeight: 'normal', fontSize: '14px' }}>Download Report</a>
                            )}
                          </>
                        )}
                        
                        {assessmentScores.pdfDoc != null && (
                          <a href={assessmentScores.pdfDoc} target="_blank" style={{ fontFamily: 'Circular Std', fontWeight: 'normal', fontSize: '14px' }}>Download Report</a>
                        )}
                      </div>
                    )}

                    {/* <div className={styles.report_content_item} key={'report_content_paid_scores_wrap'}>
                    </div> 

                    <div className={styles.report_content_item} key={'report_content_download_wrap'}>
                    </div> */}
                  </div>
                </div>
              }
               
            </div>
          </div>
        
      }
    </Layout>
  )
}