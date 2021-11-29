import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Onboarding.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import faker from 'faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [name, setName] = useState('')
  
  useEffect(() => {
    let usersRef
    let unsubscribe

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        firebaseDatabase
          .ref()
          .child('users')
          .child(user.uid)
          .on('value', snapshot => {

          }, error => {
            console.log(error)
          })

        usersRef = firebaseStore.collection('Users').doc(user.uid)

        unsubscribe = usersRef
          .get()
          .then(doc => {

            doc.data() && setName(doc.data().name)
          })
      } else {
        unsubscribe && unsubscribe()
      }
    })
  }, [])

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])



  return (
    <Layout title={`Welcome | ${SITE_NAME}`}>
      <div className={styles.onboarding_wrapper}>
        <div className={`${styles.onboarding_inner_wrapper} ${styles.welcome_page}`}>
        <Bar options={options} data={data} />
          
          {name && (
            <h1>Welcome, {name}</h1>  
          )}

          {!name && (
            <h1>Welcome!</h1>  
          )}
          
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
        </div>
      </div>
    </Layout>
  )
}