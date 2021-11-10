import { createContext, useContext, Context } from 'react'

import useFirebaseAuth from '@/lib/firebase/useFirebaseAuth'

const AuthUserContext = createContext({
  authUser: null,
  signInWithEmailAndPassword: async () => {},
  createUserWithEmailAndPassword: async () => {},
  signOut: async () => {}
})

export function AuthUserProvider({ children }) {
  const auth = useFirebaseAuth()

  return (
    <AuthUserContext.Provider value={auth}>
      {children}
    </AuthUserContext.Provider>
  )
}

export const useAuth = () => useContext(AuthUserContext)