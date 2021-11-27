import { createContext, useContext, Context } from 'react'

import useFirebaseAuth from 'lib/useFirebaseAuth'

const AuthUserContext = createContext({
  authUser: null,
  loading: true,
  signInWithEmailAndPassword: async () => {},
  createUserWithEmailAndPassword: async () => {},
  signOut: async () => {},
  sendPasswordResetEmail: async () => {},
  verifyPasswordResetCode: async () => {},
  confirmPasswordReset: async () => {}
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