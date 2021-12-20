import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from '@/styles/Auth.module.css'
import profileStyles from '@/styles/Profile.module.css'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import { useAuth } from '@/context/AuthUserContext'
import MoonLoader from "react-spinners/MoonLoader"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';

import Alert from '@mui/material/Alert'

export default function ResetPassword(props) {
  const router = useRouter()

  const { authUser } = useAuth()

  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
  const hasNumber = /\d/

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)

  const [isMinChar, setIsMinChar] = useState(false)
  const [isOneDigit, setIsOneDigit] = useState(false)
  const [isSpecialChar, setIsSpecialChar] = useState(false)
  const [isMatch, setIsMatch] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(true)

  const [code, setCode] = useState('')

  const { verifyPasswordResetCode, confirmPasswordReset } = useAuth()


  useEffect(() => {
    if (router.query && router.query.oobCode) {
      setCode(router.query.oobCode)
    }
  }, [error, router])

  useEffect(() => {
    if (isPasswordReset) {
      setPassword('')
      setError(null)
      setCode('')
    }
  }, [isPasswordReset])

  const handleResetPassword = e => {
    e.preventDefault()

    setBtnDisabled(true)

    if (password != passwordConfirmation) {
      setError('Your password does not match.')
      return false
    }

    setIsSending(true)

    if ((code != '') && (password != '')) {
      verifyPasswordResetCode(code)
        .then(function(email) {
          confirmPasswordReset(code, password)
            .then(() => {
              setIsPasswordReset(true)
              checkPass()
            })
          
          setIsSending(false)
        })
        .catch(function() {
          setError('Invalid code.')
          setIsSending(false)
          checkPass()
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
      {authUser && (
        <div className={profileStyles.profileWrapper}>
          <div className={profileStyles.profileInnerWrapper}>
            <div className={profileStyles.profileInnerHeader}>
              <Link href="/profile"><a>← Go Back</a></Link>
              <h1>Reset Password</h1>
            </div>

            <div className={profileStyles.profileInnerPage}>
              <form onSubmit={handleResetPassword}>
                {!isPasswordReset && (
                  <>
                    <div className={profileStyles.subscriptionInnerPage}>
                      <div 
                        className={profileStyles.formItem} 
                        style={{ marginBottom: '12px' }}
                      >
                        <FormLabel htmlFor="password">NEW PASSWORD</FormLabel>
                        
                        <TextField 
                          type="password" 
                          id="password" 
                          className={error && styles.hasError} 
                          value={password} 
                          onChange={e => {
                            setPassword(e.target.value)
                            checkPass(e.target.value, passwordConfirmation)
                          }} 
                          fullWidth={true}
                          size={"small"}
                          error={error}
                          helperText={error ? error : ''}
                          required
                        />
                      </div>

                      <div 
                        className={profileStyles.formItem} 
                        style={{ marginBottom: '12px' }}
                      >
                        <FormLabel htmlFor="confirm-password">CONFIRM NEW PASSWORD</FormLabel>

                        <TextField 
                          type="password" 
                          id="confirm-password" 
                          className={error && styles.hasError} 
                          value={passwordConfirmation} 
                          onChange={e => {
                            setPasswordConfirmation(e.target.value)
                            checkPass(password, e.target.value)
                          }} 
                          fullWidth={true}
                          size={"small"}
                          error={error}
                          helperText={error ? error : ''}
                          required
                        />
                      </div>

                      {
                        password.length > 0 ? 

                        <div className={styles.passwordChecker}>
                          <FormGroup>
                            <FormControlLabel 
                              className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isMinChar ? 'grayIsChecked' : ''}`}
                              control={<Checkbox  checked={isMinChar} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                              label={"Minimum 8 characters long"}
                            />

                            <FormControlLabel 
                              className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isOneDigit ? 'grayIsChecked' : ''}`}
                              control={<Checkbox checked={isOneDigit} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                              label={"1 Digit"}
                            />

                            <FormControlLabel
                              className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isSpecialChar ? 'grayIsChecked' : ''}`}
                              control={<Checkbox checked={isSpecialChar} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                              label={"1 special character (%$#@!&*)"}
                            />

                            <FormControlLabel
                              className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isMatch ? 'grayIsChecked' : ''}`}
                              control={<Checkbox checked={isMatch} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                              label={"Confirm password matches"}
                            />
                          </FormGroup>
                        </div> : ''
                      }
                    </div>
                    
                    <div className={profileStyles.button_wrapper}>
                      <Button 
                        size="large" 
                        variant="contained"
                        type="submit" 
                        disabled={btnDisabled}
                      >
                        {isSending && (
                          <>PLEASE WAIT</>
                        )}

                        {!isSending && (
                          <>SUBMIT</>
                        )}
                      </Button>
                    </div>
                  </>
                )}

                {isPasswordReset && (
                  <Alert severity="success" style={{ marginTop: '20px' }}>Your password has been changed successfully.</Alert>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    
      {!authUser && (
        <div className={`${styles.container} auth_page_wrapper`}>
          <div className={styles.authBg}></div>

          <div className={styles.authForm}>
            <div className={styles.authFormInner}>
              <img  
                src="/mooditude-logo.png" 
                width="113" 
                height="113" 
                alt="Mooditude"
                className={styles.login_logo}
              />

              <div 
                className={styles.headingContainer} 
                style={{
                  marginBottom: '20px'
                }}
              >
                <h1 className={styles.heading}>Reset Password</h1>
              </div>

              <div>
                <form onSubmit={handleResetPassword}>
                  {!isPasswordReset && (
                    <>
                      <div 
                        className={styles.field} 
                        style={{ marginBottom: '12px' }}
                      >
                        <TextField 
                          label="New password" 
                          variant="outlined" 
                          type="password" 
                          id="password" 
                          className={error && styles.hasError} 
                          placeholder="Enter new password" 
                          value={password} 
                          onChange={e => {
                            setPassword(e.target.value)
                            checkPass(e.target.value, passwordConfirmation)
                          }} 
                          fullWidth={true}
                          size={"small"}
                          error={error}
                          helperText={error ? error : ''}
                          required
                        />
                      </div>

                      <div 
                        className={styles.field} 
                        style={{ marginBottom: '12px' }}
                      >
                        <TextField 
                          label="Confirm new password" 
                          variant="outlined" 
                          type="password" 
                          id="new-password" 
                          className={error && styles.hasError} 
                          placeholder="Enter new password confirmation" 
                          value={passwordConfirmation} 
                          onChange={e => {
                            setPasswordConfirmation(e.target.value)
                            checkPass(password, e.target.value)
                          }} 
                          fullWidth={true}
                          size={"small"}
                          error={error}
                          helperText={error ? error : ''}
                          required
                        />
                      </div>

                      {
                        password.length > 0 ? 

                        <div className={styles.passwordChecker}>
                          <FormGroup>
                            <FormControlLabel 
                              className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isMinChar ? 'grayIsChecked' : ''}`}
                              control={<Checkbox  checked={isMinChar} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                              label={"Minimum 8 characters long"}
                            />

                            <FormControlLabel 
                              className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isOneDigit ? 'grayIsChecked' : ''}`}
                              control={<Checkbox checked={isOneDigit} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                              label={"1 Digit"}
                            />

                            <FormControlLabel
                              className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isSpecialChar ? 'grayIsChecked' : ''}`}
                              control={<Checkbox checked={isSpecialChar} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                              label={"1 special character (%$#@!&*)"}
                            />

                            <FormControlLabel
                              className={`${styles.privacyPolicyText} ${styles.privacyPolicyTextInput} grayCheck ${isMatch ? 'grayIsChecked' : ''}`}
                              control={<Checkbox checked={isMatch} onChange={checkPass} icon={<CheckCircleRoundedIcon />} checkedIcon={<CheckCircleRoundedIcon  />} sx={{color: '##A8B5C1', '&.Mui-checked': {color: '#F8E71C'}}} />} 
                              label={"Confirm password matches"}
                            />
                          </FormGroup>
                        </div> : ''
                      }

                      <div>
                        <button
                          type="submit" 
                          disabled={btnDisabled}
                        >
                          {isSending && (
                            <>PLEASE WAIT</>
                          )}

                          {!isSending && (
                            <>SUBMIT</>
                          )}
                        </button>
                      </div>
                    </>
                  )}

                  {isPasswordReset && (
                    <div style={{ marginBottom: '20px' }}>Your password has been changed successfully.</div>
                  )}

                  <div>
                    <span>&larr; Back to</span>
                    {' '}
                    <Link href="/auth/login">
                      <a>Log In</a>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>     
        </div>
      )}
    </Layout>
  )
}