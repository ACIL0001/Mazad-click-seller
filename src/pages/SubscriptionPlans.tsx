import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Grid, Card, CardContent, Button,
  Divider, CircularProgress, Alert, Chip, List, ListItem, ListItemIcon, ListItemText, CardActions,
  Fade, Slide, useTheme, alpha, IconButton, Stack
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DiamondIcon from '@mui/icons-material/Diamond';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

// Mock API for demonstration
const SubscriptionAPI = {
  getPlansByRole: async (role) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const plans = [
      {
        id: 1,
        name: 'Essentiel',
        role: 'PROFESSIONAL',
        price: 2500,
        description: 'Parfait pour débuter votre activité professionnelle',
        isActive: true
      },
      {
        id: 2,
        name: 'Premium',
        role: 'PROFESSIONAL',
        price: 5000,
        description: 'Solution complète pour les professionnels établis',
        isActive: true
      },
      {
        id: 3,
        name: 'Enterprise',
        role: 'RESELLER',
        price: 8500,
        description: 'Outils avancés pour les grandes entreprises',
        isActive: true
      }
    ];
    return { plans: plans.filter(p => p.role === role) };
  }
};

// Page wrapper component
const Page = ({ children, title }) => {
  useEffect(() => {
    document.title = title || "Plans d'abonnement";
  }, [title]);
  return <Box>{children}</Box>;
};

// Animations
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(3deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Background subscription icons animation
const subscriptionFloat = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.1; }
  25% { transform: translateY(-10px) translateX(5px) rotate(2deg); opacity: 0.2; }
  50% { transform: translateY(-15px) translateX(-3px) rotate(-1deg); opacity: 0.15; }
  75% { transform: translateY(-8px) translateX(4px) rotate(1deg); opacity: 0.25; }
`;

// Modern styled components with subscription-themed background
const MainContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #f8faff 0%, #e3f2fd 25%, #ffffff 50%, #f0f7ff 75%, #e8f4fd 100%),
    radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(25, 118, 210, 0.06) 0%, transparent 50%)
  `,
  backgroundSize: '400% 400%, 800px 800px, 600px 600px',
  animation: `${gradientShift} 25s ease infinite`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 90% 80%, rgba(147, 197, 253, 0.03) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  }
}));

// Subscription background icons
const SubscriptionIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  color: '#1976d2',
  opacity: 0.1,
  animation: `${subscriptionFloat} 8s ease-in-out infinite`,
  pointerEvents: 'none',
  zIndex: 0,
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  textAlign: 'center',
  padding: theme.spacing(6, 0, 4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-30%',
    left: '50%',
    width: '120%',
    height: '160%',
    background: `
      conic-gradient(from 45deg at 50% 50%, 
        rgba(59, 130, 246, 0.08) 0deg, 
        rgba(147, 197, 253, 0.04) 90deg, 
        rgba(219, 234, 254, 0.06) 180deg, 
        rgba(59, 130, 246, 0.05) 270deg, 
        rgba(59, 130, 246, 0.08) 360deg)
    `,
    transform: 'translateX(-50%)',
    borderRadius: '50%',
    zIndex: -1,
    animation: `${floatAnimation} 25s ease-in-out infinite`,
  }
}));

const TitleGradient = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    #1565c0 0%, 
    #1976d2 25%, 
    #2196f3 50%, 
    #42a5f5 75%, 
    #64b5f6 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundSize: '200% 200%',
  animation: `${gradientShift} 6s ease infinite`,
  fontWeight: 800,
  letterSpacing: '-0.02em',
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: `linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 197, 253, 0.15))`,
  animation: `${pulseAnimation} 5s ease-in-out infinite`,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(59, 130, 246, 0.08)',
}));

