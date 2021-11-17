import { useState, useEffect } from 'react'

import Firebase from 'lib/Firebase'

const formatAuthUser = (user) => ({
  uid: user.uid,
  email: user.email
})

const firebaseAuth = Firebase.auth()

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const authStateChanged = async (authState) => {
    if (!authState) {
      setAuthUser(null)
      setLoading(false)

      return
    }

    setLoading(true)

    var formattedUser = formatAuthUser(authState)

    setAuthUser(formattedUser)

    setLoading(false)
  }

  const clear = () => {
    setAuthUser(null)
    setLoading(true)
  }

  const signInWithEmailAndPassword = (email, password) => firebaseAuth.signInWithEmailAndPassword(email, password)

  const createUserWithEmailAndPassword = (email, password) => firebaseAuth.createUserWithEmailAndPassword(email, password)

  const signOut = () => firebaseAuth.signOut().then(clear)

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(authStateChanged)

    return () => unsubscribe()
  }, [])

  return {
    authUser,
    loading,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
  }
}