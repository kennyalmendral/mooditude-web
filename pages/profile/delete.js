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

export default function profileDelete() {
  const router = useRouter()

  const { authUser, loading, signOut, signInWithEmailAndPassword } = useAuth()

  const [checking, setChecking] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [password, setPassword] = useState('')

  const [isDeleting, setIsDeleting] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/auth/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser) {
      setChecking(false)
    }
  }, [authUser])

  const handleDeleteAccount = e => {
    e.preventDefault()
    
    setIsDeleting(true)

    const confirmation = confirm('Are you sure?')

    if (authUser) {
      if (confirmation) {
        signInWithEmailAndPassword(authUser.email, password)
          .then(user => {
            setIsDeleting(false)
            
            if (user.user) {
              firebaseAuth.currentUser
                .delete()
                .then(() => {
                  // firebaseStore
                  //   .collection('Users')
                  //   .get()
                  //   .then(doc => {
                  //     if (doc.docs.length > 0) {
                  //       doc.docs.map(item => {
                  //         console.log(item.value)
                  //       })
                  //     }
                  //   })

                  firebaseStore
                    .collection('Users')
                    .doc(user.user.uid)
                    .delete()
                  
                  firebaseStore
                    .collection('Subscribers')
                    .doc(user.user.uid)
                    .delete()

                  firebaseStore
                    .collection('M3Assessment')
                    .doc(user.user.uid)
                    .delete()

                  firebaseDatabase
                    .ref(`users/${user.user.uid}`)
                    .remove()

                  setIsDeleting(false)
                })
                .catch(err => {
                  setIsDeleting(false)
                  console.log(err)
                })
            }
          })
          .catch(err => {
            setError('Wrong password.')
            setIsDeleting(false)
            console.log(err)
          })
      } else {
        setIsDeleting(false)
      }
    }
  }
  
  return (
    <Layout title={`Delete Account | ${SITE_NAME}`}>
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
                  <h1>Delete Account</h1>
                </div>
                <div className={styles.profileInnerPage}>
                  <form onSubmit={handleDeleteAccount}>
                    <div className={styles.deleteInnerPage}>
                      <img src="/error.svg" />
                      <h3>Please enter your password to<br/> delete your account.</h3>
                      <p>All your data from this device and our servers<br/> will be permanently deleted.</p>
                      <div className={styles.formItem}>
                        <FormLabel>CURRENT PASSWORD</FormLabel>

                        <TextField 
                          type="password" 
                          fullWidth={true}
                          size={"small"}
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          error={error}
                          helperText={error ? 'Wrong password.' : ''}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.button_wrapper}>
                      <Button 
                        type="submit"
                        size="large" 
                        variant="contained"
                        disabled={isDeleting ? true : false}
                      >
                        {isDeleting && 'Please Wait'}
                        {!isDeleting && 'Delete Account'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
          </div>
        </>
      }
      
    </Layout>
  )
}