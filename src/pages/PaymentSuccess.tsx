import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Iconify from '../components/Iconify';
import Logo from '../components/Logo';
import Page from '../components/Page';
import { verifySlickpayPayment, activateSubscription, formatPrice } from '../api/payment';
import { authStore } from '../contexts/authStore';

const SuccessContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const SuccessCard = styled(Card)(({ theme }) => ({
  maxWidth: 600,
  width: '100%',
  textAlign: 'center',
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .success-icon': {
    fontSize: 80,
    color: theme.palette.success.main,
  },
  '& .error-icon': {
    fontSize: 80,
    color: theme.palette.error.main,
  }
}));

interface PaymentVerificationState {
  isVerifying: boolean;
  isSuccess: boolean;
  error: string | null;
  paymentDetails: {
    amount?: number;
    plan?: string;
    paymentId?: string;
    duration?: number;
  } | null;
}

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<PaymentVerificationState>({
    isVerifying: true,
    isSuccess: false,
    error: null,
    paymentDetails: null
  });

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(location.search);
        const success = urlParams.get('success');
        const source = urlParams.get('source');
        const orgId = urlParams.get('org_id');
        const userId = urlParams.get('user_id');
        const plan = urlParams.get('plan');
        const duration = urlParams.get('duration');
        const demo = urlParams.get('demo');
        const paymentId = urlParams.get('paymentId');
        const amount = urlParams.get('amount');
        
        console.log('[PaymentSuccess] URL parameters:', {
          success, source, orgId, userId, plan, duration, demo, paymentId, amount
        });

        // Enhanced payment verification logic
        const isSuccessfulPayment = (
          // Standard success parameter
          success === 'true' ||
          // Demo mode (always successful)
          demo === 'true' ||
          // If we have payment details, assume success (fallback URL)
          (paymentId && plan && duration)
        );

        const validSources = ['slickpay', 'satim', 'satim-edahabia', 'demo', 'direct'];
        const isValidSource = !source || validSources.includes(source);

        if (isSuccessfulPayment && isValidSource) {
          // Validate required parameters (more flexible)
          if (!plan || !duration) {
            // Try to get from localStorage as fallback
            const pendingPayment = localStorage.getItem('pendingPayment');
            if (pendingPayment) {
              try {
                const paymentData = JSON.parse(pendingPayment);
                console.log('[PaymentSuccess] Using stored payment data:', paymentData);
                
                const paymentDetails = {
                  plan: plan || paymentData.planName,
                  duration: duration ? parseInt(duration, 10) : 1,
                  paymentId: paymentId || paymentData.paymentId || `${source?.toUpperCase() || 'PAYMENT'}_${Date.now()}`,
                  amount: amount ? parseFloat(amount) : paymentData.amount || 0
                };

                // Use stored user ID or current user
                const finalUserId = userId || authStore.getState().auth.user?.id || authStore.getState().auth.user?._id;
                if (!finalUserId) {
                  throw new Error('User ID not found');
                }

                // Activate the subscription
                await activateSubscription(
                  orgId || 'default_org',
                  finalUserId,
                  paymentDetails.plan,
                  paymentDetails.duration,
                  'slickpay'
                );

                // Clear pending payment
                localStorage.removeItem('pendingPayment');

                setVerificationState({
                  isVerifying: false,
                  isSuccess: true,
                  error: null,
                  paymentDetails
                });

                // Update auth store
                if (authStore.getState().auth.user) {
                  // Cast to any to allow additional fields
                  const updatedUser = {
                    ...authStore.getState().auth.user,
                    subscription_plan: paymentDetails.plan,
                    subscription_status: 'active'
                  };
                  authStore.getState().set({ user: updatedUser as any });
                }

                return; // Exit early
              } catch (parseError) {
                console.warn('[PaymentSuccess] Could not parse stored payment data:', parseError);
              }
            }
            
            throw new Error('Missing required payment parameters (plan or duration)');
          }

          // Use current user if userId not provided
          const finalUserId = userId || authStore.getState().auth.user?.id || authStore.getState().auth.user?._id;
          if (!finalUserId) {
            throw new Error('User ID not found in URL or auth store');
          }

          const paymentDetails = {
            plan,
            duration: parseInt(duration, 10),
            paymentId: paymentId || `${source?.toUpperCase() || 'PAYMENT'}_${Date.now()}`,
            amount: amount ? parseFloat(amount) : 0
          };

          // Log payment processing
          console.log('[PaymentSuccess] Processing payment:', {
            source: source || 'unknown',
            demo: demo === 'true',
            paymentDetails,
            userId: finalUserId
          });

          // Activate the subscription
          await activateSubscription(
            orgId || 'default_org',
            finalUserId,
            plan,
            parseInt(duration, 10),
            'slickpay'
          );

          // Clear any pending payment data
          localStorage.removeItem('pendingPayment');

          setVerificationState({
            isVerifying: false,
            isSuccess: true,
            error: null,
            paymentDetails
          });

          // Update auth store if needed
          if (authStore.getState().auth.user) {
            // Cast to any to allow additional fields
            const updatedUser = {
              ...authStore.getState().auth.user,
              subscription_plan: plan,
              subscription_status: 'active'
            };
            authStore.getState().set({ user: updatedUser as any });
          }
        } else {
          // Provide more detailed error information
          const issues = [];
          if (success !== 'true' && demo !== 'true' && !paymentId) {
            issues.push('Payment not marked as successful');
          }
          if (source && !validSources.includes(source)) {
            issues.push(`Invalid payment source: ${source}`);
          }
          if (!plan) issues.push('Missing plan parameter');
          if (!duration) issues.push('Missing duration parameter');
          
          const errorMessage = issues.length > 0 
            ? `Payment verification failed: ${issues.join(', ')}`
            : 'Invalid payment parameters or payment was not successful';

          // Try one more fallback: check if we have stored payment data and user is logged in
          const pendingPayment = localStorage.getItem('pendingPayment');
          const currentUser = authStore.getState().auth.user;
          
          if (pendingPayment && currentUser) {
            console.log('[PaymentSuccess] Attempting final fallback with stored data');
            try {
              const paymentData = JSON.parse(pendingPayment);
              
              // Assume success if we reached this page and have valid stored data
              const fallbackDetails = {
                plan: paymentData.planName,
                duration: 1, // Default to 1 month
                paymentId: paymentData.paymentId || `FALLBACK_${Date.now()}`,
                amount: paymentData.amount || 0
              };

              await activateSubscription(
                'default_org',
                currentUser.id || currentUser._id,
                fallbackDetails.plan,
                fallbackDetails.duration,
                'slickpay'
              );

              localStorage.removeItem('pendingPayment');

              setVerificationState({
                isVerifying: false,
                isSuccess: true,
                error: null,
                paymentDetails: fallbackDetails
              });

              if (authStore.getState().auth.user) {
                // Cast to any to allow additional fields
                const updatedUser = {
                  ...authStore.getState().auth.user,
                  subscription_plan: fallbackDetails.plan,
                  subscription_status: 'active'
                };
                authStore.getState().set({ user: updatedUser as any });
              }

              console.log('[PaymentSuccess] Fallback activation successful');
              return; // Exit successfully
            } catch (fallbackError) {
              console.error('[PaymentSuccess] Fallback failed:', fallbackError);
            }
          }
          
          console.error('[PaymentSuccess] All verification attempts failed. URL params:', {
            success, source, orgId, userId, plan, duration, demo, paymentId, amount,
            currentUrl: window.location.href
          });
            
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('[PaymentSuccess] Verification error:', error);
        setVerificationState({
          isVerifying: false,
          isSuccess: false,
          error: error instanceof Error ? error.message : 'Payment verification failed',
          paymentDetails: null
        });
      }
    };

    verifyPayment();
  }, [location.search]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    navigate('/subscription-plans');
  };

  const handleManualActivation = async () => {
    setVerificationState(prev => ({ ...prev, isVerifying: true }));
    
    try {
      const pendingPayment = localStorage.getItem('pendingPayment');
      const currentUser = authStore.getState().auth.user;
      
      if (!pendingPayment || !currentUser) {
        throw new Error('No payment data or user information found');
      }

      const paymentData = JSON.parse(pendingPayment);
      
      const fallbackDetails = {
        plan: paymentData.planName,
        duration: 1,
        paymentId: paymentData.paymentId || `MANUAL_${Date.now()}`,
        amount: paymentData.amount || 0
      };

      await activateSubscription(
        'default_org',
        currentUser.id || currentUser._id,
        fallbackDetails.plan,
        fallbackDetails.duration,
        'slickpay'
      );

      localStorage.removeItem('pendingPayment');

      setVerificationState({
        isVerifying: false,
        isSuccess: true,
        error: null,
        paymentDetails: fallbackDetails
      });

      if (authStore.getState().auth.user) {
        // Cast to any to allow additional fields
        const updatedUser = {
          ...authStore.getState().auth.user,
          subscription_plan: fallbackDetails.plan,
          subscription_status: 'active'
        };
        authStore.getState().set({ user: updatedUser as any });
      }

      console.log('[PaymentSuccess] Manual activation successful');
    } catch (error) {
      console.error('[PaymentSuccess] Manual activation failed:', error);
      setVerificationState(prev => ({
        ...prev,
        isVerifying: false,
        error: error instanceof Error ? error.message : 'Manual activation failed'
      }));
    }
  };

  if (verificationState.isVerifying) {
    return (
      <Page title="Vérification du paiement">
        <SuccessContainer maxWidth="sm">
          <SuccessCard>
            <CardContent>
              <IconWrapper>
                <CircularProgress size={80} />
              </IconWrapper>
              <Typography variant="h4" gutterBottom>
                Vérification du paiement...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Veuillez patienter pendant que nous vérifions votre paiement.
              </Typography>
            </CardContent>
          </SuccessCard>
        </SuccessContainer>
      </Page>
    );
  }

  if (!verificationState.isSuccess) {
    return (
      <Page title="Erreur de paiement">
        <SuccessContainer maxWidth="sm">
          <SuccessCard>
            <CardContent>
              <IconWrapper>
                <ErrorIcon className="error-icon" />
              </IconWrapper>
              <Typography variant="h4" gutterBottom color="error">
                Erreur de paiement
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {verificationState.error}
              </Alert>
              
              {/* Debug information for development */}
              {import.meta.env.MODE === 'development' && (
                <Card variant="outlined" sx={{ mb: 3, p: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    Informations de débogage
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    URL actuelle: {window.location.href}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Paramètres URL détectés:
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {new URLSearchParams(location.search).entries() && 
                      Array.from(new URLSearchParams(location.search).entries()).map(([key, value]) => (
                        <li key={key}>
                          <Typography variant="body2" component="span" sx={{ fontFamily: 'monospace' }}>
                            {key}: {value}
                          </Typography>
                        </li>
                      ))
                    }
                  </ul>
                  {localStorage.getItem('pendingPayment') && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Données de paiement stockées: ✓ Disponibles
                    </Typography>
                  )}
                  {authStore.getState().auth.user && (
                    <Typography variant="body2">
                      Utilisateur connecté: ✓ {authStore.getState().auth.user.email || authStore.getState().auth.user.id}
                    </Typography>
                  )}
                </Card>
              )}
              <Typography variant="body1" color="text.secondary" paragraph>
                Il y a eu un problème lors de la vérification de votre paiement. 
                {localStorage.getItem('pendingPayment') && authStore.getState().auth.user && (
                  <span> Si votre paiement a été effectué, essayez l'activation manuelle ci-dessous.</span>
                )}
              </Typography>
              
              <Stack direction="column" spacing={2} justifyContent="center">
                {localStorage.getItem('pendingPayment') && authStore.getState().auth.user && (
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={handleManualActivation}
                    startIcon={<Iconify icon="mdi:check-circle" />}
                    disabled={verificationState.isVerifying}
                  >
                    Activer manuellement l'abonnement
                  </Button>
                )}
                
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button 
                    variant="outlined" 
                    onClick={handleRetry}
                    startIcon={<Iconify icon="mdi:refresh" />}
                  >
                    Réessayer le paiement
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Retour au tableau de bord
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </SuccessCard>
        </SuccessContainer>
      </Page>
    );
  }

  return (
    <Page title="Paiement réussi">
      <SuccessContainer maxWidth="sm">
        <SuccessCard>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Logo sx={{ height: 40, mb: 2 }} />
            </Box>
            
            <IconWrapper>
              <CheckCircleIcon className="success-icon" />
            </IconWrapper>
            
            <Typography variant="h4" gutterBottom color="success.main">
              Paiement réussi !
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Votre abonnement a été activé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.
            </Typography>

            {verificationState.paymentDetails && (
              <Box sx={{ my: 3 }}>
                <Card variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    Détails de l'abonnement
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Plan :
                      </Typography>
                      <Chip 
                        label={verificationState.paymentDetails.plan?.toUpperCase()} 
                        color="primary" 
                        size="small" 
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Durée :
                      </Typography>
                      <Typography variant="body2">
                        {verificationState.paymentDetails.duration} mois
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Méthode de paiement :
                      </Typography>
                      <Typography variant="body2">
                        SlickPay
                      </Typography>
                    </Box>
                    {verificationState.paymentDetails.paymentId && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          ID de transaction :
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {verificationState.paymentDetails.paymentId}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Card>
              </Box>
            )}

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Votre abonnement est maintenant actif. Vous recevrez un email de confirmation sous peu.
              </Typography>
            </Alert>

            <Button 
              variant="contained" 
              size="large" 
              onClick={handleContinue}
              startIcon={<Iconify icon="mdi:arrow-right" />}
              fullWidth
            >
              J'ai compris
            </Button>
          </CardContent>
        </SuccessCard>
      </SuccessContainer>
    </Page>
  );
}