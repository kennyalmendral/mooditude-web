import React, {useState, useEffect} from 'react';
import { useAuth } from '@/context/AuthUserContext'
import styles from '@/styles/Menu.module.css';
import MenuIcon from '@mui/icons-material/Menu';
import Grow from '@mui/material/Grow';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Link from "next/link"
import Router from 'next/router';

import Firebase from 'lib/Firebase'

const firebaseStore = Firebase.firestore()

export default function Menu(props) {
    const { signOut } = useAuth()
    const [open, setOpen] = React.useState(false);
    const [width, setWidth] = React.useState(null);
    const [showMenu, setShowMenu] = React.useState(false);
    const [mainMenuCollapse, setMainMenuCollapse] = React.useState(true);
    const [customerType, setCustomerType] = React.useState('free')
    const { authUser, loading, signInWithEmailAndPassword } = useAuth()

    useEffect(() => {
      setWidth(window.innerWidth)

      if (authUser) {
        setShowMenu(true)
      } else{
        setShowMenu(false)
      }
    }, [Router])

    useEffect(() => {
      if (authUser) {
        firebaseStore
          .collection('Users')
          .doc(authUser.uid)
          .get()
          .then(doc => {
            if (doc.data()) {
              setCustomerType(doc.data().customerType)
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
                <div className={`${styles.main_menu_btn}`}>
                    <MenuIcon 
                        onClick={() => {collapseMenu()}}
                    />
                </div>
                <Grow in={mainMenuCollapse}>
                    <div>
                        <div className={`${styles.main_menu_logo}`}>
                            <a href="/"><img src={`/logo_inner.svg`}  /></a>
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

                                {customerType == 'free' && (
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
                                <img src={`/logo_inner.svg`}  />   
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

                                        {customerType == 'free' && (
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
                            onClick={() => {props.logoutLoaderHandler(true);signOut}}
                        >
                            Logout
                        </a>
                    </div>
                </SwipeableDrawer>
                
            </div>
        </>
  );
}