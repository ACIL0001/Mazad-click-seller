import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';
import { authStore } from '@/contexts/authStore';

interface RequireIdentityVerificationProps {
  children: ReactNode;
}

export default function RequireIdentityVerification({ children }: RequireIdentityVerificationProps) {
  const { auth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<{ to: string } | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Check if user is authenticated before making API calls
        if (!auth?.user?._id || !auth?.tokens?.accessToken) {
          console.log('🛡️ RequireIdentityVerification: User not authenticated, skipping checks');
          setIsChecking(false);
          return;
        }

        // Check if we're already showing an identity message to avoid loops
        const identityMessageShown = sessionStorage.getItem('identityMessageShown') === 'true';
        
        // Don't make unnecessary API calls if we're already showing a message
        if (!identityMessageShown) {
          // Use existing user data instead of making API calls to prevent auth clearing
          let userToCheck = auth.user;
          
          console.log('🛡️ RequireIdentityVerification: Using user data:', userToCheck);
          console.log('🛡️ RequireIdentityVerification: isHasIdentity =', userToCheck?.isHasIdentity);
          console.log('🛡️ RequireIdentityVerification: isVerified =', userToCheck?.isVerified);
          
          // Check if user is verified - if not, redirect to waiting for verification page instead of login
          const isVerified = userToCheck.isVerified === true || 
                           (userToCheck.isVerified !== false && userToCheck.isVerified !== 0);
          
          if (userToCheck && !isVerified) {
            console.log('🛡️ RequireIdentityVerification: User is not verified, redirecting to waiting for verification');
            // Don't clear auth data - just redirect to waiting page
            setShouldRedirect({ to: '/waiting-for-verification' });
            return;
          }
          
          // Check if documents were just submitted (to avoid circular redirects)
          const justSubmitted = localStorage.getItem('identityJustSubmitted') === 'true';
          
          if (userToCheck && userToCheck.type === 'PROFESSIONAL') {
            // Check isHasIdentity from user data
            if (!userToCheck.isHasIdentity && !justSubmitted) {
              console.log('RequireIdentityVerification: Professional user has not uploaded identity, redirecting to identity verification');
              setShouldRedirect({ to: '/identity-verification' });
              return;
            } else if (justSubmitted) {
              // Clear the flag after using it once
              console.log('RequireIdentityVerification: Documents just submitted, allowing access without redirect');
              localStorage.removeItem('identityJustSubmitted');
            }
            
            console.log('RequireIdentityVerification: Professional user has identity, allowing dashboard access');
          }
        } else {
          console.log('RequireIdentityVerification: Identity message shown already, skipping checks');
        }
        
        // User has subscription or not a professional, allow access
        setShouldRedirect(null);
      } catch (error) {
        console.error('Error checking user status in RequireIdentityVerification:', error);
        // On error, allow access to prevent blocking the user
        console.log('RequireIdentityVerification: Error occurred, allowing access to prevent blocking user');
        setShouldRedirect(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, [auth?.user, auth?.tokens]);

  // Show loading while checking user status
  if (isChecking) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect if needed
  if (shouldRedirect) {
    return <Navigate to={shouldRedirect.to} replace />;
  }

  // Allow access to children
  return <>{children}</>;
} 