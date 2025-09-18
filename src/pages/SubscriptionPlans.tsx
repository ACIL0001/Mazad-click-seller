import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Grid, Card, CardContent, Button,
  Divider, CircularProgress, Alert, Chip, List, ListItem, ListItemIcon, ListItemText, CardActions,
  Fade, Slide, useTheme, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { SubscriptionAPI, SubscriptionPlan } from '../api/subscription';

// Page wrapper component
const Page = ({ children, title }) => {
  useEffect(() => {
    document.title = title || "Plans d'abonnement";
  }, [title]);
  return <Box>{children}</Box>;
};

// Enhanced styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  borderRadius: 24,
  padding: theme.spacing(6, 4),
  marginBottom: theme.spacing(6),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '200px',
    height: '200px',
    background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
    transform: 'translate(50%, -50%)',
  },
}));

const PlanCard = styled(Card)<{ selected?: boolean; popular?: boolean }>(({ theme, selected, popular }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  cursor: 'pointer',
  border: selected ? `3px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.08)',
  borderRadius: 24,
  position: 'relative',
  overflow: 'hidden',
  background: selected 
    ? `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.primary.main, 0.05)})`
    : 'white',
  boxShadow: selected
    ? `0 20px 60px -10px ${alpha(theme.palette.primary.main, 0.3)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`
    : '0 8px 32px -8px rgba(0,0,0,0.08)',
  transform: selected ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
  '&:hover': {
    transform: selected ? 'translateY(-8px) scale(1.02)' : 'translateY(-4px) scale(1.01)',
    boxShadow: selected
      ? `0 25px 70px -10px ${alpha(theme.palette.primary.main, 0.4)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.15)}`
      : '0 16px 48px -8px rgba(0,0,0,0.15)',
  },
  '&::before': popular ? {
    content: '"POPULAIRE"',
    position: 'absolute',
    top: 16,
    right: -32,
    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    color: 'white',
    padding: '4px 40px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    transform: 'rotate(45deg)',
    zIndex: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  } : {},
}));

const PlanIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.2)})`,
  marginBottom: theme.spacing(2),
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const FeatureItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 0),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderRadius: 8,
    padding: theme.spacing(0.5, 1),
    transition: 'all 0.2s ease',
  },
}));

const SummaryCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  borderRadius: 24,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const getPlanIcon = (planRole: string) => {
  if (planRole === 'PROFESSIONAL') {
    return <BusinessIcon sx={{ fontSize: 36, color: 'primary.main' }} />;
  }
  if (planRole === 'RESELLER') {
    return <StoreIcon sx={{ fontSize: 36, color: 'primary.main' }} />;
  }
  return <StarIcon sx={{ fontSize: 36, color: 'primary.main' }} />;
};

