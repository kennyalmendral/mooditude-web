import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

import styles from '@/styles/Auth.module.css'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import { useAuth } from '@/context/AuthUserContext'

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const { authUser, loading, signInWithEmailAndPassword } = useAuth()

  useEffect(() => {
    if (loading && authUser) {
      router.push('/account')
    }
  }, [authUser, loading])

  const handleLogin = e => {
    e.preventDefault()

    setError(null)

    signInWithEmailAndPassword(email, password)
      .then(authUser => {
        router.push('/account')
      })
      .catch(error => {
        setError(error.message)
      })
  }

  return (
    <Layout title={`Login | ${SITE_NAME}`}>
      <div className={styles.container}>
        <div className={styles.authBg}></div>

        <div className={styles.authForm}>
          <div className={styles.authFormInner}>
            <Image 
              src="/mooditude-logo.png" 
              width="113" 
              height="113"
            />

            <div className={styles.headingContainer}>
              <div>
                <h1 className={styles.heading}>Log In</h1>
                <h4 className={styles.subHeading}>Welcome back!</h4>
              </div>
              
              <div>
                <Link href="/auth/signup">
                  <a>Sign Up</a>
                </Link>
              </div>
            </div>

            <div>
              <form onSubmit={handleLogin}>
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
                    className={error && styles.hasError} 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                  />

                  {error && (
                    <div className={styles.error}>
                      {error && <span>{error}</span>}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                  >
                    LOG IN
                  </button>
                </div>

                <div>
                  <span>Forgot password? Rest it</span>
                  {' '}
                  <Link href="#">
                    <a>here.</a>
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