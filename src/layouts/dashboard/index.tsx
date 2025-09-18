import { useState, useEffect } from 'react';
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
import { AuthAPI } from '@/api/auth';
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

  useEffect(() => {
    if (!isLogged) {
      navigate("/login");
      return;
    }

    // Check if user is verified and token is valid
    const checkUserAccess = async () => {
      try {
        // Use existing user data first to avoid unnecessary API calls
        const user = auth?.user;
        if (!user) {
          console.log('DashboardLayout: No user data available, redirecting to login');
          navigate("/login");
          return;
        }

        console.log('DashboardLayout: Checking user verification status', user);
        
        // Check if user is verified using existing data
        const isVerified = user.isVerified === true || 
                         (user.isVerified !== false && user.isVerified !== 0);
        
        if (!isVerified) {
          console.log('DashboardLayout: User is not verified, redirecting to waiting page');
          // Don't clear auth - just redirect to waiting page
          navigate("/waiting-for-verification");
          return;
        }
        
        console.log('DashboardLayout: User is verified, allowing dashboard access');
        setSubscriptionChecked(true);
        
        // Optional: Validate token in background (don't block access)
        try {
          console.log('DashboardLayout: Validating token in background');
          const { valid, user: serverUser } = await validateToken();
          
          if (valid && serverUser) {
            console.log('DashboardLayout: Token validation successful, updating user data');
            // Update auth store with fresh user data if validation succeeds
            authStore.getState().set({
              user: serverUser,
              tokens: auth.tokens
            });
          } else {
            console.log('DashboardLayout: Token validation failed, but allowing access with existing data');
          }
        } catch (tokenError) {
          console.warn('DashboardLayout: Token validation failed in background:', tokenError);
          // Don't clear auth or redirect - just log the warning
          // The user can continue using the app with existing data
        }
        
      } catch (error) {
        console.error('DashboardLayout: Access check failed', error);
        // Don't clear auth immediately - just redirect to login
        navigate("/login");
      }
    };

    checkUserAccess();
  }, [isLogged, auth?.user, navigate, validateToken])

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
