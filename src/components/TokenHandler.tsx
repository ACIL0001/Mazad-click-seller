import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { authStore } from '@/contexts/authStore';
import { AuthAPI } from '@/api/auth';
import app from '@/config';

interface TokenHandlerProps {
  children: React.ReactNode;
}

export default function TokenHandler({ children }: TokenHandlerProps) {
  const navigate = useNavigate();
  const { set, isLogged, auth } = authStore.getState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleTokenFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const refreshToken = urlParams.get('refreshToken');
      const from = urlParams.get('from');

      if (token && refreshToken && from === 'buyer') {
        console.log('🔐 TokenHandler: Detected tokens from buyer app URL.');
        setLoading(true);
        setError(null);

        try {
          // Use the existing /auth/status to get user data and validate token
          const statusResponse = await AuthAPI.status();
          
          if (statusResponse.authenticated && statusResponse.user) {
            const authData = {
              user: statusResponse.user,
              tokens: {
                accessToken: token,
                refreshToken: refreshToken,
              },
            };
            console.log('🔐 TokenHandler: Storing auth data from URL:', authData);
            set(authData); // Update Zustand store

            // Clean up URL parameters
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('token');
            newUrl.searchParams.delete('refreshToken');
            newUrl.searchParams.delete('from');
            window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
            console.log('🔐 TokenHandler: URL parameters cleaned up.');
          } else {
            throw new Error('Failed to authenticate user with provided tokens.');
          }
        } catch (err: any) {
          console.error('❌ TokenHandler: Error processing tokens:', err);
          setError(err.message || 'Failed to authenticate from buyer app.');
          // Optionally clear auth state if token processing fails
          authStore.getState().clear();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    // Only run if not already logged in and tokens are present in URL
    if (!isLogged && (new URLSearchParams(window.location.search).get('token') || new URLSearchParams(window.location.search).get('refreshToken'))) {
      handleTokenFromUrl();
    } else {
      setLoading(false);
    }
  }, [isLogged, set, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Authenticating...
        </Typography>
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  return <>{children}</>;
}