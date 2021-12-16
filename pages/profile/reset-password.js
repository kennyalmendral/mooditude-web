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
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';

export default function profileReset() {
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
    <Layout title={`Reset Password | ${SITE_NAME}`}>
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
                  <Link href="/profile"><a>← Go Back</a></Link>
                  <h1>Reset Password</h1>
                </div>
                <div className={styles.profileInnerPage}>
                  <div className={styles.subscriptionInnerPage}>
                    <div className={styles.formItem}>
                      <FormLabel>CURRENT PASSWORD</FormLabel>
                      <TextField 
                        type="password" 
                        fullWidth={true}
                        size={"small"}
                        
                      />
                    </div>

                    

                    <div className={styles.formItem}>
                      <FormLabel>NEW PASSWORD</FormLabel>
                      <TextField 
                        type="password" 
                        fullWidth={true}
                        size={"small"}
                        
                      />
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>CONFIRM PASSWORD</FormLabel>
                      <TextField 
                        type="password" 
                        fullWidth={true}
                        size={"small"}
                        
                      />
                    </div>


                    <div className={styles.passwordChecker}>

                      <FormGroup>
                        <FormControlLabel 
                          className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck `}
                          control={<Checkbox icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                          label={"Minimum 8 characters long"}
                        />

                        <FormControlLabel 

                          className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck `}
                          control={<Checkbox  icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                          label={"1 Digit"}
                        />

                        <FormControlLabel

                          className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck `}
                          control={<Checkbox  icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                          label={"1 special character (%$#@!&*)"}
                        />

                        <FormControlLabel

                          className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck `}
                          control={<Checkbox  icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                          label={"Confirm password matches"}
                        />

                      </FormGroup>
                      
                    </div>
                  </div>

                  <div className={styles.button_wrapper}>
                    <Button 
                      size="large" 
                      variant="contained"
                    >
                      Reset Password
                    </Button>
                  </div>
                </div>
              </div>
          </div>
        </>
      }
      
    </Layout>
  )
}