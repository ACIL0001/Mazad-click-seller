import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  LinearProgress,
  Chip,
  useTheme,
  styled,
  keyframes
} from '@mui/material';
import Iconify from '../components/Iconify';
import Page from '../components/Page';
import Logo from '../components/Logo';
import app from '../config';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
  100% { opacity: 0.4; transform: scale(1); }
`;

const slideIn = keyframes`
  0% { transform: translateX(-100px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

// Styled components
const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  backgroundImage: 'linear-gradient(to bottom right, #f5f7ff 0%, #eef1f5 100%)',
}));

const HeaderStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: theme.spacing(4, 6),
}));

const ContentStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  padding: theme.spacing(0, 3),
}));

const MainCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 500,
  borderRadius: 24,
  padding: theme.spacing(6),
  boxShadow: '0 20px 60px rgba(18, 106, 211, 0.15)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  overflow: 'hidden',
  position: 'relative',
  textAlign: 'center',
  animation: `${slideIn} 0.8s ease-out`,
}));

const LoadingIcon = styled(Box)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`,
  marginBottom: theme.spacing(3),
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: 'rgba(99, 102, 241, 0.05)',
  borderRadius: 16,
  border: '1px solid rgba(99, 102, 241, 0.1)',
}));

export default function SwitchingToBuyer() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { text: 'Préparation de la transition...', icon: 'eva:settings-2-fill' },
    { text: 'Connexion à l\'espace acheteur...', icon: 'eva:external-link-fill' },
    { text: 'Transfert de vos données...', icon: 'eva:swap-fill' },
    { text: 'Finalisation...', icon: 'eva:checkmark-circle-2-fill' }
  ];

  useEffect(() => {
    // Check if we have the required data
    const buyerSwitchData = sessionStorage.getItem('buyerSwitchData');
    if (!buyerSwitchData) {
      console.error('No buyer switch data found');
      navigate('/dashboard/app');
      return;
    }

    const switchData = JSON.parse(buyerSwitchData);
    const { accessToken, refreshToken } = switchData;

    // Simulate progress and handle the switch
    const switchToBuyer = async () => {
      try {
        // Step 1: Preparation
        setCurrentStep(0);
        setProgress(25);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Prepare for buyer app (no API call needed)
        setCurrentStep(1);
        setProgress(50);
        
        // Simulate API call time without actually calling the backend
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('✅ Switching to buyer app (no backend modification needed)');

        // Step 3: Data transfer simulation
        setCurrentStep(2);
        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 4: Finalization and redirect
        setCurrentStep(3);
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Clear session data
        sessionStorage.removeItem('buyerSwitchData');
        
        // Use buyer URL from config
        const buyerAppUrl = new URL(app.buyerURL);
        buyerAppUrl.searchParams.append('token', accessToken);
        buyerAppUrl.searchParams.append('refreshToken', refreshToken);
        buyerAppUrl.searchParams.append('from', 'seller');
        
        console.log('🔄 Redirecting to buyer app:', buyerAppUrl.toString());
        
        // Redirect to buyer app
        window.location.href = buyerAppUrl.toString();

      } catch (err) {
        console.error('❌ Error switching to buyer mode:', err);
        setError(err.message || 'Une erreur est survenue lors du basculement vers l\'espace acheteur');
        setProgress(0);
      }
    };

    switchToBuyer();
  }, [navigate]);

  if (error) {
    return (
      <Page title="Erreur de basculement">
        <RootStyle>
          <HeaderStyle>
            <Logo sx={{ height: 80, width: 'auto' }} />
          </HeaderStyle>
          <ContentStyle>
            <MainCard>
              <Box sx={{ color: 'error.main', mb: 3 }}>
                <Iconify icon="eva:alert-circle-fill" width={80} height={80} />
              </Box>
              <Typography variant="h4" gutterBottom color="error.main">
                Erreur de basculement
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {error}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Chip
                  label="Retour au tableau de bord"
                  onClick={() => navigate('/dashboard/app')}
                  sx={{ cursor: 'pointer', px: 2 }}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </MainCard>
          </ContentStyle>
        </RootStyle>
      </Page>
    );
  }

  return (
    <Page title="Basculement vers l'espace acheteur">
      <RootStyle>
        <HeaderStyle>
          <Logo sx={{ height: 80, width: 'auto' }} />
        </HeaderStyle>
        
        <ContentStyle>
          <MainCard>
            <LoadingIcon>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    right: -10,
                    bottom: -10,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={3}
                  sx={{
                    color: 'white',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
              </Box>
            </LoadingIcon>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.dark' }}>
              Basculement vers l'espace acheteur
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Veuillez patienter pendant que nous préparons votre transition...
            </Typography>

            <ProgressContainer>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {steps[currentStep]?.text || 'Traitement en cours...'}
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={600}>
                    {progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                {steps.map((step, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      opacity: index <= currentStep ? 1 : 0.3,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: index <= currentStep ? 'primary.main' : 'grey.300',
                        color: index <= currentStep ? 'white' : 'grey.500',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Iconify 
                        icon={step.icon} 
                        width={20} 
                        height={20} 
                        sx={{ 
                          animation: index === currentStep ? `${pulse} 1.5s ease-in-out infinite` : 'none'
                        }} 
                      />
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        textAlign: 'center', 
                        fontSize: '0.75rem',
                        color: index <= currentStep ? 'text.primary' : 'text.secondary',
                        fontWeight: index === currentStep ? 600 : 400,
                      }}
                    >
                      {step.text.split(' ').slice(0, 2).join(' ')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </ProgressContainer>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 4, fontStyle: 'italic' }}>
              Cette opération ne prendra que quelques secondes...
            </Typography>
          </MainCard>
        </ContentStyle>
      </RootStyle>
    </Page>
  );
}
