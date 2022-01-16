import { useState, useEffect } from 'react'

import { useRouter } from 'next/router'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()

export default function Test() {
  const router = useRouter()

  useEffect(() => {
    const testMailJet = firebaseFunctions.httpsCallable('testMailJet')

    testMailJet({
      name: 'John Doe',
      email: 'kennyalmendral.sandbox@gmail.com'
    }).then(result => {
      console.log(result)
    })
  }, [])

  return (
    <>
      <p>Hello</p>
    </>
  )
}