const SubscriptionPlans = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userRole, setUserRole] = useState<'PROFESSIONAL' | 'RESELLER' | null>(null);

  useEffect(() => {
    // This is a placeholder for fetching the user's role.
    // YOU MUST REPLACE THIS with your actual authentication and user context logic.
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/user/me');
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
        } else {
          // Default to PROFESSIONAL if role cannot be fetched (e.g., for unauthenticated users)
          setUserRole('PROFESSIONAL');
          console.warn('Could not fetch user role, defaulting to PROFESSIONAL.');
        }
      } catch (err) {
        setUserRole('PROFESSIONAL');
        console.error('Failed to fetch user role:', err);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      const fetchPlans = async () => {
        try {
          setLoading(true);
          const response = await SubscriptionAPI.getPlansByRole(userRole);
          const activePlans = response.plans.filter(plan => plan.isActive);
          setPlans(activePlans);
          if (activePlans.length > 0) {
            setSelectedPlan(activePlans[0]);
          }
          setError(null);
        } catch (err) {
          setError('Failed to fetch subscription plans.');
          console.error('Error fetching plans:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchPlans();
    }
  }, [userRole]);

  const handleProceedToPayment = () => {
    if (!selectedPlan) {
      setError('Please select a plan before proceeding.');
      return;
    }
    
    // Using navigate as per your original code to handle payment
    navigate('/payment-method-selection', {
      state: { selectedPlan }
    });
  };

  const PlanFeatureList = ({ role }) => {
    let features = [];
    if (role === 'PROFESSIONAL') {
      features = [
        { text: 'Accès à un réseau de professionnels', icon: <BusinessIcon sx={{ fontSize: 20 }} /> },
        { text: 'Fonctionnalités avancées de recherche', icon: <TrendingUpIcon sx={{ fontSize: 20 }} /> },
        { text: 'Statistiques de marché', icon: <TrendingUpIcon sx={{ fontSize: 20 }} /> },
        { text: 'Support technique prioritaire', icon: <SupportAgentIcon sx={{ fontSize: 20 }} /> }
      ];
    } else if (role === 'RESELLER') {
      features = [
        { text: 'Outils avancés de revente', icon: <StoreIcon sx={{ fontSize: 20 }} /> },
        { text: 'Accès aux listes d\'enchères exclusives', icon: <SecurityIcon sx={{ fontSize: 20 }} /> },
        { text: 'Rapports d\'analyse de profitabilité', icon: <TrendingUpIcon sx={{ fontSize: 20 }} /> },
        { text: 'Support dédié aux revendeurs', icon: <SupportAgentIcon sx={{ fontSize: 20 }} /> }
      ];
    }

    return (
      <List dense sx={{ mt: 2 }}>
        {features.map((feature, index) => (
          <FeatureItem key={index} disableGutters>
            <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
              {feature.icon}
            </ListItemIcon>
            <ListItemText 
              primary={feature.text} 
              primaryTypographyProps={{ 
                fontSize: '0.9rem', 
                fontWeight: 500,
                color: 'text.primary'
              }} 
            />
          </FeatureItem>
        ))}
      </List>
    );
  };

  if (loading || !userRole) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={48} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Chargement des plans...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Fade in>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3,
              fontSize: '1rem',
              py: 2
            }}
          >
            {error}
          </Alert>
        </Fade>
      </Container>
    );
  }

  return (
    <Page title="Nos Plans d'Abonnement">
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
        <Fade in timeout={800}>
          <HeroSection>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2,
                mb: 2
              }}
            >
              Abonnements {userRole === 'PROFESSIONAL' ? 'Professionnels' : 'Revendeurs'}
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                opacity: 0.9,
                fontWeight: 400,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                maxWidth: '600px'
              }}
            >
              Choisissez le plan qui convient le mieux à vos besoins et commencez à enchérir dès maintenant.
            </Typography>
          </HeroSection>
        </Fade>

        <Grid container spacing={4} alignItems="stretch">
          {plans.map((plan, index) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id || index}>
              <Slide in timeout={600 + index * 200} direction="up">
                <PlanCard
                  selected={selectedPlan?.id === plan.id}
                  popular={index === 1} // Make middle plan popular
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4, textAlign: 'center' }}>
                    <PlanIcon>
                      {getPlanIcon(plan.role)}
                    </PlanIcon>
                    
                    <Typography 
                      variant="h4" 
                      component="h2" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{ color: 'text.primary', mb: 1 }}
                    >
                      {plan.name}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="h3" 
                        color="primary.main" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '2rem', md: '2.5rem' },
                          lineHeight: 1
                        }}
                      >
                        {plan.price.toLocaleString('fr-DZ')}
                        <Typography 
                          component="span" 
                          variant="h6" 
                          sx={{ 
                            ml: 1, 
                            color: 'text.secondary',
                            fontWeight: 'normal'
                          }}
                        >
                          DZD
                        </Typography>
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3,
                        fontSize: '1rem',
                        lineHeight: 1.5,
                        px: 1
                      }}
                    >
                      {plan.description}
                    </Typography>
                    
                    <Divider sx={{ my: 3, opacity: 0.6 }} />
                    
                    <PlanFeatureList role={plan.role} />
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'center', pb: 4, px: 4 }}>
                    <Button
                      variant={selectedPlan?.id === plan.id ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setSelectedPlan(plan)}
                      size="large"
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        borderRadius: 3,
                        textTransform: 'none',
                        boxShadow: selectedPlan?.id === plan.id ? 
                          `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                        }
                      }}
                    >
                      {selectedPlan?.id === plan.id ? '✓ Plan sélectionné' : 'Sélectionner ce plan'}
                    </Button>
                  </CardActions>
                </PlanCard>
              </Slide>
            </Grid>
          ))}
        </Grid>

        {selectedPlan && (
          <Slide in timeout={800} direction="up">
            <SummaryCard elevation={0} sx={{ mt: 6, p: 5 }}>
              <Typography 
                variant="h4" 
                gutterBottom 
                fontWeight="bold"
                sx={{ 
                  textAlign: 'center',
                  mb: 4,
                  color: 'text.primary'
                }}
              >
                Récapitulatif de la commande
              </Typography>
              
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    textAlign: { xs: 'center', md: 'left' },
                    pr: { md: 2 }
                  }}>
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary"
                      sx={{ mb: 2, fontSize: '1.1rem' }}
                    >
                      Plan sélectionné:
                    </Typography>
                    
                    <Chip
                      label={`${selectedPlan.name} - ${selectedPlan.role === 'PROFESSIONAL' ? 'Professionnel' : 'Revendeur'}`}
                      color="primary"
                      sx={{ 
                        fontSize: '1rem', 
                        fontWeight: 'bold', 
                        height: 40, 
                        mb: 3,
                        px: 2
                      }}
                    />
                    
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 3, 
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      textAlign: 'center'
                    }}>
                      <Typography 
                        variant="h2" 
                        color="primary.main"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '2.5rem', md: '3rem' },
                          lineHeight: 1
                        }}
                      >
                        {selectedPlan.price.toLocaleString('fr-DZ')}
                        <Typography 
                          component="span" 
                          variant="h5" 
                          sx={{ 
                            ml: 1, 
                            color: 'text.secondary',
                            fontWeight: 'normal'
                          }}
                        >
                          DZD
                        </Typography>
                      </Typography>
                      <Typography 
                        variant="subtitle1" 
                        color="text.secondary"
                        sx={{ mt: 1, fontWeight: 500 }}
                      >
                        Total TTC
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    pl: { md: 2 }
                  }}>
                    <LoadingButton
                      onClick={handleProceedToPayment}
                      loading={processingPayment}
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{
                        py: 2.5,
                        px: 6,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        minWidth: 280,
                        borderRadius: 4,
                        textTransform: 'none',
                        boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 16px 45px ${alpha(theme.palette.primary.main, 0.5)}`,
                        }
                      }}
                    >
                      {processingPayment ? 'Traitement...' : '🚀 Procéder au paiement'}
                    </LoadingButton>
                  </Box>
                </Grid>
              </Grid>
            </SummaryCard>
          </Slide>
        )}
      </Container>
    </Page>
  );
};

// Default export
export default SubscriptionPlans;