import React, { useState } from 'react';
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

export default function PostLogin() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { auth, isLogged } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.log('🔄 Marking user as buyer...');
      
      const url = `${app.baseURL.replace(/\/$/, '')}/auth/mark-as-buyer`;
      console.log('🔗 API URL:', url);
      console.log('🔗 Base URL:', app.baseURL);
      console.log('🔗 API Key:', app.apiKey ? 'Present' : 'Missing');
      
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            'Authorization': `Bearer ${auth.tokens.accessToken}`,
            'x-access-key': app.apiKey,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      console.log('✅ Mark as buyer response:', response.data);

      if (response.data.success) {
        const buyerUrl = response.data.buyerUrl || 'http://localhost:3001';
        
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
        
        // Small delay to show the success message
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
        
      } else {
        throw new Error(response.data.message || 'Failed to mark user as buyer');
      }
    } catch (error: any) {
      console.error('❌ Error marking user as buyer:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to switch to buyer mode. Please try again.';
      
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isLogged || !auth?.user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          Vous devez être connecté pour accéder à cette page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Bienvenue, {auth.user.firstName} !
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Choisissez comment vous souhaitez continuer
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
                Continuer en tant que Vendeur
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Vendre et offrir
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleContinueAsSeller}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                Continuer en tant que Vendeur
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
                Continuer en tant qu'Acheteur
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Acheter et bénéficier
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
                    Redirection...
                  </>
                ) : (
                  'Continuer en tant qu\'Acheteur'
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
              Logged in as: <strong>{auth.user.firstName} {auth.user.lastName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: <strong>{auth.user.type}</strong>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