const PlanCard = styled(Card)<{ selected?: boolean; popular?: boolean }>(({ theme, selected, popular }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: 24,
  border: 'none',
  background: selected 
    ? `linear-gradient(145deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(240, 247, 255, 0.98) 50%, 
        rgba(227, 242, 253, 0.95) 100%)`
    : `linear-gradient(145deg, 
        rgba(255, 255, 255, 0.9) 0%, 
        rgba(248, 250, 252, 0.95) 100%)`,
  backdropFilter: 'blur(20px)',
  boxShadow: selected
    ? `
        0 24px 48px -8px rgba(59, 130, 246, 0.2),
        0 0 0 2px rgba(59, 130, 246, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9)
      `
    : `
        0 12px 24px -6px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(59, 130, 246, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.7)
      `,
  transform: selected ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)',
  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:hover': {
    transform: selected ? 'translateY(-12px) scale(1.03)' : 'translateY(-6px) scale(1.01)',
    boxShadow: selected
      ? `
          0 32px 64px -8px rgba(59, 130, 246, 0.25),
          0 0 0 2px rgba(59, 130, 246, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 1)
        `
      : `
          0 16px 32px -6px rgba(59, 130, 246, 0.1),
          0 0 0 1px rgba(59, 130, 246, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
  },
  '&::before': popular ? {
    content: '"⭐ POPULAIRE"',
    position: 'absolute',
    top: 20,
    right: -35,
    background: `linear-gradient(135deg, #1565c0, #1976d2)`,
    color: 'white',
    padding: '6px 40px',
    fontSize: '0.7rem',
    fontWeight: 700,
    transform: 'rotate(45deg)',
    zIndex: 2,
    boxShadow: '0 6px 12px rgba(21, 101, 192, 0.25)',
    letterSpacing: '0.3px',
  } : {},
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: selected 
      ? `linear-gradient(90deg, #1565c0, #1976d2, #2196f3)` 
      : `linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(147, 197, 253, 0.4))`,
    borderRadius: '24px 24px 0 0',
  }
}));

const PlanIcon = styled(Box)(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `
    linear-gradient(135deg, 
      rgba(59, 130, 246, 0.08) 0%, 
      rgba(147, 197, 253, 0.15) 50%, 
      rgba(219, 234, 254, 0.2) 100%)
  `,
  border: `2px solid rgba(59, 130, 246, 0.1)`,
  marginBottom: theme.spacing(2),
  position: 'relative',
  backdropFilter: 'blur(8px)',
}));

const FeatureItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 0),
  borderRadius: 12,
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    padding: theme.spacing(0.5, 1.5),
    transform: 'translateX(6px)',
  },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(1.2, 2.5),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const PrimaryButton = styled(ModernButton)(({ theme }) => ({
  background: `linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #2196f3 100%)`,
  color: 'white',
  boxShadow: `
    0 10px 20px rgba(21, 101, 192, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15)
  `,
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: `
      0 12px 24px rgba(21, 101, 192, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2)
    `,
  },
}));

const getPlanIcon = (planRole: string) => {
  const iconProps = { sx: { fontSize: 36, color: '#1976d2' } };
  
  if (planRole === 'PROFESSIONAL') {
    return <WorkspacePremiumIcon {...iconProps} />;
  }
  if (planRole === 'RESELLER') {
    return <StoreIcon {...iconProps} />;
  }
  return <DiamondIcon {...iconProps} />;
};

