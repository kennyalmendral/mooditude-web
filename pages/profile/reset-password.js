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

export default function ProfilePasswordReset(props) {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [checking, setChecking] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
  const hasNumber = /\d/

  const [isSending, setIsSending] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)

  const [isMinChar, setIsMinChar] = useState(false)
  const [isOneDigit, setIsOneDigit] = useState(false)
  const [isSpecialChar, setIsSpecialChar] = useState(false)
  const [isMatch, setIsMatch] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(true)

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const [licenseType, setLicenseType] = useState('')

  const { confirmPasswordReset } = useAuth()

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser) {
      setChecking(false)
    }
  }, [authUser])

  const handleResetPassword = e => {
    e.preventDefault()

    setBtnDisabled(true)

    if (password != passwordConfirmation) {
      setError('Your password does not match.')
      return false
    }

    setIsSending(true)

    if (password != '') {
      confirmPasswordReset(code, password)
        .then(() => {
          setIsSending(false)
          setIsPasswordReset(true)
          checkPass()
        })
        .catch(err => {
          setIsSending(false)
          console.log(err)
        })
    }
  }

  const checkPass = (p1 = '', p2 = '') => {  
    p1 = p1 == '' ? password : p1
    p2 = p2 == '' ? passwordConfirmation : p2

    if (p1.length >= 8) {
      setIsMinChar(true)
    }else{
      setIsMinChar(false)
    }

    if (hasNumber.test(p1)) {
      setIsOneDigit(true)
    }else{
      setIsOneDigit(false)
    }

    if (specialChars.test(p1)) {
      setIsSpecialChar(true)
    }else{
      setIsSpecialChar(false)
    }

    if (p1.length > 1 && p1 == p2) {
      setIsMatch(true)
    }else{
      setIsMatch(false)
    }

    if (p1.length >= 8 && hasNumber.test(p1) && specialChars.test(p1) && p1 == p2 ) {
      setBtnDisabled(false)
    }else{
      setBtnDisabled(true)
    }  
  }
  
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
                  <h4>ACCOUNT</h4>
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
                      style={{
                        fontSize: '18px',
                        fontWeight: '600'
                      }}
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