import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Animation from '@mui/material/Grow';
import RingLoader from "react-spinners/RingLoader";

export default function Assessment1() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()
  

  const [profileStep1Answer, setProfileStep1Answer] = useState('')
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    // if (localStorage.getItem('currentProfileStep') !== null) {
    //   localStorage.setItem('currentProfileStep', 1)
    //   console.log(`Current profile step: ${localStorage.getItem('currentProfileStep')}`)
    // }

    // if (localStorage.getItem('profileStep1Answer') > 0) {
    //   setProfileStep1Answer(localStorage.getItem('profileStep1Answer'))
    // }
  }, [])

  // useEffect(() => {
  //   profileStep1Answer > 0 && console.log(`Profile step 1 answer: ${profileStep1Answer}`)
  // }, [profileStep1Answer])

  const handleNextStep = () => {
    setFormError(false)
    if (profileStep1Answer !== '') {
      // localStorage.setItem('profileStep1Answer', parseInt(profileStep1Answer))
      
      router.push('/assessment/31')
    } else {
      setFormError(true)
    }
  }

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