const SubscriptionPlans = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userRole, setUserRole] = useState('PROFESSIONAL'); // Mock user role

  useEffect(() => {
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
        setError('Impossible de charger les plans d\'abonnement. Veuillez réessayer.');
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [userRole]);

  const handleProceedToPayment = () => {
    if (!selectedPlan) {
      setError('Veuillez sélectionner un plan avant de continuer.');
      return;
    }
    
    navigate('/payment-method-selection', {
      state: { selectedPlan }
    });
  };

  const PlanFeatureList = ({ role }) => {
    let features = [];
    if (role === 'PROFESSIONAL') {
      features = [
        { text: 'Accès à un réseau de professionnels', icon: <BusinessIcon sx={{ fontSize: 18 }} /> },
        { text: 'Fonctionnalités avancées de recherche', icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
        { text: 'Statistiques de marché', icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
        { text: 'Support technique prioritaire', icon: <SupportAgentIcon sx={{ fontSize: 18 }} /> }
      ];
    } else if (role === 'RESELLER') {
      features = [
        { text: 'Outils avancés de revente', icon: <StoreIcon sx={{ fontSize: 18 }} /> },
        { text: 'Accès aux listes d\'enchères exclusives', icon: <SecurityIcon sx={{ fontSize: 18 }} /> },
        { text: 'Rapports d\'analyse de profitabilité', icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
        { text: 'Support dédié aux revendeurs', icon: <SupportAgentIcon sx={{ fontSize: 18 }} /> }
      ];
    }

    return (
      <List dense sx={{ mt: 2 }}>
        {features.map((feature, index) => (
          <FeatureItem key={index} disableGutters>
            <ListItemIcon sx={{ 
              minWidth: 32, 
              color: '#1976d2',
              '& .MuiSvgIcon-root': {
                filter: 'drop-shadow(0 1px 2px rgba(25, 118, 210, 0.15))'
              }
            }}>
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

  if (loading) {
    return (
      <MainContainer>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 3
        }}>
          <Box sx={{ position: 'relative' }}>
            <CircularProgress 
              size={56} 
              thickness={3} 
              sx={{ 
                color: '#1976d2',
                filter: 'drop-shadow(0 3px 6px rgba(25, 118, 210, 0.2))'
              }} 
            />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 24, color: '#1976d2', animation: `${pulseAnimation} 2s infinite` }} />
            </Box>
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              background: `linear-gradient(135deg, #1565c0, #1976d2, #2196f3)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600
            }}
          >
            Chargement de vos plans...
          </Typography>
        </Box>
      </MainContainer>
    );
  }

  if (error) {
    return (
      <MainContainer>
        <Container maxWidth="md" sx={{ pt: 8 }}>
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: 3,
                fontSize: '1rem',
                py: 2.5,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(244, 67, 54, 0.15)'
              }}
            >
              {error}
            </Alert>
          </Fade>
        </Container>
      </MainContainer>
    );
  }

  return (
    <Page title="Plans d'Abonnement Premium">
      <MainContainer>
        {/* Subscription-themed floating background icons */}
        <SubscriptionIcon sx={{ top: '8%', left: '4%', animationDelay: '0s' }}>
          <CreditCardIcon sx={{ fontSize: 40 }} />
        </SubscriptionIcon>
        <SubscriptionIcon sx={{ top: '15%', right: '6%', animationDelay: '2s' }}>
          <WorkspacePremiumIcon sx={{ fontSize: 35 }} />
        </SubscriptionIcon>
        <SubscriptionIcon sx={{ top: '60%', left: '2%', animationDelay: '4s' }}>
          <ShoppingCartIcon sx={{ fontSize: 32 }} />
        </SubscriptionIcon>
        <SubscriptionIcon sx={{ top: '45%', right: '3%', animationDelay: '1s' }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 38 }} />
        </SubscriptionIcon>
        <SubscriptionIcon sx={{ top: '75%', left: '8%', animationDelay: '3s' }}>
          <VerifiedIcon sx={{ fontSize: 30 }} />
        </SubscriptionIcon>
        <SubscriptionIcon sx={{ bottom: '10%', right: '7%', animationDelay: '5s' }}>
          <StarIcon sx={{ fontSize: 34 }} />
        </SubscriptionIcon>

        {/* Small floating elements */}
        <FloatingElement sx={{ top: '12%', left: '8%', width: 80, height: 80, animationDelay: '0s' }} />
        <FloatingElement sx={{ top: '25%', right: '10%', width: 60, height: 60, animationDelay: '1.5s' }} />
        <FloatingElement sx={{ bottom: '20%', left: '5%', width: 70, height: 70, animationDelay: '3s' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <HeroSection>
            <Fade in timeout={800}>
              <Box>
                <TitleGradient 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    lineHeight: 0.9,
                    mb: 2,
                    textShadow: '0 3px 15px rgba(25, 118, 210, 0.15)'
                  }}
                >
                  Plans Abonnement
                </TitleGradient>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#424242',
                    fontWeight: 300,
                    fontSize: { xs: '1.1rem', md: '1.4rem' },
                    mb: 1,
                    opacity: 0.8
                  }}
                >
                  {userRole === 'PROFESSIONAL' ? 'Solutions Professionnelles' : 'Solutions Revendeurs'}
                </Typography>

                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#666',
                    fontWeight: 400,
                    maxWidth: '500px',
                    mx: 'auto',
                    lineHeight: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  Choisissez le plan qui correspond à vos besoins et commencez dès aujourd'hui.
                </Typography>
              </Box>
            </Fade>
          </HeroSection>

          <Container maxWidth="md" sx={{ pb: 6 }}>
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
              {plans.map((plan, index) => (
                <Grid item xs={12} sm={6} md={4} key={plan.id || index}>
                  <Slide in timeout={600 + index * 150} direction="up">
                    <PlanCard
                      selected={selectedPlan?.id === plan.id}
                      popular={index === 1}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3, textAlign: 'center' }}>
                        <PlanIcon>
                          {getPlanIcon(plan.role)}
                        </PlanIcon>
                        
                        <Typography 
                          variant="h4" 
                          component="h2" 
                          sx={{ 
                            fontWeight: 700,
                            mb: 1.5,
                            fontSize: '1.5rem',
                            background: `linear-gradient(135deg, #1565c0, #1976d2)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {plan.name}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              fontWeight: 800,
                              fontSize: '2rem',
                              lineHeight: 1,
                              background: `linear-gradient(135deg, #1565c0, #2196f3)`,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              textShadow: '0 2px 10px rgba(25, 118, 210, 0.1)'
                            }}
                          >
                            {plan.price.toLocaleString('fr-DZ')}
                            <Typography 
                              component="span" 
                              variant="h6" 
                              sx={{ 
                                ml: 0.5, 
                                color: '#666',
                                fontWeight: 400,
                                fontSize: '1rem'
                              }}
                            >
                              DZD
                            </Typography>
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#666',
                            fontSize: '0.9rem',
                            lineHeight: 1.4,
                            mb: 2,
                            px: 0.5
                          }}
                        >
                          {plan.description}
                        </Typography>
                        
                        <Divider 
                          sx={{ 
                            my: 2, 
                            background: `linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.2), transparent)`,
                            height: 1.5,
                            border: 'none'
                          }} 
                        />
                        
                        <PlanFeatureList role={plan.role} />
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'center', p: 3, pt: 0 }}>
                        {selectedPlan?.id === plan.id ? (
                          <PrimaryButton
                            fullWidth
                            size="medium"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => setSelectedPlan(plan)}
                          >
                            Plan Sélectionné
                          </PrimaryButton>
                        ) : (
                          <ModernButton
                            variant="outlined"
                            fullWidth
                            size="medium"
                            onClick={() => setSelectedPlan(plan)}
                            sx={{
                              borderColor: '#1976d2',
                              color: '#1976d2',
                              borderWidth: 1.5,
                              '&:hover': {
                                borderColor: '#1565c0',
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                transform: 'translateY(-1px)',
                              }
                            }}
                          >
                            Choisir ce Plan
                          </ModernButton>
                        )}
                      </CardActions>
                    </PlanCard>
                  </Slide>
                </Grid>
              ))}
            </Grid>

            {selectedPlan && (
              <Slide in timeout={800} direction="up">
                <Box sx={{ mt: 5 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      p: 4,
                      maxWidth: '600px',
                      mx: 'auto'
                    }}
                  >
                    {/* Simple Header */}
                    <Box textAlign="center" mb={4}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#333',
                          mb: 1
                        }}
                      >
                        Résumé de commande
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vérifiez votre sélection avant de continuer
                      </Typography>
                    </Box>
                    
                    {/* Plan Summary */}
                    <Box 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2, 
                        background: '#f8f9fa',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        mb: 3
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {selectedPlan.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedPlan.description}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              fontWeight: 700,
                              color: '#1976d2'
                            }}
                          >
                            {selectedPlan.price.toLocaleString('fr-DZ')} DZD
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    
                    {/* Payment Button */}
                    <LoadingButton
                      onClick={handleProceedToPayment}
                      loading={processingPayment}
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        py: 2,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        background: '#1976d2',
                        '&:hover': {
                          background: '#1565c0',
                        },
                      }}
                    >
                      {processingPayment ? 'Traitement...' : 'Continuer vers le paiement'}
                    </LoadingButton>

                    {/* Simple Trust Line */}
                    <Box sx={{ 
                      mt: 3, 
                      pt: 2, 
                      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" color="text.secondary">
                        Paiement sécurisé • Support 24/7 • Activation immédiate
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Slide>
            )}
          </Container>
        </Container>
      </MainContainer>
    </Page>
  );
};

export default SubscriptionPlans;