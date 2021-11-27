import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from '@/styles/Auth.module.css'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import { useAuth } from '@/context/AuthUserContext'
import TextField from '@mui/material/TextField';

export default function ResetPassword(props) {
  const router = useRouter()
  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  const hasNumber = /\d/;  
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [isResetPasswordEmailSent, setIsResetPasswordEmailSent] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const { sendPasswordResetEmail } = useAuth()
  const [isMinChar, setIsMinChar] = useState(false)
  const [isOneDigit, setIsOneDigit] = useState(false)
  const [isSpecialChar, setIsSpecialChar] = useState(false)
  const [isMatch, setIsMatch] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(true)


  const checkPass = (p1 = '', p2 = '') => {
    
    p1 = p1 == '' ? newPassword : p1
    p2 = p2 == '' ? confirmNewPassword : p2
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


  useEffect(() => {
    setTimeout(() => {
      props.removePageLoader()
    },300)
    
  }, [])


  const handleResetPassword = e => {
    e.preventDefault()
    setBtnDisabled(true)
    if (newPassword != confirmNewPassword) {
      setError('Your new password does not match.')
      return false
    }

    setIsSending(true)

    sendPasswordResetEmail(email)
      .then(response => {
        setIsSending(false)
        setIsResetPasswordEmailSent(true)
        checkPass()
      })
      .catch(error => {
        setIsSending(false)
        setIsResetPasswordEmailSent(false)
        setError(error.message)
        checkPass()
      })
  }

  return (
    <Layout title={`Reset Password | ${SITE_NAME}`}>
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
                {!isResetPasswordEmailSent && (
                  <>
                    <div 
                      className={styles.field} 
                      style={{ marginBottom: '12px' }}
                    >
                      <TextField 
                        type="password" 
                        id="o_password" 
                        label="Old Password" 
                        value={oldPassword} 
                        onChange={e => setOldPassword(e.target.value)} 
                        required
                        fullWidth={true}
                        size={"small"}
                        error={error}
                        helperText={error ? 'Invalid email or password' : ''}
                      />


                      {/*{error && (
                        <div className={styles.error}>
                          {error && <span>{error}</span>}
                        </div>
                      )}*/}
                    </div>

                    <div 
                      className={styles.field} 
                      style={{ marginBottom: '12px' }}
                    >

                      <TextField 
                        type="password" 
                        id="n_password" 
                        label="New Password" 
                        value={newPassword} 
                        onChange={e => {setNewPassword(e.target.value);checkPass(e.target.value, newPassword)}} 
                        required
                        fullWidth={true}
                        size={"small"}
                        error={error}
                        helperText={error ? 'Invalid email or password' : ''}
                      />


                      {/*{error && (
                        <div className={styles.error}>
                          {error && <span>{error}</span>}
                        </div>
                      )}*/}
                    </div>

                    <div 
                      className={styles.field} 
                      style={{ marginBottom: '12px' }}
                    >
  

                      <TextField 
                        type="password" 
                        id="c_n_password" 
                        label="Confirm New Password" 
                        value={confirmNewPassword} 
                        onChange={e => {setConfirmNewPassword(e.target.value);checkPass(e.target.value, confirmNewPassword)}} 
                        required
                        fullWidth={true}
                        size={"small"}
                        error={error}
                        helperText={error ? 'Invalid email or password' : ''}
                      />


                      {/*{error && (
                        <div className={styles.error}>
                          {error && <span>{error}</span>}
                        </div>
                      )}*/}
                    </div>

                    {
                      newPassword.length > 0 ? 

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

                {isResetPasswordEmailSent && (
                  <div style={{ marginBottom: '20px' }}>Your password is now updated.</div>
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
    </Layout>
  )
}