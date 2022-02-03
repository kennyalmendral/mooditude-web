import React, {useState, useEffect} from 'react';
import { useAuth } from '@/context/AuthUserContext'
import styles from '@/styles/Menu.module.css';
import MenuIcon from '@mui/icons-material/Menu';
import Grow from '@mui/material/Grow';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Link from "next/link"
import Router from 'next/router';

import { format, isAfter } from 'date-fns'

import Firebase from 'lib/Firebase'

const firebaseAuth = Firebase.auth()
const firebaseStore = Firebase.firestore()
const firebaseDatabase = Firebase.database()

export default function Menu(props) {
    const { signOut } = useAuth()
    const [open, setOpen] = React.useState(false);
    const [width, setWidth] = React.useState(null);
    const [showMenu, setShowMenu] = React.useState(false);
    const [mainMenuCollapse, setMainMenuCollapse] = React.useState(true);
    const [customerType, setCustomerType] = React.useState('free')

    const [licenseType, setLicenseType] = useState(null)
    const [expiryDate, setExpiryDate] = useState(null)
    const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false)

    const [onboardingStep, setOnboardingStep] = React.useState('')
    const { authUser, loading, signInWithEmailAndPassword } = useAuth()

    useEffect(() => {
      if (authUser) {
        setShowMenu(true)
      } else{
        setShowMenu(false)
      }
    }, [Router])

    useEffect(() => {
      setWidth(window.innerWidth)
    }, [window])

    useEffect(() => {
      if (expiryDate != null) {
        if (isAfter(Firebase.firestore.Timestamp.now().toMillis(), expiryDate.toMillis())) {
          setIsSubscriptionExpired(true)
        } else {
          setIsSubscriptionExpired(false)
        }
      }
    }, [expiryDate])

    useEffect(() => {
      console.log(isSubscriptionExpired)
    }, [isSubscriptionExpired])

    useEffect(() => {
      if (authUser) {
        firebaseStore
          .collection('Subscribers')
          .doc(authUser.uid)
          .get()
          .then(doc => {
            if (doc && doc.data()) {
              if (doc.data().grant) {
                setLicenseType(doc.data().grant.licenseType)
                setExpiryDate(doc.data().grant.expiryDate)
              }
            }
          })

          firebaseAuth.onAuthStateChanged(user => {
            if (user) {
              firebaseDatabase
                .ref()
                .child('users')
                .child(user.uid)
                .on('value', snapshot => {
                  if (snapshot.val() != null ) {
                    console.log(snapshot.val())
                    if (snapshot.val().onboardingStep == 'accountCreated'  || snapshot.val().onboardingStep == 0) {
                        setShowMenu(false)
                    }else{
                        setShowMenu(true)
                    }
                  }
                }, error => {
                  console.log(error)
                })
            } else {
              unsubscribe && unsubscribe()
            }
          })
      }
    }, [authUser])

    const collapseMenu = () => {
        
        if (width <= 767) {
            setOpen(open ? false : true)
        }else{
            setMainMenuCollapse(mainMenuCollapse ? false : true)
            props.menuCollapseHandler(mainMenuCollapse ? true : false)
        }
    }
    return (
        <>

            
            <div
                className={`${styles.main_menu_wrap} ${!mainMenuCollapse ? styles.main_menu_wrap_collapse : ''}`}
            >
                <div className={`${styles.main_menu_btn} ${width <= 767 ? styles.mobile_menu_wrapper : ''}`}>
                    {
                        width <= 767 ?
                        <a href="/"><img src={`/logo-small.svg`}  className={styles.mobile_hm_menu} /></a> : ''    
                    }
                    
                    <MenuIcon 
                        onClick={() => {collapseMenu()}}
                    />
                </div>
                <Grow in={mainMenuCollapse}>
                    <div>
                        <div className={`${styles.main_menu_logo}`}>
                            <a href="/"><img src={`/logo-small.svg`}  /></a>
                        </div>

                        {
                            showMenu ? 
                            <div className={`${styles.menu_items_wrap} ${styles.menu_items_wrap_desktop}`}>
                                <div>
                                    <Link href="/"> 
                                    <a className={styles.menu_item} >
                                        HOME
                                    </a>
                                    </Link>
                                </div>

                                <div>
                                    <Link href="/assessment/dashboard"> 
                                    <a className={styles.menu_item} >
                                        SCORES
                                    </a>
                                    </Link>
                                </div>

                                <div>
                                    <Link href="/profile"> 
                                    <a className={styles.menu_item} >
                                        Profile
                                    </a>
                                    </Link>
                                </div>

                                <div>
                                    <Link href="/download"> 
                                    <a className={styles.menu_item} >
                                        DOWNLOAD
                                    </a>
                                    </Link>
                                </div>

                                {(licenseType == null || isSubscriptionExpired) && (
                                  <div>
                                    <Link href="/buy"> 
                                      <a className={styles.menu_item} >
                                          BUY
                                      </a>
                                    </Link>
                                  </div>
                                )}
                            </div> : ''

                        }
                        
                    </div>
                </Grow>
                
                
                <Grow in={mainMenuCollapse}>
                <div className={`${styles.main_menu_logout}`}>

                    <a 
                        className={styles.logout} 
                        href="#" 
                        onClick={() => {props.logoutLoaderHandler(true);signOut()}}
                    >
                        Logout
                    </a>
                </div>
                </Grow>


                <SwipeableDrawer
                   anchor={'left'}
                   open={open}
                   className={styles.mobile_drawer}
                   onClose={() => {setOpen(false)}}
                   onOpen={() => {setOpen(true)}}
                >
                    <Grow in={mainMenuCollapse}>
                        <div>
                            <div className={`${styles.mobile_main_menu_logo}`}>
                                <img src={`/logo-small.svg`}  />   
                            </div>
                            {
                                showMenu ? 
                                    <div className={styles.menu_items_wrap}>
                                        <div>
                                            <Link href="/"> 
                                            <a className={styles.menu_item} >
                                                HOME
                                            </a>
                                            </Link>
                                        </div>

                                        <div>
                                            <Link href="/assessment/dashboard"> 
                                            <a className={styles.menu_item} >
                                                SCORES
                                            </a>
                                            </Link>
                                        </div>

                                        <div>
                                            <Link href="/profile"> 
                                            <a className={styles.menu_item} >
                                                Profile
                                            </a>
                                            </Link>
                                        </div>

                                        <div>
                                            <Link href="/download"> 
                                            <a className={styles.menu_item} >
                                                DOWNLOAD
                                            </a>
                                            </Link>
                                        </div>

                                        {(licenseType == null || isSubscriptionExpired) && (
                                          <div>
                                            <Link href="/buy"> 
                                              <a className={styles.menu_item} >
                                                  BUY
                                              </a>
                                            </Link>
                                          </div>
                                        )}
                                    </div>
                                : ''
                            }
                        </div>
                    </Grow>

                    <div className={`${styles.mobile_main_menu_logout}`}>
                        

                        <a 
                            className={styles.logout} 
                            href="#" 
                            onClick={() => {props.logoutLoaderHandler(true);signOut()}}
                        >
                            Logout
                        </a>
                    </div>
                </SwipeableDrawer>
                
            </div>
        </>
  );
}