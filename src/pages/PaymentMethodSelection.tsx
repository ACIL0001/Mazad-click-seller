//------------------------------------------------------------------------------
// <copyright file="PaymentMethodSelection.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  Button, useTheme, Radio, RadioGroup, FormControlLabel,
  Divider, Chip, CircularProgress, Alert, Stepper, Step, StepLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { useNavigate, useLocation } from 'react-router-dom';
import Iconify from '../components/Iconify';
import Logo from '../components/Logo';
import Page from '../components/Page';
import { authStore } from '../contexts/authStore';
import app from '../config';

// Import payment functions
import { 
  createSlickpayPayment,
  SubscriptionPayment, 
  formatCurrency,
  validatePaymentAmount 
} from '../api/payment';

// Styled components
const PaymentMethodCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
  height: '100%',
  transition: 'all 0.3s ease',
  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
  borderRadius: 16,
  overflow: 'hidden',
  position: 'relative',
  border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(145, 158, 171, 0.12)',
  boxShadow: isSelected 
    ? '0 10px 30px rgba(0, 0, 0, 0.1)' 
    : '0 5px 15px rgba(0, 0, 0, 0.05)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

const MethodIcon = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  fontSize: 32,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.primary.light,
}));

const ProgressStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: 'rgba(145, 158, 171, 0.04)',
  borderRadius: 16,
  '& .MuiStepLabel-root .Mui-completed': {
    color: theme.palette.success.main,
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: theme.palette.primary.main,
  },
}));

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'slickpay',
    name: 'Paiement par Carte Bancaire (SlickPay)',
    description: 'Paiement sécurisé via SlickPay - API Invoice v2 en direct',
    icon: 'mdi:credit-card-wireless',
    color: '#1976d2',
    backgroundColor: '#e3f2fd'
  }
];

