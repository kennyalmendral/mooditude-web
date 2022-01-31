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

import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

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

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)

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

  const handleProceed = () => {
    setIsDeleting(true)

    if (authUser) {
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
            .doc(authUser.uid)
            .delete()
          
          firebaseStore
            .collection('Subscribers')
            .doc(authUser.uid)
            .delete()

          firebaseStore
            .collection('M3Assessment')
            .doc(authUser.uid)
            .delete()

          firebaseDatabase
            .ref(`users/${authUser.uid}`)
            .remove()
           sessionStorage.removeItem('end_update')
           sessionStorage.removeItem('check_update')
          setIsDeleting(false)
          setOpenConfirmationDialog(false)
        })
        .catch(err => {
          setIsDeleting(false)
          setOpenConfirmationDialog(false)

          console.log(err)
        })
    }
  }

  const handleDeleteAccount = () => {
    if (authUser) {
      signInWithEmailAndPassword(authUser.email, password)
        .then(user => {
          setOpenConfirmationDialog(true)
          // setIsDeleting(false)
          setError('')
        })
        .catch(err => {
          setError('Wrong password.')
          // setIsDeleting(false)
          setOpenConfirmationDialog(false)
          console.log(err)
        })
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
          <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            maxWidth="xs"
            open={openConfirmationDialog}
          >
            <DialogTitle style={{ fontFamily: 'Circular Std' }}>Are you sure?</DialogTitle>

            <DialogContent style={{ fontFamily: 'Circular Std' }} dividers>
              <p style={{ margin: 0 }}>This operation cannot be undone.</p>
            </DialogContent>

            <DialogActions>
              <Button style={{ fontFamily: 'Circular Std' }} onClick={() => setOpenConfirmationDialog(false)}>Cancel</Button>
              
              <Button 
                style={{ fontFamily: 'Circular Std' }} 
                onClick={handleProceed} 
                disabled={isDeleting ? true : false}
              >
                {isDeleting && 'Please wait'}
                {!isDeleting && 'Proceed'}
              </Button>
            </DialogActions>
          </Dialog>

          <div className={styles.profileWrapper}>
              <div className={styles.profileInnerWrapper}>
                <div className={styles.profileInnerHeader}>
                  <h4>ACCOUNT</h4>
                  <h1>Delete Account</h1>
                </div>
                <div className={styles.profileInnerPage}>
                  <div className={styles.deleteInnerPage}>
                    <img src="/error.svg" />
                    <h3 style={{ fontSize: '34px', fontWeight: '500', lineHeight: '43px' }}>Please enter your password to delete<br/>your account.</h3>

                    <p style={{ fontSize: '16px', lineHeight: '20px', marginBottom: '40px' }}>All your data from this device and our servers will be permanently deleted.</p>

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
                      onClick={handleDeleteAccount} 
                      style={{
                        fontSize: '18px',
                        fontWeight: '600'
                      }}
                    >
                      Delete Account
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