import React, {useState, useEffect} from 'react';
import { useRouter } from 'next/router'
import { AuthUserProvider } from '@/context/AuthUserContext'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MainMenu from '@/components/menu.js'
import Router from 'next/router';
import '../styles/globals.css'
import GridLoader from "react-spinners/GridLoader";

import Firebase from 'lib/Firebase'

const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseStore = Firebase.firestore()

const theme = createTheme({
  palette: {
    primary: {
      main: '#1CA566'
    },
    secondary:{
      main: '#516B84'
    }
  }
}); 

function App({ Component, pageProps }) {
  const router = useRouter()

  const [checkAuth, setCheckAuth] = React.useState(false);
  const [checkMenuCollapse, setCheckMenuCollapse] = React.useState(false);
  const [pageLoader, setPageLoader] = React.useState(true);
  const [logoutLoader, setLogoutLoader] = React.useState(false);
  const [loginLoader, setLoginLoader] = React.useState(false);
  
  useEffect(() => {
    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        setCheckAuth(true)
        removePageLoader()
      }else{
        setCheckAuth(false)
      }
    })
  })

  useEffect(() => {
    if (router) {
      firebaseAuth.onAuthStateChanged(user => {
        if (user) {
          if (
            router.pathname == '/onboarding/welcome' || 
            router.pathname == '/onboarding/1' || 
            router.pathname == '/onboarding/2' || 
            router.pathname == '/onboarding/3' || 
            router.pathname == '/onboarding/4' || 
            router.pathname == '/onboarding/5' || 
            router.pathname == '/onboarding/6' || 
            router.pathname == '/onboarding/7'
          ) {
            firebaseDatabase
              .ref()
              .child('users')
              .child(user.uid)
              .once('value')
              .then((snapshot) => {
                const snapshotValue = snapshot.val()

                firebaseStore
                  .collection('M3Assessment')
                  .doc(user.uid)
                  .collection('scores')
                  .get()
                  .then(doc => {
                    if (
                      (doc.docs.length > 0) && 
                      ((snapshotValue.committedToSelfhelp == 'true') || 
                      (snapshotValue.committedToSelfhelp == 'false'))
                    ) {
                      router.push('/')
                    } else if (
                      (snapshotValue.committedToSelfhelp == 'true') || 
                      (snapshotValue.committedToSelfhelp == 'false')
                    ) {
                      router.push('/onboarding/get-started')
                    }
                  })
              })
          }
        }
      })
    }
  }, [router])

  const removePageLoader = (status = false) => {
    setPageLoader(status)
  }

  const logoutLoaderHandler = (status = false) => {
    setLogoutLoader(status)
    if (status) {
      firebaseAuth.onAuthStateChanged(user => {
          location.href='/auth/login'
      })
    }
  }

  const loginLoaderHandler = (status = false) => {
    setLoginLoader(status)
  }

  const menuCollapseHandler = (status = false) => {
    setCheckMenuCollapse(status)
  }

  return (
    <ThemeProvider theme={theme}>
      <AuthUserProvider> 
        {
          pageLoader ? 
          <div className="page-loader"><GridLoader color={'#1CA566'} loading={pageLoader} size={10} /></div> : ''
        }

        {
          logoutLoader ? 
          <div className="page-loader logout-loader"><GridLoader color={'#1CA566'} loading={true} size={10} /></div> : ''
        }

        {
          loginLoader ? 
          <div className="page-loader login-loader"><GridLoader color={'#1CA566'} loading={true} size={10} /></div> : ''
        }

        <div className={`body-wrapper ${checkAuth ? 'logged' : ''} ${checkMenuCollapse ? 'menu_collapsed' : ''}`}>
          { checkAuth ? <MainMenu menuCollapseHandler={menuCollapseHandler} logoutLoaderHandler={logoutLoaderHandler}  /> : '' }
          <Component 
            {...pageProps} 
            removePageLoader={removePageLoader}
            loginLoaderHandler={loginLoaderHandler}
          />
        </div>
      </AuthUserProvider>
    </ThemeProvider>
  )
}

export default App
