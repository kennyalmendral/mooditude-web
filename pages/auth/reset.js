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

  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [isResetPasswordEmailSent, setIsResetPasswordEmailSent] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const { sendPasswordResetEmail } = useAuth()

  useEffect(() => {
    setTimeout(() => {
      props.removePageLoader()
    },300)
    
  }, [])


  const handleResetPassword = e => {
    e.preventDefault()

    if (newPassword != confirmNewPassword) {
      setError('Your new password does not match.')
      return false
    }

    setIsSending(true)

    sendPasswordResetEmail(email)
      .then(response => {
        setIsSending(false)
        setIsResetPasswordEmailSent(true)
      })
      .catch(error => {
        setIsSending(false)
        setIsResetPasswordEmailSent(false)
        setError(error.message)
      })
  }

  return (
    <Layout title={`Reset Password | ${SITE_NAME}`}>
      <div className={styles.container}>
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
                        onChange={e => setNewPassword(e.target.value)} 
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
                        onChange={e => setConfirmNewPassword(e.target.value)} 
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

                    <div>
                      <button
                        type="submit" 
                        disabled={isSending && true}
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