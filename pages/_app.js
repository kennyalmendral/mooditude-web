import React, {useState, useEffect} from 'react';
import { AuthUserProvider } from '@/context/AuthUserContext'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MainMenu from '@/components/menu.js'
import Router from 'next/router';
import '../styles/globals.css'
import GridLoader from "react-spinners/GridLoader";


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
  const [pageLoader, setPageLoader] = React.useState(true);
  
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
    setPageLoader(false)
  }
  return (
    <ThemeProvider theme={theme}>
      <AuthUserProvider> 
        {
          pageLoader ? 
          <div className="page-loader"><GridLoader color={'#1CA566'} loading={pageLoader} size={10} /></div> : ''
        }
        <div className={`body-wrapper ${checkAuth ? 'logged' : ''}`}>
          { checkAuth ? <MainMenu /> : '' }
          <Component {...pageProps} />
        </div>
      </AuthUserProvider>
    </ThemeProvider>
  )
}

export default App
