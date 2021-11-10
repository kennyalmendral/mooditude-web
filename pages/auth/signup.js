import { useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

import styles from '@/styles/Auth.module.css'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import { useAuth } from '@/context/AuthUserContext'

export default function SignUp() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isPrivacyPolicyChecked, setIsPrivacyPolicyChecked] = useState(false)
  const [error, setError] = useState(null)

  const { createUserWithEmailAndPassword } = useAuth()

  const handleSignUp = e => {
    e.preventDefault()

    setError(null)

    if (password === passwordConfirmation) {
      createUserWithEmailAndPassword(email, password)
        .then(authUser => {
          console.log('Success! The user has been created.')

          router.push('/account')
        })
        .catch(error => {
          setError(error.message)
        })
    } else {
      setError('Password do not match.')
    }
  }

  return (
    <Layout title={`Join ${SITE_NAME} | ${SITE_NAME}`}>
      <div className={styles.container}>
        <div className={styles.authBg}></div>

        <div className={styles.authForm}>
          <div className={styles.authFormInner}>
            <Image 
              src="/mooditude-logo.png" 
              width="113" 
              height="113" 
              alt="Mooditude"
            />

            <div className={styles.headingContainer}>
              <div>
                <h1 className={styles.heading}>Join {SITE_NAME}</h1>
                <h4 className={styles.subHeading}>You deserve to be happy!</h4>
              </div>
              
              <div>
                <Link href="/auth/login">
                  <a>Log In</a>
                </Link>
              </div>
            </div>

            <div>
              <form onSubmit={handleSignUp}>
                <div>
                  {error && (
                    <div className={styles.errorAlert}>
                      {error && <span>{error}</span>}
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <input 
                    type="text" 
                    id="name" 
                    placeholder="Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required
                  />
                </div>

                <div className={styles.field}>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="Email address" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                  />
                </div>

                <div className={styles.field}>
                  <input 
                    type="password" 
                    id="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                  />
                </div>

                <div className={styles.passwordNotice}>
                  Password should be 8 characters long and include a Capital letter, a number, and a special character.
                </div>

                <div className={styles.field}>
                  <input 
                    type="password" 
                    id="password-confirmation" 
                    placeholder="Confirm Password" 
                    value={passwordConfirmation} 
                    onChange={e => setPasswordConfirmation(e.target.value)} 
                    required
                  />
                </div>

                <div className={styles.privacyPolicy}>
                  <input 
                    type="checkbox" 
                    id="privacy-policy" 
                    checked={isPrivacyPolicyChecked} 
                    onChange={e => setIsPrivacyPolicyChecked(!isPrivacyPolicyChecked)}
                  />
                  
                  <label htmlFor="privacy-policy">
                    I agree with the
                    {' '}
                    <Link href="#">
                      <a>Terms &amp; Privacy Policy</a>
                    </Link>
                  </label>
                </div>

                <div>
                  <button 
                    type="submit" 
                    disabled={!isPrivacyPolicyChecked && true}
                  >
                    SIGN UP
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}