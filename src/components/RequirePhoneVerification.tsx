import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import useAuth from '../hooks/useAuth';

interface RequirePhoneVerificationProps {
  children: React.ReactNode;
}

export default function RequirePhoneVerification({ children }: RequirePhoneVerificationProps) {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPhoneVerificationStatus = async () => {
      try {
        // Check if user is authenticated before making API calls
        if (!auth?.user?._id || !auth?.tokens?.accessToken) {
          console.log('RequirePhoneVerification: User not authenticated, skipping checks');
          setIsChecking(false);
          return;
        }

        // Use existing user data instead of refreshing during route checks to avoid unnecessary API calls
        const userToCheck = auth.user;
        console.log('RequirePhoneVerification: Using existing user data:', userToCheck);
        
        if (userToCheck && !userToCheck.isPhoneVerified) {
          console.log('RequirePhoneVerification - Phone not verified, redirecting to OTP verification');
          // Use navigate directly with state
          navigate('/otp-verification', {
            replace: true,
            state: { 
              phone: userToCheck.phone,
              user: userToCheck,
              fromPhoneVerificationCheck: true
            }
          });
          return;
        }
        
        // User's phone is verified, allow access
        console.log('RequirePhoneVerification: Phone is verified, allowing access');
      } catch (error) {
        console.error('Error checking phone verification status in RequirePhoneVerification:', error);
        // On error, allow access instead of redirecting to prevent blocking the user
        console.log('RequirePhoneVerification: Error occurred, allowing access to prevent blocking user');
      } finally {
        setIsChecking(false);
      }
    };

    // Only check if user is authenticated
    if (auth.user && auth.tokens) {
      checkPhoneVerificationStatus();
    } else {
      // User not authenticated, don't check phone verification
      setIsChecking(false);
    }
  }, [auth.user, auth.tokens]); // Removed refreshUserData dependency

  // Show loading while checking phone verification status
  if (isChecking) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Allow access to children
  return <>{children}</>;
} 