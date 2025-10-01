import { useState, useEffect, useRef } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
//
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import OnlineSidebar from './OnlineSidebar';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { authStore } from '@/contexts/authStore';
// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')<{ isRTL?: boolean }>(({ isRTL }) => ({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
  direction: isRTL ? 'rtl' : 'ltr'
}));

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 16,
  paddingBottom: theme.spacing(6),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    paddingTop: APP_BAR_MOBILE + 20,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    paddingTop: APP_BAR_MOBILE + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.direction === 'rtl' ? theme.spacing(2) : theme.spacing(2),
    paddingRight: theme.direction === 'rtl' ? theme.spacing(2) : theme.spacing(2),
  },
  [theme.breakpoints.up('xl')]: {
    paddingLeft: theme.direction === 'rtl' ? theme.spacing(4) : theme.spacing(4),
    paddingRight: theme.direction === 'rtl' ? theme.spacing(4) : theme.spacing(4),
  }
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const navigate = useNavigate();
  const { isLogged, auth, validateToken } = useAuth();
  const { isRTL } = useLanguage();
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const checkInProgress = useRef(false);

  useEffect(() => {
    // Quick check: redirect to login if not logged in
    if (!isLogged) {
      console.log('DashboardLayout: Not logged in, redirecting to login');
      navigate("/login");
      return;
    }

    // Prevent multiple simultaneous checks
    if (checkInProgress.current) {
      console.log('DashboardLayout: Check already in progress, skipping');
      return;
    }

    const checkUserAccess = async () => {
      checkInProgress.current = true;

      try {
        const user = auth?.user;
        const hasToken = !!auth?.tokens?.accessToken;

        console.log('DashboardLayout: User access check', {
          hasUser: !!user,
          hasToken,
          isVerified: user?.isVerified
        });

        // If no user data, redirect to login
        if (!user) {
          console.log('DashboardLayout: No user data, redirecting to login');
          navigate("/login");
          return;
        }

        // Check verification status
        const isVerified = user.isVerified === true || 
                          (user.isVerified !== false && user.isVerified !== 0);
        
        if (!isVerified) {
          console.log('DashboardLayout: User not verified, redirecting to waiting page');
          navigate("/waiting-for-verification");
          return;
        }
        
        console.log('DashboardLayout: User verified, allowing access');
        setSubscriptionChecked(true);
        
        // Optional background token validation (don't block UI)
        if (hasToken) {
          validateToken().catch(err => {
            console.warn('DashboardLayout: Background token validation failed:', err);
            // Don't redirect or clear auth - just log the warning
          });
        }
        
      } catch (error) {
        console.error('DashboardLayout: Access check failed', error);
        navigate("/login");
      } finally {
        checkInProgress.current = false;
      }
    };

    // Delay the check slightly to allow auth store to initialize
    const timeoutId = setTimeout(() => {
      checkUserAccess();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isLogged, navigate]);

  return (
    <RootStyle isRTL={isRTL}>
      <DashboardNavbar 
        onOpenSidebar={() => setOpen(true)} 
        onOpenRightSidebar={() => setOpenRight(true)}
      />
      <DashboardSidebar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
      <MainStyle>
        <Outlet />
      </MainStyle>
      <OnlineSidebar isOpenSidebar={openRight} onCloseSidebar={() => setOpenRight(false)} />
    </RootStyle>
  );
}