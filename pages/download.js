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

  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      setIsMobileView(true)
    } else {
      setIsMobileView(false)
    }
  }, [])

  return (
    <Layout title={`Download | ${SITE_NAME}`}>
      <div className={styles.download_wrapper}>
        <div className={`${styles.download_inner_wrapper} ${styles.download_main_wrap}` }>
          <div>
            <img src="/iphones.svg" />
          </div>

          <h1>Take Control of Your Mental Health <br/>with Mooditude Apps</h1>

          <div className={styles.gray_apps}>
            <a href="https://apps.apple.com/us/app/mooditude-cbt-therapy/id1450661800" target="_blank"><img src="/apple.svg" alt="" /></a>
            <a href="https://play.google.com/store/apps/details?id=com.health.mental.mooditude" target="_blank"><img src="/android.svg" alt="" /></a>
          </div>

          <div className={styles.item_list}>
            <div>
              <p><img src="/check-icon.svg" /> <span>Understand your symptoms with <br/> unlimited Assessments &amp; Reporting</span></p>
              <p><img src="/check-icon.svg" /> <span>Change the way you feel with CBT <br/>Courses &amp; Exercises</span></p>
              <p><img src="/check-icon.svg" /> <span>Feel happy daily with goals and habit <br/>building routines</span></p>
            </div>
            <div>
              <p><img src="/check-icon.svg" /><span> Take care of yourself with over <br/>800 minutes of self-care activities</span></p>
              <p><img src="/check-icon.svg" /> <span>Discuss and get advice in 24/7 supportive  <br/>community moderated by experts</span></p>
              <p><img src="/check-icon.svg" /> <span>Track how your lifestyle changes are <br/>affecting your mental health overtime</span></p>
            </div>
          </div>

          {!isMobileView && (
            <div className={styles.qr_code}>
              <img src="/barcode.svg" />
            </div>
          )}

          <div className={styles.green_apps}>
            <a href="https://apps.apple.com/us/app/mooditude-cbt-therapy/id1450661800" target="_blank"><img src="/appstore.svg" alt="" /></a>
            <a href="https://play.google.com/store/apps/details?id=com.health.mental.mooditude" target="_blank"><img src="/googleplay.svg" alt="" /></a>
          </div>

          <p className={styles.footer_text}>After downloading, login with existing account.</p>
        </div>
      </div>
    </Layout>
  )
}