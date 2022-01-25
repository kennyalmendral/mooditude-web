import { useState, useEffect, useRef } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '@/components/Layout'
import { SITE_NAME } from '@/config/index'

import styles from '@/styles/Profile.module.css'

import { useAuth } from '@/context/AuthUserContext'

import { format } from 'date-fns'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import GridLoader from "react-spinners/GridLoader"
import Firebase from 'lib/Firebase'
import TextField from '@mui/material/TextField'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import MoonLoader from "react-spinners/MoonLoader"
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { FormLabel } from '@mui/material'

const firebaseStore = Firebase.firestore()
const firebaseAuth = Firebase.auth()
const firebaseDatabase = Firebase.database()
const firebaseFunctions = Firebase.functions()
const firebaseStorage = Firebase.storage()

export default function Profile(props) {
  const router = useRouter()

  const { authUser, loading, signOut } = useAuth()

  const [checking, setChecking] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [error, setError] = useState('')

  const [isEditEnabled, setIsEditEnabled] = useState(false)

  const [profile, setProfile] = useState({})
  const [grant, setGrant] = useState({})
  const [customerType, setCustomerType] = useState('')

  const [name, setName] = useState('')
  const [topGoal, setTopGoal] = useState('')
  const [challenges, setChallenges] = useState([])
  const [goingToTherapy, setGoingToTherapy] = useState(false)
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [veteranStatus, setVeteranStatus] = useState('notVeteran')

  const [checksCount, setChecksCount] = useState('')
  const [starsCount, setStarsCount] = useState('')
  const [crownsCount, setCrownsCount] = useState('')

  const [profilePicture, setProfilePicture] = useState('')

  const fileEl = useRef(null)

  useEffect(() => {
    if (!loading && !authUser) { 
      router.push('/login')
    }
  }, [authUser, loading, router])

  useEffect(() => {
    if (authUser) {
      firebaseStore
        .collection('Subscribers')
        .doc(authUser.uid)
        .get()
        .then(doc => {
          if (doc && doc.data()) {
            doc.data().grant && setGrant(doc.data().grant)
          }
        })

      firebaseStore
        .collection('Users')
        .doc(authUser.uid)
        .get()
        .then(doc => {
          if (doc && doc.data()) {
            if (doc.data().stats != undefined) {
              setChecksCount(doc.data().stats.checksCount)
              setStarsCount(doc.data().stats.starCount)
              setCrownsCount(doc.data().stats.crownsCount)
            } else {
              setChecksCount(0)
              setStarsCount(0)
              setCrownsCount(0)
            }
          }
        })

      firebaseDatabase
        .ref()
        .child('users')
        .child(authUser.uid)
        .once('value')
        .then((snapshot) => {
          const snapshotValue = snapshot.val()

          setProfile(snapshotValue)

          setChecking(false)
        })
    }
  }, [authUser])

  useEffect(() => {
    if (Object.keys(profile).length > 0) {
      // setName(profile.name)
      profile.topChallenges && setChallenges(profile.topChallenges.split(','))
      profile.topGoal && setTopGoal(profile.topGoal)
      setAgeGroup(profile.ageGroup)
      setGender(profile.gender)
      setPhone(profile.phone)
      setGoingToTherapy(profile.goingToTherapy)
      setVeteranStatus(profile.veteranStatus || 'notVeteran')
      setProfilePicture(profile.photo)
      Object.keys(grant).length == 0 && setCustomerType(profile.customerType)
    }
  }, [profile])

  const handleImageClick = () => {
    fileEl.current.click()
  }

  const handleFileChange = (e) => {
    const imageFile = e.target.files[0]

    encodeImageFileAsURL(imageFile)
  }

  const encodeImageFileAsURL = element => {
    const file = element
    const reader = new FileReader()

    if (authUser) {
      reader.onloadend = function() {
        let base64Image = reader.result.split('base64,')[1]
  
        const uploadProfilePicture = firebaseFunctions.httpsCallable('uploadProfilePicture')
    
        uploadProfilePicture({
          image: base64Image,
          name: file.name,
          type: file.type,
          user: authUser.uid
        })
        .then(result => {
          let file = `https://firebasestorage.googleapis.com/v0/b/mooditudetesting.appspot.com/o/${result.data.file}?alt=media&token=813f8dd3-470f-481d-b966-ec79b51b1758`

          firebaseDatabase
            .ref()
            .child('users')
            .child(authUser.uid)
            .update({
              photo: file
            })
            .then(() => {
              setProfilePicture(reader.result)
              // location.reload()
            })
        })
        .catch(err => {
          console.log(err)
        })
      }
  
      reader.readAsDataURL(file)
    }
  }

  const handleChangeChallenges = (e) => {
    const {target: { value }} = e

    setChallenges(typeof value == 'string' ? value.split(',') : value)
  }

  const handleSaveChanges = e => {
    e.preventDefault()

    if (authUser) {
      setIsSaved(false)
      setIsSaving(true)

      firebaseDatabase
        .ref()
        .child('users')
        .child(authUser.uid)
        .update({
          // name: name,
          topGoal: topGoal,
          topChallenges: challenges.join(','),
          ageGroup: ageGroup,
          gender: gender,
          phone: phone,
          goingToTherapy: goingToTherapy,
          veteranStatus: veteranStatus
        })
        .then(() => {
          setIsSaved(true)
          setIsSaving(false)
          setIsEditEnabled(false)

          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          })
        })
        .catch(err => {
          setIsSaved(false)
          setIsSaving(false)
          setIsEditEnabled(true)
        })
    }
  }
  
  return (
    <Layout title={`Profile | ${SITE_NAME}`}>
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
          
          <div className={styles.profileWrapper}>
            <div className={styles.profileInnerWrapper}>
              <div className={styles.profileInnerHeader}>
                <h4>JOIN DATE: {format(new Date(profile.memberSince), 'mm/dd/yyyy')}</h4>
                <h1>Profile</h1>
              </div>

              <div className={styles.profileInnerMain}>
                <div className={styles.profileInnerLeft}>
                  <div className={styles.profilePicture}>
                    {!profilePicture && (
                      <img 
                        src="/default_profile.svg" 
                        style={{
                          cursor: 'pointer'
                        }}
                        onClick={handleImageClick} 
                      />
                    )}
                    
                    {profilePicture && (
                      <img 
                        src={profilePicture} 
                        alt={name} 
                        style={{
                          cursor: 'pointer',
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          border: '5px solid #F8E71C'
                        }} 
                        onClick={handleImageClick} 
                      />
                    )}

                    <input 
                      type="file" 
                      ref={fileEl} 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }} 
                    />
                  </div>

                  <div className={styles.profileStars}>
                    <div>
                      <img src="/checks-badge.svg" />

                      <div className={styles.count}>
                        {checksCount}
                      </div>
                    </div>

                    <div>
                      <img src="/stars-badge.svg" />

                      <div className={styles.count}>
                        {starsCount}
                      </div>
                    </div>

                    <div>
                      <img src="/crowns-badge.svg" />

                      <div className={styles.count}>
                        {crownsCount}
                      </div>
                    </div>
                  </div>  

                  <div className={styles.profileDetails}>
                    <h2>{profile.name}</h2>
                    <p>{authUser && authUser.email}</p>

                    {Object.keys(grant).length > 0 && (
                      <>
                        {grant.licenseType == 'Premium' && (
                          <>
                            {grant.expiryDate.hasOwnProperty('seconds') && (
                              <p>{grant.licenseType.charAt(0).toUpperCase() + grant.licenseType.slice(1)} — Expires {format(new Date(grant.expiryDate.seconds * 1000), 'LLLL dd, yyyy')}</p>
                            )}

                            {!grant.expiryDate.hasOwnProperty('seconds') && (
                              <p>{grant.licenseType.charAt(0).toUpperCase() + grant.licenseType.slice(1)} — Expires {format(new Date(grant.expiryDate), 'LLLL dd, yyyy')}</p>
                            )}
                          </>
                        )}

                        {grant.licenseType != 'Premium' && (
                          <p>Free</p>
                        )}
                      </>
                    )}

                    {((Object.keys(grant).length == 0) && (customerType != '')) && (
                      <p>{customerType.charAt(0).toUpperCase() + customerType.slice(1)}</p>
                    )}
                  </div>  

                  <div className={styles.profileButtons}>
                    {(grant && grant.licenseType == 'Premium') && (
                      <Link href="/profile/subscription">
                        <Button 
                          type="submit"
                          size="large" 
                          
                        >
                          MANAGE SUBSCRIPTION
                        </Button>
                      </Link>
                    )}

                    <Button 
                      type="submit"
                      size="large" 
                      onClick={() => signOut()}
                    >
                      LOG OUT
                    </Button>

                    <Button 
                      type="submit"
                      size="large" 
                      onClick={e => router.push(`/profile/reset-password-code`)}
                    >
                      RESET PASSWORD
                    </Button>

                      <Link href="/profile/delete">
                      <Button 
                        type="submit"
                        size="large"
                      >
                        DELETE ACCOUNT
                      </Button>
                      </Link>
                  </div>  
                </div>
                <div className={styles.profileInnerRight}>
                  {isSaved && <Alert severity="success" style={{ marginBottom: '20px' }}>Profile has been successfully updated.</Alert>}

                  <form onSubmit={handleSaveChanges}>
                    {/* <div className={styles.formItem}>
                      <FormLabel>NAME</FormLabel>
                      <TextField 
                        type="text" 
                        fullWidth={true} 
                        size={"small"} 
                        disabled={isEditEnabled ? false : true} 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required
                      />
                    </div> */}

                    <div className={styles.formItem}>
                      <FormLabel>GOAL</FormLabel>

                      <Select
                        fullWidth={true} 
                        value={topGoal} 
                        label="Goal" 
                        onChange={e => setTopGoal(e.target.value)} 
                        disabled={isEditEnabled ? false : true} 
                        style={{
                          background: '#F3F4F6',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '16px',
                          fontWeight: '600'
                        }} 
                        required
                      >
                        <MenuItem value='lonely'>Lonely</MenuItem>
                        <MenuItem value='masterDepression'>Master Depression</MenuItem>
                        <MenuItem value='relationships'>Relationships</MenuItem>
                        <MenuItem value='overcomeAnxiety'>Overcome Anxiety</MenuItem>
                        <MenuItem value='trauma'>Trauma</MenuItem>
                        <MenuItem value='handleStress'>Handle Stress</MenuItem>
                        <MenuItem value='controlAnger'>Control Anger</MenuItem>
                        <MenuItem value='other'>Other</MenuItem>
                      </Select>
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>CHALLENGES</FormLabel>

                      <Select
                        fullWidth={true} 
                        value={challenges}
                        multiple
                        label="Challenges"
                        onChange={handleChangeChallenges} 
                        disabled={isEditEnabled ? false : true} 
                        style={{
                          background: '#F3F4F6',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '16px',
                          fontWeight: '600'
                        }} 
                        required
                      >
                        <MenuItem value='people'>People</MenuItem>
                        <MenuItem value='work'>Work</MenuItem>
                        <MenuItem value='health'>Health</MenuItem>
                        <MenuItem value='money'>Money</MenuItem>
                        <MenuItem value='me'>Me</MenuItem>
                      </Select>
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>GOING TO THERAPY</FormLabel>

                      <Select
                        fullWidth={true} 
                        value={goingToTherapy}
                        label="Going to therapy"
                        onChange={e => setGoingToTherapy(e.target.value)} 
                        disabled={isEditEnabled ? false : true} 
                        style={{
                          background: '#F3F4F6',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '16px',
                          fontWeight: '600'
                        }} 
                        required
                      >
                        <MenuItem value='true'>Yes</MenuItem>
                        <MenuItem value='false'>No</MenuItem>
                      </Select>
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>AGE GROUP</FormLabel>

                      <Select
                        fullWidth={true} 
                        value={ageGroup}
                        label="Age Group"
                        onChange={e => setAgeGroup(e.target.value)} 
                        disabled={isEditEnabled ? false : true} 
                        style={{
                          background: '#F3F4F6',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '16px',
                          fontWeight: '600'
                        }} 
                        required
                      >
                        <MenuItem value={1}>&#60; 18</MenuItem>
                        <MenuItem value={2}>19 - 24</MenuItem>
                        <MenuItem value={3}>25 - 39</MenuItem>
                        <MenuItem value={4}>40 - 59</MenuItem>
                        <MenuItem value={5}>&#62; 60</MenuItem>
                      </Select>
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>GENDER</FormLabel>

                      <Select
                        fullWidth={true} 
                        value={gender}
                        label="Gender"
                        onChange={e => setGender(e.target.value)} 
                        disabled={isEditEnabled ? false : true} 
                        style={{
                          background: '#F3F4F6',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '16px',
                          fontWeight: '600'
                        }} 
                        required
                      >
                        <MenuItem value={1}>Male</MenuItem>
                        <MenuItem value={2}>Female</MenuItem>
                        <MenuItem value={3}>Transgender</MenuItem>
                        <MenuItem value={4}>Non-binary</MenuItem>
                        <MenuItem value={5}>Others</MenuItem>
                      </Select>
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>PHONE</FormLabel>
                      <TextField 
                        type="text" 
                        fullWidth={true}
                        size={"small"}
                        disabled={isEditEnabled ? false : true} 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        required
                      />
                    </div>

                    <div className={styles.formItem}>
                      <FormLabel>VETERAN STATUS</FormLabel>

                      <Select
                        fullWidth={true} 
                        value={veteranStatus}
                        label="Veteran Status"
                        onChange={e => setVeteranStatus(e.target.value)} 
                        disabled={isEditEnabled ? false : true} 
                        style={{
                          background: '#F3F4F6',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '16px',
                          fontWeight: '600'
                        }} 
                        required
                      >
                        <MenuItem value="notVeteran">Not a veteran</MenuItem>
                        <MenuItem value="postNineEleven">Post 9-11 veteran</MenuItem>
                      </Select>
                    </div>

                    {isEditEnabled && (
                      <div className={styles.button_wrapper}>
                        <Button 
                          type="button" 
                          size="large" 
                          className={`${styles.normal_btn} profileButton`} 
                          onClick={() => setIsEditEnabled(false)} 
                          style={{
                            marginTop: '10px',
                            lineHeight: '26px',
                            fontWeight: '700',
                            fontSize: '18px'
                          }}
                        >
                          CANCEL
                        </Button>

                        <Button 
                          type="submit" 
                          size="large" 
                          variant="contained" 
                          disabled={isSaving ? true : false} 
                          style={{
                            marginTop: '10px',
                            lineHeight: '28px',
                            fontWeight: '700',
                            fontSize: '18px'
                          }}
                        >
                          {isSaving && 'PLEASE WAIT'}
                          {!isSaving && 'SAVE'}
                        </Button>
                      </div>
                    )}
                    
                    {!isEditEnabled && (
                      <div className={styles.button_wrapper}>
                        <Button 
                          type="button" 
                          size="large" 
                          className={styles.normal_btn} 
                          style={{
                            marginTop: '10px',
                            marginRight: 0,
                            lineHeight: '26px',
                            fontWeight: '700',
                            fontSize: '18px'
                          }}
                          onClick={() => {
                            setIsEditEnabled(true)
                            setIsSaved(false)
                          }}
                        >
                          EDIT
                        </Button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      }
      
    </Layout>
  )
}