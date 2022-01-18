import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Download.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()

export default function OnboardingWelcomePage(props) {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()


  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  

  return (
    <Layout title={`Download | ${SITE_NAME}`}>
      <div className={styles.download_wrapper}>
        <div className={`${styles.download_inner_wrapper} ${styles.download_main_wrap}` }>
          <div>
            <img src="/d-main-image.svg" a/>
          </div>

          <h1>Take Control of Your Mental Health <br/>with Mooditude Apps</h1>

          <div className={styles.gray_apps}>
            <a href="https://apps.apple.com/us/app/mooditude-cbt-therapy/id1450661800" target="_blank"><img src="/d-apple-gray.svg" alt="" /></a>
            <a href="https://play.google.com/store/apps/details?id=com.health.mental.mooditude" target="_blank"><img src="/d-android-gray.svg" alt="" /></a>
          </div>

          <div className={styles.item_list}>
            <div>
              <p><img src="/check.png" /> <span>Understand your symptoms with <br/> unlimited Assessments & Reporting</span></p>
              <p><img src="/check.png" /> <span>Change the way you feel with CBT <br/>Courses & Exercises</span></p>
              <p><img src="/check.png" /> <span>Feel happy daily with goals and habit <br/>building routines</span></p>
            </div>
            <div>
              <p><img src="/check.png" /><span> Take care of yourself with over <br/>800 minutes of self-care activities</span></p>
              <p><img src="/check.png" /> <span>Discuss and get advice in 24/7 supportive  <br/>community moderated by experts</span></p>
              <p><img src="/check.png" /> <span>Track how your lifestyle changes are <br/>affecting your mental health overtime</span></p>
            </div>
          </div>

          <div className={styles.qr_code}>
            <img src="/d-image-qr.png" />
          </div>

          <div className={styles.green_apps}>
            <a href="https://apps.apple.com/us/app/mooditude-cbt-therapy/id1450661800" target="_blank"><img src="/d-apple-green.svg" alt="" /></a>
            <a href="https://play.google.com/store/apps/details?id=com.health.mental.mooditude" target="_blank"><img src="/d-android-green.svg" alt="" /></a>
          </div>

          <p className={styles.footer_text}>After downloading, login with exististing account.</p>
        </div>
      </div>
    </Layout>
  )
}