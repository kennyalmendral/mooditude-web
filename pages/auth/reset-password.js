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

  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)

  const [code, setCode] = useState('')

  const { verifyPasswordResetCode, confirmPasswordReset } = useAuth()

  useEffect(() => {
    setTimeout(() => {
      props.removePageLoader()
    },300)
  }, [])

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

    setIsSending(true)

    if ((code != '') && (password != '')) {
      verifyPasswordResetCode(code)
        .then(function(email) {
          confirmPasswordReset(code, password)
            .then(() => {
              setIsPasswordReset(true)
            })
          
          setIsSending(false)
        })
        .catch(function() {
          setError('Invalid code.')
          setIsSending(false)
        })
    }
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
                        onChange={e => setPassword(e.target.value)} 
                        fullWidth={true}
                        size={"small"}
                        error={error}
                        helperText={error ? error : ''}
                        required
                      />
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
    </Layout>
  )
}