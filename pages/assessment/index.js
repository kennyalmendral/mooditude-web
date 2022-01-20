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

export default function AssessmentWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  const handleStart = () => {
    localStorage.getItem(`${authUser.uid}_currentAssessmentStep`) === null && localStorage.setItem(`${authUser.uid}_currentAssessmentStep`, 0) 

    router.push(`/assessment/1`)
  }

  return (
    <Layout title={`Get Started | ${SITE_NAME}`}>
      <div className={`${styles.onboarding_wrapper} ${styles.with_gray}`}>
        <div className={`${styles.assessment_wrap} ${styles.welcome_page}`}>
          <div className={styles.white_wrap}>
            <div>
              <img src="/welcome.png" alt="" className={styles.onboarding_inner_logo}/>
            </div>
            
           <h1>Assess Your <br/>Wellbeing Score</h1>
            
            <p>You are about to take a 3-minute mental health assessment that effectively measures the pulse of your mental wellbeing.</p>

            <p>Please read each statement carefully and select a choice that indicates how that statement applied to you OVER THE PAST TWO WEEKS. </p>

            <p>There are no right or wrong answers. Take your time.</p>

            <div className={styles.btn_wrap}>
              <Stack direction="row" spacing={2}>
                <Button 
                  size="large" 
                  variant="contained" 
                  // onClick={() => router.push(`/assessment/1`)}
                  onClick={handleStart}
                >
                  Start
                </Button>
              </Stack>
            </div>
          </div>
          <div className={styles.gray_wrap}>
            <div>
              <img src="/m3information.png" alt="" />
            </div>
            <h2>Science Behind the <br /> Assessment</h2>
            <div>
              <p>This assessment — M3 Checklist — is a 3-minute mental health symptom assessment tool designed by experts from the National Institute for Mental Health, Boston University, Columbia University, and Weill Cornell Medicine, and validated by researchers from the University of North Carolina, and published in the Annals of Family Medicine in 2010. </p>

              <p>It efficiently measures the pulse of your mental well-being, by combining common symptom areas — depression, bipolar, anxiety, and posttraumatic stress disorders — with substance use and functional impairments to produce a set of mental health vital signs that can be tracked over time to measure progress.</p>

              <p>
                REFERENCE:
                <br />
                Title: Feasibility and Diagnostic Validity of the M-3 Checklist: A Brief, Self-Rated Screen for Depressive, Bipolar, Anxiety, and Post-Traumatic Stress Disorders in Primary Care  
              </p>
              
              <p>
                Journal: Annals of Family Medicine <br />
                Authors: Bradley N. Gaynes, MD, MPH; Joanne DeVeaugh-Geiss, MA, LPA; Sam Weir, MD; Hongbin Gu, PhD; Cora MacPherson, PhD; Herbert C. Schulberg, PhD, MSHyg; Larry Culpepper, MD, MPH; and David R. Rubinow, MD.  
              </p>

              <p>
              <a target="_blank" href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2834723/">https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2834723/</a>
              </p>
              
            </div>  
          </div>
        </div>
      </div>
    </Layout>
  )
}