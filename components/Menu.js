import React, {useState, useEffect} from 'react';
import { useAuth } from '@/context/AuthUserContext'
import styles from '@/styles/Menu.module.css';
import MenuIcon from '@mui/icons-material/Menu';
import Grow from '@mui/material/Grow';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

export default function MainMenu(props) {
    const { signOut } = useAuth()
    const [open, setOpen] = React.useState(false);
    const [width, setWidth] = React.useState(null);
    const [mainMenuCollapse, setMainMenuCollapse] = React.useState(true);

    useEffect(() => {
      setWidth(window.innerWidth)
    }, [])


    const collapseMenu = () => {
        
        if (width <= 767) {
            console.log('asd')
            setOpen(open ? false : true)
        }else{
            setMainMenuCollapse(mainMenuCollapse ? false : true)
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
                    <div className={`${styles.main_menu_logo}`}>
                        <a href="/"><img src={`/logo_inner.svg`}  /></a>
                    </div>
                </Grow>
                
                
                <Grow in={mainMenuCollapse}>
                <div className={`${styles.main_menu_logout}`}>
                    

                    <a 
                        className={styles.logout} 
                        href="#" 
                        onClick={signOut}
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
                        <div className={`${styles.mobile_main_menu_logo}`}>
                            <img src={`/logo_inner.svg`}  />   
                        </div>
                    </Grow>

                    <div className={`${styles.mobile_main_menu_logout}`}>
                        

                        <a 
                            className={styles.logout} 
                            href="#" 
                            onClick={signOut}
                        >
                            Logout
                        </a>
                    </div>
                </SwipeableDrawer>
                
            </div>
        </>
  );
}