import { AuthUserProvider } from '@/context/AuthUserContext'

import '../styles/globals.css'

function App({ Component, pageProps }) {
  return (
    <AuthUserProvider> 
      <Component {...pageProps} />
    </AuthUserProvider>
  )
}

export default App