export default function PaymentMethodSelection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const { tokens, user } = authStore.getState().auth;
    if (!tokens || !tokens.accessToken) {
      navigate('/login');
      return;
    }

    // Get selected plan from location state or localStorage
    const planData = location.state?.selectedPlan || JSON.parse(localStorage.getItem('selectedPlan') || 'null');
    if (!planData) {
      navigate('/subscription-plans');
      return;
    }

    setSelectedPlan(planData);
    setIsLoading(false);
  }, [navigate, location]);

  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMethod(event.target.value);
    setError(null); // Clear any previous errors
  };

  const handleBack = () => {
    navigate('/subscription-plans');
  };

  const handleProceedToPayment = async () => {
    if (!selectedMethod) {
      setError('Veuillez sélectionner une méthode de paiement');
      return;
    }

    if (!validatePaymentAmount(selectedPlan.price)) {
      setError('Montant de paiement invalide');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Creating payment for plan:', selectedPlan);
      console.log('Selected payment method:', selectedMethod);

      // Get user data from auth store
      const { user } = authStore.getState().auth;
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Create subscription payment data
      const paymentData: SubscriptionPayment = {
        organization_id: (user as any).organizationId || 'default-org-id', // Added organizationId with a fallback value
        user_id: user._id || user.id,
        plan: selectedPlan.name,
        duration_months: selectedPlan.duration || 1,
        total_amount: selectedPlan.price,
        payment_method: 'slickpay',
        customer_email: user.email || '',
        customer_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Customer',
        customer_phone: user.phone || '0000000000', // Add phone number with default
      };

      console.log('Creating payment with data:', paymentData);

      // Create SlickPay payment (only supported method now)
      if (selectedMethod === 'slickpay') {
        const result = await createSlickpayPayment(paymentData);
        console.log('SlickPay payment created successfully:', result);
        
        // Store payment info for reference
        localStorage.setItem('pendingPayment', JSON.stringify({
          paymentId: result.paymentId,
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          currency: 'DZD',
          status: 'pending',
          paymentMethod: selectedMethod,
          timestamp: new Date().toISOString()
        }));

        // Clear selected plan from localStorage
        localStorage.removeItem('selectedPlan');

        console.log(`Redirecting to SlickPay payment URL:`, result.redirectUrl);
        
        // Redirect to payment page
        window.location.href = result.redirectUrl;
      } else {
        throw new Error('Méthode de paiement non supportée');
      }
      
    } catch (error: any) {
      console.error('Error creating payment:', error);
      const errorMessage = error.message || 'Une erreur est survenue lors de la création du paiement';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Page title="Méthode de paiement">
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Méthode de paiement">
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <HeaderSection>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Logo sx={{ mr: 2, width: 140, height: 90 }} />
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                mb: 0.5
              }}>
                Paiement
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                fontWeight: 500
              }}>
                Choisissez votre méthode de paiement
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleBack}
            sx={{ 
              height: 48, 
              borderRadius: 3,
              px: 3,
              fontSize: 15,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'primary.lighter',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.lighter',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Retour aux plans
          </Button>
        </HeaderSection>

        {/* Progress Stepper */}
        <ProgressStepper activeStep={2} alternativeLabel>
          <Step>
            <StepLabel>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Étape 1
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Vérification d'identité
                </Typography>
              </Box>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Étape 2
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Choix d'abonnement
                </Typography>
              </Box>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Étape 3
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Paiement
                </Typography>
              </Box>
            </StepLabel>
          </Step>
        </ProgressStepper>

        {/* Plan Summary */}
        {selectedPlan && (
          <Box sx={{ 
            mb: 4, 
            p: 4, 
            bgcolor: 'background.paper', 
            borderRadius: 3, 
            border: '2px solid', 
            borderColor: 'primary.light',
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(66, 165, 245, 0.05) 100%)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              mb: 2
            }}>
              Plan sélectionné
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 800, 
                  color: 'primary.main',
                  mb: 1
                }}>
                  {selectedPlan.name}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  lineHeight: 1.6
                }}>
                  {selectedPlan.description}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  color: 'primary.main',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {formatCurrency(selectedPlan.price, 'DZD')}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 600
                }}>
                  /{selectedPlan.duration} mois
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Test avec interfaces SATIM réelles
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Choisissez votre méthode de paiement. Vous serez redirigé vers l'interface de 
            test SATIM réelle pour tester le processus complet de paiement.
          </Typography>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <RadioGroup
          value={selectedMethod}
          onChange={handleMethodChange}
          sx={{ width: '100%' }}
        >
          <Grid container spacing={3}>
            {paymentMethods.map((method) => (
              <Grid xs={12} md={6} key={method.id}>
                <PaymentMethodCard 
                  isSelected={selectedMethod === method.id}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <FormControlLabel 
                      value={method.id} 
                      control={<Radio />} 
                      label="" 
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        m: 0
                      }}
                    />
                    
                    <MethodIcon sx={{ 
                      backgroundColor: method.backgroundColor,
                      color: method.color,
                      mx: 'auto'
                    }}>
                      <Iconify icon={method.icon} width={32} height={32} />
                    </MethodIcon>
                    
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {method.name}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {method.description}
                    </Typography>
                    
                    {method.id === 'slickpay' && (
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
                        🧪 Test avec interface SATIM SlickPay réelle
                      </Typography>
                    )}
                    {method.id === 'satim-edahabia' && (
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                        🧪 Test avec interface SATIM Edahabia réelle
                      </Typography>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <Iconify icon="eva:shield-fill" width={16} height={16} sx={{ color: 'success.main' }} />
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                        Paiement sécurisé
                      </Typography>
                    </Box>
                  </CardContent>
                </PaymentMethodCard>
              </Grid>
            ))}
          </Grid>
        </RadioGroup>

        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
          <LoadingButton 
            variant="contained" 
            size="large"
            loading={isSubmitting}
            onClick={handleProceedToPayment}
            disabled={!selectedMethod}
            startIcon={<Iconify icon="eva:credit-card-fill" />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            {isSubmitting ? 'Redirection en cours...' : 'Procéder au paiement'}
          </LoadingButton>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            En procédant au paiement, vous acceptez nos{' '}
            <Typography component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
              Conditions d'utilisation
            </Typography>
            {' '}et notre{' '}
            <Typography component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
              Politique de confidentialité
            </Typography>.
          </Typography>
        </Box>
      </Container>
    </Page>
  );
}