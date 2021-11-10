import { useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Auth.module.css'

import { useAuth } from '@/context/AuthUserContext'

export default function Account() {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/auth/login')
    }
  }, [authUser, loading])

  return (
    <Layout title={`Account | ${SITE_NAME}`}>
      <div className={styles.account}>
        <div>
          <div>
            <h1>Account</h1>

            <div>
              You have logged in successfully!
              {' '}
              Click
              {' '}
              <a 
                className={styles.link} 
                href="#" 
                onClick={signOut}
              >
                here
              </a>
              {' '}
              to logout.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}