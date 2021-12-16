import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Profile.module.css'

import { useAuth } from '@/context/AuthUserContext'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import GridLoader from "react-spinners/GridLoader"
import Firebase from 'lib/Firebase'
import TextField from '@mui/material/TextField'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import MoonLoader from "react-spinners/MoonLoader"
import { FormLabel } from '@mui/material';

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

export default function OnboardingWelcomePage() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [checking, setChecking] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [name, setName] = useState('')


  const [error, setError] = useState('')


  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser) {
      firebaseStore
        .collection('Subscribers')
        .doc(authUser.uid)
        .get()
        .then(doc => {
          if (doc && doc.data()) {
            doc.data().grant && setLicenseType(doc.data().grant.licenseType)
          }

          setChecking(false)
        })
    }
  }, [authUser])


  
  return (
    <Layout title={`Buy | ${SITE_NAME}`}>
      {
        checking ? 
          <div 
            className={styles.custom_loader} 
            style={{
              position: 'absolute',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              background: '#fff',
              zIndex: 10
            }}
          >
            <MoonLoader color={'#1CA566'} loading={true} size={30} />
          </div>
        : 
        <>
          
          <div className={styles.profileWrapper}>
              <div className={styles.profileInnerWrapper}>
                <div className={styles.profileInnerHeader}>
                  <h1>Profile</h1>
                  <h4>Join Date: 11/01/2021</h4>
                </div>
                <div className={styles.profileInnerMain}>
                  <div className={styles.profileInnerLeft}>
                    <div className={styles.profilePicture}>
                      <img src="/default_profile.svg" />
                    </div>

                    <div className={styles.profileStars}>
                      <div>
                        <img src="/star1.svg" />
                      </div>
                      <div>
                        <img src="/star2.svg" />
                      </div>
                      <div>
                        <img src="/star3.svg" />
                      </div>
                    </div>  

                    <div className={styles.profileDetails}>
                      <h2>Kamran Qamar</h2>
                      <p>kamraan@gmail.com</p>
                      <p>Premium — Expires 05/05/2020 </p>
                    </div>  

                    <div className={styles.profileButtons}>
                      <Link href="/profile/subscription">
                      <Button 
                        type="submit"
                        size="large" 
                        
                      >
                        MANAGE SUBSCRIPTION
                      </Button>
                      </Link>
                      
                      <Button 
                        type="submit"
                        size="large" 
                      >
                        LOG OUT
                      </Button>
                      <Link href="/profile/reset-password">
                      <Button 
                        type="submit"
                        size="large" 
                      >
                        RESET PASSWORD
                      </Button>
                       </Link>
                       <Link href="/profile/delete">
                      <Button 
                        type="submit"
                        size="large" 
                      >
                        DELETE ACCOUNT
                      </Button>
                       </Link>
                    </div>  
                  </div>
                  <div className={styles.profileInnerRight}>
                    <div className={styles.formItem}>
                      <FormLabel>NAME</FormLabel>
                      <TextField 
                        type="text" 
                        fullWidth={true}
                        size={"small"}
                        
                      />
                    </div>

                    

                    <div className={styles.formItem}>
                      <FormLabel>Challenges</FormLabel>
                      <TextField 
                        type="text" 
                        fullWidth={true}
                        size={"small"}
                        
                      />
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>GOING TO THERAPY</FormLabel>
                      <TextField 
                        type="text" 
                        fullWidth={true}
                        size={"small"}
                        
                      />
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>AGE GROUP</FormLabel>
                      <TextField 
                        type="text" 
                        fullWidth={true}
                        size={"small"}
                        
                      />
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>GENDER</FormLabel>
                      <TextField 
                        type="text" 
                        fullWidth={true}
                        size={"small"}
                        
                      />
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>Phone</FormLabel>
                      <TextField 
                        type="text" 
                        fullWidth={true}
                        size={"small"}
                        
                      />
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>veteran status</FormLabel>
                      <TextField 
                        type="text" 
                        fullWidth={true}
                        size={"small"}
                        
                      />
                    </div>

                    <div className={styles.button_wrapper}>
                      <Button 
                        size="large" 
                        className={styles.normal_btn}
                      >
                        Edit
                      </Button>
                    </div>

                  </div>
                </div>
              </div>
          </div>
        </>
      }
      
    </Layout>
  )
}