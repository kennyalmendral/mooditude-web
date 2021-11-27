import React, {useState, useEffect} from 'react';
import { AuthUserProvider } from '@/context/AuthUserContext'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MainMenu from '@/components/menu.js'
import Router from 'next/router';
import '../styles/globals.css'
import GridLoader from "react-spinners/GridLoader";
import Firebase from 'lib/Firebase'
const firebaseAuth = Firebase.auth()

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
