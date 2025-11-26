import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Storefront as SellerIcon,
  ShoppingCart as BuyerIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import useAuth from '../hooks/useAuth';
import app from '../config';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function PostLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { auth, isLogged, isReady } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    // Wait for auth to be ready before checking
    if (!isReady) return;

    // Check if user is not logged in or doesn't have valid auth data
    if (!isLogged || !auth?.user || !auth?.tokens?.accessToken) {
      console.log('PostLogin: User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [isLogged, auth, isReady, navigate]);

  const handleContinueAsSeller = () => {
    // User continues as seller - redirect to dashboard
    navigate('/dashboard/app');
  };

  const handleContinueAsBuyer = async () => {
    if (!auth?.tokens?.accessToken) {
      setError('Aucun token d\'authentification trouvé. Veuillez vous reconnecter.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Preparing to redirect to buyer app...');
      console.log('🔍 Config buyerURL:', app.buyerURL);
      console.log('🔍 Environment VITE_BUYER_URL:', import.meta.env.VITE_BUYER_URL);
      
      // No API call needed - just redirect to buyer app
      console.log('✅ Redirecting to buyer app (no backend modification needed)');

      // Simulate the success response structure
      const mockResponse = { success: true };
      
      if (mockResponse.success) {
        // Use buyer URL from config (defaults to https://mazadclick.vercel.app/)
        const buyerUrl = app.buyerURL;
        
        // Show success message
        enqueueSnackbar('Redirection vers l\'application acheteur...', { 
          variant: 'success',
          autoHideDuration: 2000 
        });

        // Redirect to buyer application with token
        // We'll pass the token as a URL parameter for the buyer to pick up
        const tokenParam = encodeURIComponent(auth.tokens.accessToken);
        const refreshTokenParam = encodeURIComponent(auth.tokens.refreshToken || '');
        
        const redirectUrl = `${buyerUrl}?token=${tokenParam}&refreshToken=${refreshTokenParam}&from=seller`;
        
        console.log('🔄 Redirecting to:', redirectUrl);
        console.log('🔄 Buyer URL from config:', app.buyerURL);
        
        // Small delay to show the success message
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
        
      } else {
        throw new Error('Failed to redirect to buyer app');
      }
    } catch (error: any) {
      console.error('❌ Error redirecting to buyer app:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to redirect to buyer app. Please try again.';
      
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is being checked
  if (!isReady) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // If not authenticated, don't render anything as we're redirecting
  if (!isLogged || !auth?.user || !auth?.tokens?.accessToken) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {t('postLogin.welcome', { name: auth.user.firstName }) || `Bienvenue, ${auth.user.firstName} !`}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('postLogin.chooseContinue') || 'Choisissez comment vous souhaitez continuer'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4} justifyContent="center">
        {/* Continue as Seller */}
        <Grid item xs={12} sm={6} md={5}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <SellerIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h5" component="h2" gutterBottom>
                {t('postLogin.continueAsSeller') || 'Continuer en tant que Vendeur'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {t('postLogin.sellerDescription') || 'Vendre et offrir'}
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleContinueAsSeller}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {t('postLogin.continueAsSeller') || 'Continuer en tant que Vendeur'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Continue as Buyer */}
        <Grid item xs={12} sm={6} md={5}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'secondary.main',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <BuyerIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h5" component="h2" gutterBottom>
                {t('postLogin.continueAsBuyer') || 'Continuer en tant qu\'Acheteur'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {t('postLogin.buyerDescription') || 'Acheter et bénéficier'}
              </Typography>
              
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                onClick={handleContinueAsBuyer}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {t('postLogin.redirecting') || 'Redirection...'}
                  </>
                ) : (
                  t('postLogin.continueAsBuyer') || 'Continuer en tant qu\'Acheteur'
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Info */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'grey.300' }}>
            <UserIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('postLogin.loggedInAs') || 'Logged in as'}: <strong>{auth.user.firstName} {auth.user.lastName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('postLogin.role') || 'Role'}: <strong>{auth.user.type}</strong>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
