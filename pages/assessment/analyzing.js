import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Animation from '@mui/material/Grow';
import RingLoader from "react-spinners/RingLoader"

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()

export default function AssessmentAnalyzing() {
  const router = useRouter()

  const { authUser, loading } = useAuth()

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    let assessmentAnswers = [
      localStorage.getItem('assessmentStep1Answer'),
      localStorage.getItem('assessmentStep2Answer'),
      localStorage.getItem('assessmentStep3Answer'),
      localStorage.getItem('assessmentStep4Answer'),
      localStorage.getItem('assessmentStep5Answer'),
      localStorage.getItem('assessmentStep6Answer'),
      localStorage.getItem('assessmentStep7Answer'),
      localStorage.getItem('assessmentStep8Answer'),
      localStorage.getItem('assessmentStep9Answer'),
      localStorage.getItem('assessmentStep10Answer'),
      localStorage.getItem('assessmentStep11Answer'),
      localStorage.getItem('assessmentStep12Answer'),
      localStorage.getItem('assessmentStep13Answer'),
      localStorage.getItem('assessmentStep14Answer'),
      localStorage.getItem('assessmentStep15Answer'),
      localStorage.getItem('assessmentStep16Answer'),
      localStorage.getItem('assessmentStep17Answer'),
      localStorage.getItem('assessmentStep18Answer'),
      localStorage.getItem('assessmentStep19Answer'),
      localStorage.getItem('assessmentStep20Answer'),
      localStorage.getItem('assessmentStep21Answer'),
      localStorage.getItem('assessmentStep23Answer'),
      localStorage.getItem('assessmentStep24Answer'),
      localStorage.getItem('assessmentStep25Answer'),
      localStorage.getItem('assessmentStep26Answer'),
      localStorage.getItem('assessmentStep28Answer'),
      localStorage.getItem('assessmentStep29Answer'),
      localStorage.getItem('assessmentStep30Answer'),
      localStorage.getItem('assessmentStep31Answer'),
    ]

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        firebaseStore
          .collection('M3Assessment')
          .doc(user.uid)
          .collection('scores')
          .doc(new Date().getTime().toString())
          .set({
            rawData: assessmentAnswers.join(',')
          })
          .then(response => {
            localStorage.removeItem('assessmentStep1Answer')
            localStorage.removeItem('assessmentStep2Answer')
            localStorage.removeItem('assessmentStep3Answer')
            localStorage.removeItem('assessmentStep4Answer')
            localStorage.removeItem('assessmentStep5Answer')
            localStorage.removeItem('assessmentStep6Answer')
            localStorage.removeItem('assessmentStep7Answer')
            localStorage.removeItem('assessmentStep8Answer')
            localStorage.removeItem('assessmentStep9Answer')
            localStorage.removeItem('assessmentStep10Answer')
            localStorage.removeItem('assessmentStep11Answer')
            localStorage.removeItem('assessmentStep12Answer')
            localStorage.removeItem('assessmentStep13Answer')
            localStorage.removeItem('assessmentStep14Answer')
            localStorage.removeItem('assessmentStep15Answer')
            localStorage.removeItem('assessmentStep16Answer')
            localStorage.removeItem('assessmentStep17Answer')
            localStorage.removeItem('assessmentStep18Answer')
            localStorage.removeItem('assessmentStep19Answer')
            localStorage.removeItem('assessmentStep20Answer')
            localStorage.removeItem('assessmentStep21Answer')
            localStorage.removeItem('assessmentStep23Answer')
            localStorage.removeItem('assessmentStep24Answer')
            localStorage.removeItem('assessmentStep25Answer')
            localStorage.removeItem('assessmentStep26Answer')
            localStorage.removeItem('assessmentStep28Answer')
            localStorage.removeItem('assessmentStep29Answer')
            localStorage.removeItem('assessmentStep30Answer')
            localStorage.removeItem('assessmentStep31Answer')

            router.push('/assessment/report')
          })
          .catch(error => {
            console.log('error:', error)
          })
      }
    })
  }, [])

  return (
    <Layout title={`Analyzing your results | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={styles.onboarding_inner_wrapper}>
          <Animation direction="right" in={true} timeout={1000}>
            <div className={styles.custom_loader}>
              <RingLoader color={'#f8e71c'} loading={true}  size={250} />
              
              <p>Analyzing your responses...</p>
            </div>
          </Animation>
        </div>
      </div>
    </Layout>
  )
}