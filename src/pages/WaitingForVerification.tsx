import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Card, Divider, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Iconify from '../components/Iconify';
import Page from '../components/Page';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import { authStore } from '@/contexts/authStore';

// Full screen background with subtle gradient
const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  backgroundImage: 'linear-gradient(to bottom right, #f5f7ff 0%, #eef1f5 100%)',
}));

// Header with logo and back button
const HeaderStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: theme.spacing(4, 6),
}));

// Main content area
const ContentStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  padding: theme.spacing(0, 3),
}));

// Modern card for content
const MainCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 1200,
  borderRadius: 20,
  padding: theme.spacing(6),
  boxShadow: '0 10px 40px 0 rgba(18, 106, 211, 0.07)',
  background: '#ffffff',
  overflow: 'visible',
  position: 'relative',
}));

// Timeline connector line
const TimelineConnector = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '30%',
  left: 0,
  right: 0,
  height: 3,
  backgroundColor: theme.palette.grey[200],
  zIndex: 0,
}));

// Step indicator for the verification process
const StepIndicator = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  marginBottom: theme.spacing(6),
  marginTop: theme.spacing(2),
}));

// Footer style
const FooterStyle = styled('footer')(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  opacity: 0.8,
}));

export default function WaitingForVerification() {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    authStore.getState().clear();
    navigate('/login');
  };

  // Verification steps
  const steps = [
    { 
      id: 1, 
      label: "Documents Soumis", 
      completed: true, 
      active: false,
      icon: "eva:checkmark-fill",
      description: "Vos documents ont été téléchargés avec succès"
    },
    { 
      id: 2, 
      label: "Vérification en Cours", 
      completed: false, 
      active: true,
      icon: "eva:file-text-fill",
      description: "Notre équipe vérifie actuellement vos documents"
    },
    { 
      id: 3, 
      label: "Accès Complet", 
      completed: false, 
      active: false,
      icon: "eva:unlock-fill",
      description: "Vous pourrez accéder à toutes les fonctionnalités"
    }
  ];

  return (
    <Page title="Vérification en Attente">
      <RootStyle>
        <HeaderStyle>
          <Logo sx={{ height: 110, width: 'auto' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/login"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={handleLogout}
              sx={{ 
                height: 45, 
                borderRadius: 3,
                px: 3,
                fontSize: 15,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Retour à la connexion
            </Button>
          </Box>
        </HeaderStyle>

        <ContentStyle>
          <MainCard>
            <Grid container spacing={3}>
              {/* Left section with header and illustration */}
              <Grid item xs={12} md={5}>
                <Box sx={{ pr: { md: 5 }, pb: { xs: 5, md: 0 } }}>
                  <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'primary.dark' }}>
                    Vérification de votre compte
                  </Typography>
                  
                  <Typography variant="h5" sx={{ mb: 3, color: 'text.secondary', fontWeight: 400 }}>
                    Merci pour votre inscription
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                    Vos documents d'identité sont en cours d'examen par notre équipe. 
                    Ce processus peut prendre entre 24 et 48 heures ouvrables.
                  </Typography>
                </Box>
              </Grid>

              {/* Right section with verification steps */}
              <Grid item xs={12} md={7}>
                <Box sx={{ height: '100%' }}>
                  <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
                    État de votre vérification
                  </Typography>

                  <StepIndicator>
                    <TimelineConnector />
                    <Grid container spacing={3}>
                      {steps.map((step) => (
                        <Grid item xs={12} md={4} key={step.id}>
                          <Paper sx={{
                            padding: theme.spacing(4),
                            borderRadius: 4,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1,
                            backgroundColor: step.active ? theme.palette.primary.light : '#ffffff',
                            boxShadow: step.active 
                              ? '0 20px 50px 0 rgba(27, 86, 201, 0.15)' 
                              : '0 5px 20px 0 rgba(27, 86, 201, 0.05)',
                            border: step.completed 
                              ? `2px solid ${theme.palette.success.main}` 
                              : step.active 
                                ? `2px solid ${theme.palette.primary.main}` 
                                : '2px solid transparent',
                            transform: step.active ? 'translateY(-10px)' : 'translateY(0)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 15px 30px 0 rgba(27, 86, 201, 0.1)',
                            }
                          }}>
                            <Box sx={{
                              width: 70,
                              height: 70,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: theme.spacing(2),
                              backgroundColor: step.completed 
                                ? theme.palette.success.main 
                                : step.active 
                                  ? theme.palette.primary.main 
                                  : theme.palette.grey[100],
                              color: (step.completed || step.active) ? '#ffffff' : theme.palette.text.secondary,
                              boxShadow: (step.completed || step.active) ? '0 10px 20px 0 rgba(0, 0, 0, 0.1)' : 'none',
                            }}>
                              <Iconify icon={step.icon} width={30} height={30} />
                            </Box>
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                              {step.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {step.description}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </StepIndicator>

                  <Divider sx={{ my: 4 }} />

                  <Box sx={{ p: 4, bgcolor: 'background.neutral', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Iconify 
                        icon="eva:info-fill" 
                        width={24} 
                        height={24} 
                        sx={{ 
                          mr: 2, 
                          mt: 0.5, 
                          color: 'primary.main' 
                        }} 
                      />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          Que se passe-t-il maintenant ?
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Une fois vos documents vérifiés, vous recevrez un email de confirmation.
                          Vous pourrez alors vous connecter et accéder à toutes les fonctionnalités de MazadClick.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    href="mailto:support@mazadclick.com"
                    startIcon={<Iconify icon="eva:email-fill" />}
                    sx={{ 
                      mt: 4, 
                      height: 55, 
                      borderRadius: 3,
                      fontSize: 16,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                    fullWidth
                  >
                    Besoin d'aide ? Contactez notre support
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </MainCard>
        </ContentStyle>

        <FooterStyle>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} MazadClick. Tous droits réservés.
          </Typography>
        </FooterStyle>
      </RootStyle>
    </Page>
  );
} 