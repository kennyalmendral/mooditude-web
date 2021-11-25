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

export default function AssessmentReport() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [isReportVisible, setIsReportVisible] = useState(true)
  const [isScoresVisible, setIsScoresVisible] = useState(false)
  const [isDownloadVisible, setIsDownloadVisible] = useState(false)
  
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

  const [assessmentDate, setAssessmentDate] = useState(null)
  const [customerType, setCustomerType] = useState('free')

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
    let usersRef
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
            if (doc.docs[0] !== undefined) {
              let docData = doc.docs[0].data()

              setAssessmentScores(docData)

              setMostOfTheTimeAnswerCount(docData.rawData.split(',').filter(x => x == 4).length)
              setOftenAnswerCount(docData.rawData.split(',').filter(x => x == 3).length)
              setSometimesAnswerCount(docData.rawData.split(',').filter(x => x == 2).length)
              setRarelyAnswerCount(docData.rawData.split(',').filter(x => x == 1).length)
              setNoneAnswerCount(docData.rawData.split(',').filter(x => x == 0).length)
            }
          })

        usersRef = firebaseStore
          .collection('Users')
          .doc(user.uid)
          
        unsubscribe = usersRef
          .get()
          .then(doc => {
            setCustomerType(doc.data().customerType)
          })
      } else {
        unsubscribe && unsubscribe()
      }
    })
  }, [])

  useEffect(() => {
    console.log(mostOfTheTimeAnswerCount) 
  }, [mostOfTheTimeAnswerCount])

  return (
    <Layout title={`Assessment Full Report | ${SITE_NAME}`}>
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
          </div>

          <div className={styles.report_right_wrap}>
            <div className={styles.report_btns_wrapper}>
                <a
                  href="#" 
                  className={isReportVisible && styles.active} 
                  onClick={() => {
                    setIsScoresVisible(false)
                    setIsDownloadVisible(false)
                    setIsReportVisible(true)
                  }}>REPORT</a>

                <a 
                  href="#" 
                  className={isScoresVisible && styles.active} 
                  onClick={() => {
                    setIsReportVisible(false)
                    setIsDownloadVisible(false)
                    setIsScoresVisible(true)
                  }}>SCORES</a>

                {/* <a href="#" onClick={() => {setContentShow('report_content_download_wrap')}}>DOWNLOAD</a> */}
            </div>
            
            <div className={styles.report_content_wrap}>
              {isReportVisible && (
                <div className={`${styles.report_content_item} ${styles.active}`} key={'report_content_free_wrap'}>
                  {riskScore > 0 && (
                    <>
                      <div className={styles.normal_text_wrap}>
                        {allRiskLevel == 'unlikely' && (
                          <p>Your score is below the level usually found for individuals already known to be suffering from a mood or anxiety disorder. Despite this low score, it is still important to refer to the information and recommendations below concerning your risk for each of the four conditions described.</p>
                        )}

                        {allRiskLevel == 'low' && (
                          <>
                            <p>Your score is in the lower range as compared to individuals already known to be suffering from a mood or anxiety disorder.</p>
                            <p>Despite this relatively low score, your symptoms may be impacting your life, livelihood, and general well-being. Read closely the information and recommendations below concerning your risk of each of the four conditions described.</p>
                          </>
                        )}

                        {allRiskLevel == 'medium' && (
                          <>
                            <p>Your score is in the mid-range as compared to individuals already known to be suffering from a mood or anxiety disorder.</p>
                            <p>This is a significant finding, as it suggests that your symptoms are probably impacting your life and general well-being. Read carefully the information and recommendations below concerning your risk of each of the four conditions described.</p>
                          </>
                        )}

                        {allRiskLevel == 'high' && (
                          <>
                            <p>Your score is in the high range as compared to individuals already known to be suffering from a mood or anxiety disorder.</p>
                            <p>This is cause for real concern, as it suggests that your symptoms are impacting your life and general health. Read carefully the information and recommendations below concerning your risk of each of the four conditions described.</p>
                          </>
                        )}
                      </div>
                      
                      {customerType == 'free' && (
                        <>
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
                              style={{
                                marginBottom: '15px',
                                fontSize: '14px',
                                fontWeight: '300',
                                fontFamily: 'Circular STD'
                              }} 
                            >
                              BUY MOODITUDE PREMIUM
                            </Button>
                            
                            <div>
                              <Link href="#">
                                <a style={{
                                  fontSize: '14px',
                                  fontWeight: '300',
                                  fontFamily: 'Circular STD'
                                }}>NO THANKS</a>
                              </Link>
                            </div>
                          </div>

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

                      {customerType == 'premium' && (
                        <>
                          <div style={{ marginBottom: '40px' }}>
                            <img src="/warning.svg" alt="Disorder Risks" />
                            <h2 style={{ marginTop: '-8px', marginBottom: '30px' }}>Disorder Risks</h2>

                            <div style={{ marginBottom: '32px' }}>
                              <h3 style={{ fontSize: '18px', marginBottom: '-5px', color: '#072B4F' }}>Depression — {depressionRiskLevel.charAt(0).toUpperCase() + depressionRiskLevel.slice(1)} Risk</h3>

                              {depressionRiskLevel == 'unlikely' && (
                                <>
                                  <img src="/unlikely-risk.svg" alt="Unlikely" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>This low score means you have few symptoms of depression at this time.</p>
                                </>
                              )}

                              {depressionRiskLevel == 'low' && (
                                <>
                                  <img src="/low-risk.svg" alt="Low" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the depression scale tend to have a 1 in 3 chance of suffering from depression.</p>
                                </>
                              )}

                              {depressionRiskLevel == 'medium' && (
                                <>
                                  <img src="/medium-risk.svg" alt="Medium" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the depression scale tend to have a 2 in 3 chance of suffering from depression.</p>
                                </>
                              )}

                              {depressionRiskLevel == 'high' && (
                                <>
                                  <img src="/high-risk.svg" alt="High" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the depression scale typically have a 90% chance of suffering from depression.</p>
                                </>
                              )}
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                              <h3 style={{ fontSize: '18px', marginBottom: '-5px', color: '#072B4F' }}>Anxiety — {anxietyRiskLevel.charAt(0).toUpperCase() + anxietyRiskLevel.slice(1)} Risk</h3>

                              {anxietyRiskLevel == 'unlikely' && (
                                <>
                                  <img src="/unlikely-risk.svg" alt="Unlikely" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>This low score means you do not have symptoms of an anxiety disorder at this time.</p>
                                </>
                              )}

                              {anxietyRiskLevel == 'low' && (
                                <>
                                  <img src="/low-risk.svg" alt="Low" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the anxiety scale tend to have a 1 in 3 chance of suffering from an anxiety disorder.</p>
                                </>
                              )}

                              {anxietyRiskLevel == 'medium' && (
                                <>
                                  <img src="/medium-risk.svg" alt="Medium" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the anxiety scale tend to have about a 50% chance of suffering from an anxiety disorder.</p>
                                </>
                              )}

                              {anxietyRiskLevel == 'high' && (
                                <>
                                  <img src="/high-risk.svg" alt="High" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>People scoring in this range on the anxiety scale tend to have a 90% chance of suffering from an anxiety disorder.</p>
                                </>
                              )}
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                              <h3 style={{ fontSize: '18px', marginBottom: '-5px', color: '#072B4F' }}>PTSD — {ptsdRiskLevel.charAt(0).toUpperCase() + ptsdRiskLevel.slice(1)} Risk</h3>

                              {ptsdRiskLevel == 'unlikely' && (
                                <>
                                  <img src="/unlikely-risk.svg" alt="Unlikely" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>This low score means you do not have symptoms of posttraumatic stress disorder (PTSD) at this time.</p>
                                </>
                              )}

                              {ptsdRiskLevel == 'low' && (
                                <>
                                  <img src="/low-risk.svg" alt="Low" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>Many individuals who have posttraumatic stress disorder (PTSD) respond to the scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, your risk of PTSD is just 1 in 8, though there could be another underlying mood or anxiety condition. (Naturally, if you have experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)</p>
                                </>
                              )}

                              {ptsdRiskLevel == 'medium' && (
                                <>
                                  <img src="/medium-risk.svg" alt="Medium" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>Most individuals who have posttraumatic stress disorder (PTSD) respond to the scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, your risk of PTSD is just 1 in 5, though there could be another underlying mood or anxiety condition. (Naturally, if you have experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)</p>
                                </>
                              )}

                              {ptsdRiskLevel == 'high' && (
                                <>
                                  <img src="/high-risk.svg" alt="High" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>Most individuals who have posttraumatic stress disorder (PTSD) respond to the PTSD scale as you did. Yet, because PTSD is less common than other mood and anxiety disorders, the likelihood that you have PTSD is about 1 in 3, though there is a high likelihood of another underlying mood or anxiety condition. Further assessment may help clarify these results. (Naturally, if you are aware of having experienced a traumatic event or events, this fact increases the likelihood of a PTSD diagnosis.)</p>
                                </>
                              )}
                            </div>

                            <div style={{ marginBottom: '50px' }}>
                              <h3 style={{ fontSize: '18px', marginBottom: '-5px', color: '#072B4F' }}>Bipolar — {bipolarRiskLevel.charAt(0).toUpperCase() + bipolarRiskLevel.slice(1)} Risk</h3>

                              {bipolarRiskLevel == 'unlikely' && (
                                <>
                                  <img src="/unlikely-risk.svg" alt="Unlikely" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>This low score means you do not have symptoms of bipolar disorder at this time.</p>
                                </>
                              )}

                              {bipolarRiskLevel == 'low' && (
                                <>
                                  <img src="/low-risk.svg" alt="Low" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>People scoring in this range of the bipolar scale tend to have a 1 in 9 chance of having bipolar disorder. Nonetheless, more than a third of people in this range have some type of mood or anxiety condition. Further assessment may help clarify these results.</p>
                                </>
                              )}

                              {bipolarRiskLevel == 'medium' && (
                                <>
                                  <img src="/medium-risk.svg" alt="Medium" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>People scoring in this range of the bipolar scale tend to have a 1 in 3 chance of having bipolar disorder, or possible another mood or anxiety condition. Further assessment may help clarify these results.</p>
                                </>
                              )}

                              {bipolarRiskLevel == 'high' && (
                                <>
                                  <img src="/high-risk.svg" alt="High" />
                                  <p style={{ color: '#072B4F', marginTop: '5px' }}>People scoring in this range of the bipolar scale tend to have a 50% likelihood of having bipolar disorder. Though the score is high, there is a high false positive rate, so further assessment may help clarify these results.</p>
                                </>
                              )}
                            </div>
                          </div>

                          <div style={{ marginTop: '40px' }}>
                            <img src="/recommended-actions.svg" alt="Recommended Actions" />
                            <h2 style={{ marginTop: '-2px' }}>Recommended<br />Actions</h2>

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
                                marginBottom: '60px'
                              }} 
                              onClick={() => alert('Coming soon...')}
                            >
                              FIND THE RIGHT THERAPIST
                            </Button>
                          </div>

                          {hasSuicidalThoughts && (
                            <>
                              <div style={{
                                backgroundColor: '#FFFFAA',
                                padding: '30px',
                                textAlign: 'center',
                                fontFamily: 'Circular Std',
                                borderRadius: '4px'
                              }}>
                                <p style={{ marginTop: '0' }}><strong style={{ color: '#EB5757' }}>Your response to a question related to suicidal thoughts raises a red flag.</strong></p>

                                <p style={{ color: '#000' }}>Are you in crisis?</p>

                                <p style={{ marginBottom: '0', textAlign: 'left', color: '#000' }}>Please reach out for help:</p>

                                <ul style={{
                                  textAlign: 'left',
                                  marginBottom: '0',
                                  marginTop: '0',
                                  paddingLeft: '20px'
                                }}>
                                  <li style={{ fontSize: '14px' }}>call your doctor </li>
                                  <li style={{ fontSize: '14px' }}>National Suicide Prevention Lifeline: <strong>1-800-273-8255</strong></li>
                                  <li style={{ fontSize: '14px' }}>text <em>HOME</em> to the Crisis Line at <strong>741741</strong></li>
                                  <li style={{ fontSize: '14px' }}>call or go to an emergency room.</li>
                                </ul>
                              </div>

                              <p style={{ margin: '20px 0' }}>It is very important, first of all, to point out that having such a thought does not automatically place you at risk for actual suicide. On the other hand, individuals who report suicidal thinking on closer examination are often found to have a mood or anxiety disorder. This is true even for those who feel that, due to life circumstances, they have legitimate reasons for having such thoughts. Given this fact, it is crucial that you present your responses to these questions to your physician and begin a discussion of this issue.</p>
                            </>
                          )}

                          {usedDrug && (
                            <>
                              <p>Your responses indicated that you have occasionally used non-prescribed drugs to manage some of the symptoms.</p>

                              <p>Self-medication for such symptoms, even when this appears to be effective, is likely to make such symptoms worse over the long term. We strongly urge you to share the responses to these questions with your physician and to begin an honest discussion about your drug use patterns.</p>

                              <p>It is likely that a more appropriate and more effective means for managing your symptoms can be found, bringing with it a real chance for improvement in your functioning, quality of life, and overall health.</p>
                            </>
                          )}

                          {usedAlcohol && (
                            <>
                              <p>Your responses suggest that you have occasionally used alcohol to manage some of the symptoms.</p>

                              <p>Self-medication for such symptoms, even when this appears to be effective, often will make such symptoms worse over the long term. We strongly urge you to share your assessment results with your physician and to begin an honest discussion about your alcohol use patterns.</p>

                              <p>It is virtually certain that a more appropriate and more effective means for managing your symptoms can be found, bringing with it a real chance for improvement in your functioning, quality of life, and overall health.</p>
                            </>
                          )}
                          
                          <div>
                            <h5 style={{ fontSize: '18px', color: '#516B84', marginBottom: '12px', marginTop: '60px' }}>Disclaimer</h5>
                            
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
                  <div className={styles.scores_section} style={{ width: '370px' }}>
                    <h2 style={{ fontWeight: '500' }}>Diagnosis Risks</h2>

                    <div className={styles.diagnosis_risks}>
                      <div>
                        {depressionRiskLevel == 'high' && <div className={styles.risk_level_high}>{depressionRiskScore}</div>}
                        {depressionRiskLevel == 'medium' && <div className={styles.risk_level_medium}>{depressionRiskScore}</div>}
                        {depressionRiskLevel == 'low' && <div className={styles.risk_level_low}>{depressionRiskScore}</div>}
                        {depressionRiskLevel == 'unlikely' && <div className={styles.risk_level_unlikely}>{depressionRiskScore}</div>}
                        <h3>Depression Risks</h3>
                        <h3>{depressionRiskLevel.charAt(0).toUpperCase() + depressionRiskLevel.slice(1)}</h3>
                      </div>

                      <div>
                        {anxietyRiskLevel == 'high' && <div className={styles.risk_level_high}>{anxietyRiskScore}</div>}
                        {anxietyRiskLevel == 'medium' && <div className={styles.risk_level_medium}>{anxietyRiskScore}</div>}
                        {anxietyRiskLevel == 'low' && <div className={styles.risk_level_low}>{anxietyRiskScore}</div>}
                        {anxietyRiskLevel == 'unlikely' && <div className={styles.risk_level_unlikely}>{anxietyRiskScore}</div>}
                        <h3>Anxiety Risks</h3>
                        <h3>{anxietyRiskLevel.charAt(0).toUpperCase() + anxietyRiskLevel.slice(1)}</h3>
                      </div>

                      <div>
                        {ptsdRiskLevel == 'high' && <div className={styles.risk_level_high}>{ptsdRiskScore}</div>}
                        {ptsdRiskLevel == 'medium' && <div className={styles.risk_level_medium}>{ptsdRiskScore}</div>}
                        {ptsdRiskLevel == 'low' && <div className={styles.risk_level_low}>{ptsdRiskScore}</div>}
                        {ptsdRiskLevel == 'unlikely' && <div className={styles.risk_level_unlikely}>{ptsdRiskScore}</div>}
                        <h3>PTSD Risks</h3>
                        <h3>{ptsdRiskLevel.charAt(0).toUpperCase() + ptsdRiskLevel.slice(1)}</h3>
                      </div>

                      <div>
                        {bipolarRiskLevel == 'high' && <div className={styles.risk_level_high}>{bipolarRiskScore}</div>}
                        {bipolarRiskLevel == 'medium' && <div className={styles.risk_level_medium}>{bipolarRiskScore}</div>}
                        {bipolarRiskLevel == 'low' && <div className={styles.risk_level_low}>{bipolarRiskScore}</div>}
                        {bipolarRiskLevel == 'unlikely' && <div className={styles.risk_level_unlikely}>{bipolarRiskScore}</div>}
                        <h3>Bipolar Risks</h3>
                        <h3>{bipolarRiskLevel.charAt(0).toUpperCase() + bipolarRiskLevel.slice(1)}</h3>
                      </div>
                    </div>
                  </div>

                  <div className={styles.scores_section} style={{ width: '370px' }}>
                    <h2 style={{ fontWeight: '500' }}>Functional Impairments</h2>

                    <div className={styles.functional_impairments}>
                      <div>
                        {thoughtsOfSuicideAnswer == 0 && <div className={styles.risk_level_unlikely}></div>}
                        {thoughtsOfSuicideAnswer == 1 && <div className={styles.risk_level_unlikely}></div>}
                        {thoughtsOfSuicideAnswer == 2 && <div className={styles.risk_level_low}></div>}
                        {thoughtsOfSuicideAnswer == 3 && <div className={styles.risk_level_medium}></div>}
                        {thoughtsOfSuicideAnswer == 4 && <div className={styles.risk_level_high}></div>}
                        
                        <p>Thoughts of suicide</p>

                        {thoughtsOfSuicideAnswer == 0 && <p>None</p>}
                        {thoughtsOfSuicideAnswer == 1 && <p>Rarely</p>}
                        {thoughtsOfSuicideAnswer == 2 && <p>Sometimes</p>}
                        {thoughtsOfSuicideAnswer == 3 && <p>Often</p>}
                        {thoughtsOfSuicideAnswer == 4 && <p>Most of the time</p>}
                      </div>

                      <div>
                        {impairsWorkSchoolAnswer == 0 && <div className={styles.risk_level_unlikely}></div>}
                        {impairsWorkSchoolAnswer == 1 && <div className={styles.risk_level_unlikely}></div>}
                        {impairsWorkSchoolAnswer == 2 && <div className={styles.risk_level_low}></div>}
                        {impairsWorkSchoolAnswer == 3 && <div className={styles.risk_level_medium}></div>}
                        {impairsWorkSchoolAnswer == 4 && <div className={styles.risk_level_high}></div>}
                        
                        <p>Impairs work/school</p>

                        {impairsWorkSchoolAnswer == 0 && <p>None</p>}
                        {impairsWorkSchoolAnswer == 1 && <p>Rarely</p>}
                        {impairsWorkSchoolAnswer == 2 && <p>Sometimes</p>}
                        {impairsWorkSchoolAnswer == 3 && <p>Often</p>}
                        {impairsWorkSchoolAnswer == 4 && <p>Most of the time</p>}
                      </div>

                      <div>
                        {impairsFriendsFamilyAnswer == 0 && <div className={styles.risk_level_unlikely}></div>}
                        {impairsFriendsFamilyAnswer == 1 && <div className={styles.risk_level_unlikely}></div>}
                        {impairsFriendsFamilyAnswer == 2 && <div className={styles.risk_level_low}></div>}
                        {impairsFriendsFamilyAnswer == 3 && <div className={styles.risk_level_medium}></div>}
                        {impairsFriendsFamilyAnswer == 4 && <div className={styles.risk_level_high}></div>}
                        
                        <p>Impairs friends/family</p>

                        {impairsFriendsFamilyAnswer == 0 && <p>None</p>}
                        {impairsFriendsFamilyAnswer == 1 && <p>Rarely</p>}
                        {impairsFriendsFamilyAnswer == 2 && <p>Sometimes</p>}
                        {impairsFriendsFamilyAnswer == 3 && <p>Often</p>}
                        {impairsFriendsFamilyAnswer == 4 && <p>Most of the time</p>}
                      </div>

                      <div>
                        {ledToUsingAlcoholAnswer == 0 && <div className={styles.risk_level_unlikely}></div>}
                        {ledToUsingAlcoholAnswer == 1 && <div className={styles.risk_level_unlikely}></div>}
                        {ledToUsingAlcoholAnswer == 2 && <div className={styles.risk_level_low}></div>}
                        {ledToUsingAlcoholAnswer == 3 && <div className={styles.risk_level_medium}></div>}
                        {ledToUsingAlcoholAnswer == 4 && <div className={styles.risk_level_high}></div>}
                        
                        <p>Led to using alcohol</p>

                        {ledToUsingAlcoholAnswer == 0 && <p>None</p>}
                        {ledToUsingAlcoholAnswer == 1 && <p>Rarely</p>}
                        {ledToUsingAlcoholAnswer == 2 && <p>Sometimes</p>}
                        {ledToUsingAlcoholAnswer == 3 && <p>Often</p>}
                        {ledToUsingAlcoholAnswer == 4 && <p>Most of the time</p>}
                      </div>

                      <div>
                        {ledToUsingDrugAnswer == 0 && <div className={styles.risk_level_unlikely}></div>}
                        {ledToUsingDrugAnswer == 1 && <div className={styles.risk_level_unlikely}></div>}
                        {ledToUsingDrugAnswer == 2 && <div className={styles.risk_level_low}></div>}
                        {ledToUsingDrugAnswer == 3 && <div className={styles.risk_level_medium}></div>}
                        {ledToUsingDrugAnswer == 4 && <div className={styles.risk_level_high}></div>}
                        
                        <p>Led to using drugs</p>

                        {ledToUsingDrugAnswer == 0 && <p>None</p>}
                        {ledToUsingDrugAnswer == 1 && <p>Rarely</p>}
                        {ledToUsingDrugAnswer == 2 && <p>Sometimes</p>}
                        {ledToUsingDrugAnswer == 3 && <p>Often</p>}
                        {ledToUsingDrugAnswer == 4 && <p>Most of the time</p>}
                      </div>
                    </div>
                  </div>

                  <div className={styles.scores_section} style={{ width: '370px' }}>
                    <h2 style={{ fontWeight: '500', marginBottom: '35px' }}>Questions</h2>

                    <div className={styles.questions}>
                      <div>
                        <div>
                          <h3>Most of the time ({mostOfTheTimeAnswerCount})</h3>
                        </div>

                        <div>
                          <h3>Often ({oftenAnswerCount})</h3>
                        </div>

                        <div>
                          <h3>Sometimes ({sometimesAnswerCount})</h3>
                        </div>

                        <div>
                          <h3>Rarely ({rarelyAnswerCount})</h3>
                        </div>

                        <div>
                          <h3>None ({noneAnswerCount})</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> 
              )}

              {/* <div className={styles.report_content_item} key={'report_content_paid_scores_wrap'}>
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