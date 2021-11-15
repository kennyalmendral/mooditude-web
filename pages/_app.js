import React, {useState, useEffect} from 'react';
import { AuthUserProvider } from '@/context/AuthUserContext'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MainMenu from '@/components/menu.js'
import Router from 'next/router';
import '../styles/globals.css'

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
  
  const [checkAuth, setCheckAuth] = React.useState(true);
  
  useEffect(() => {
    urlChecker(Router.pathname)
    Router.events.on('routeChangeComplete', url => {
      urlChecker(url)
    })
  })

  const urlChecker = (url) => {
    if (url.indexOf('/auth') !== -1) {
      setCheckAuth(false)
    }else{
      setCheckAuth(true)
    }
  }
  return (
    <ThemeProvider theme={theme}>
      <AuthUserProvider> 
            <div className={`body-wrapper`}>
              { checkAuth ? <MainMenu /> : '' }
              <Component {...pageProps} />
            </div>
      </AuthUserProvider>
    </ThemeProvider>
  )
}

export default App
