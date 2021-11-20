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

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()


  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])



  return (
    <Layout title={`Get Started | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper}`}>
        <div className={`${styles.assessment_wrap} ${styles.report_page}`}>
          <div className={styles.white_wrap}>
            <h1>Your Mental <br/>Wellbeing Score</h1>
            <p className={styles.date_text}>July 12, 2021</p> 

            <div className={styles.rating_wrap}>
              <div className={styles.rating_outer_wrap}>
                <div className={styles.rating_inner_wrap}>
                  76
                </div> 
              </div> 
            </div> 

            <h2>High Risk</h2>
            <p>Score of 76 shows that you have high risk of mental health condition. </p>
            <div className={styles.scale_img_wrap}>
              <img src="/Scale.png" />
            </div>
          </div>
          <div className={styles.report_right_wrap}>
            <div className={styles.report_btns_wrapper}>
                <a href="#" className={styles.active} onClick={() => {setContentShow()}}>REPORT</a>


                {/*
                use for later w functions
                <a href="#" onClick={() => {setContentShow('report_content_paid_scores_wrap')}}>SCORES</a>
                <a href="#" onClick={() => {setContentShow('report_content_download_wrap')}}>DOWNLOAD</a>*/}
            </div>
            <div className={styles.report_content_wrap}>
              <div className={`${styles.report_content_item} ${styles.active}`} key={'report_content_free_wrap'}>

                <div className={styles.normal_text_wrap}>
                  <p>Your responses have been analyzed and compared to the responses of other individuals with and without mood and anxiety disorders. </p>  
                  <p>Your score of 76 is in the medium range as compared to individuals already known to be suffering from a mood or anxiety disorder. </p>  
                  <p>This is cause for real concern, as it indicates your symptoms are impacting your life and general health. We recommend that you pursue a further discussion of your results with a physician or mental health provider.  </p>  
                  <p>Read carefully the information and recommendations below concerning your risk of each of the four conditions described.</p>
                </div>

                <div className={styles.bold_text_wrap}>
                  <h3>Buy Mooditude Premium </h3>
                  <p>Get your complete report that shows your risk for Depression, an Anxiety Disorder, Bipolar Disorder, and Post Traumatic Stress Disorder. And track your symptoms overtime to get a complete picture of your mental health.</p>
                </div>


                <Button 
                  size="large" 
                  className={styles.report_btn} 
                  variant="contained" 
                  
                >BUY MOODITUDE PREMIUM</Button>

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