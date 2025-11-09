import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Typography, styled, Box, Link, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Page from '../components/Page';
import LoginForm from '../sections/auth/login/LoginForm';
import useAuth from '../hooks/useAuth';
import useResponsive from '../hooks/useResponsive';
import Logo from '../components/Logo';

// ----------------------------------------------------------------------

// Root container with white background
const RootStyle = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.common.white,
  padding: '80px 0 20px',
  
  // Responsive top padding for header
  '@media (max-width: 599px)': {
    padding: '40px 0 16px',
  },
  
  '@media (min-width: 600px) and (max-width: 959px)': {
    padding: '42px 0 20px',
  },
  
  '@media (min-width: 960px)': {
    padding: '46px 0 24px',
  },
}));

// Glassmorphism container
const GlassContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.85)} 0%,
    ${alpha(theme.palette.background.paper, 0.75)} 100%
  )`,
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: 'none',
  boxShadow: `
    0 8px 32px 0 ${alpha(theme.palette.common.black, 0.15)},
    inset 0 1px 0 0 ${alpha(theme.palette.common.white, 0.5)},
    inset 0 -1px 0 0 ${alpha(theme.palette.common.black, 0.05)}
  `,
  borderRadius: '32px',
  padding: theme.spacing(4),
  paddingTop: '18px',
  position: 'relative',
  zIndex: 10,
  maxWidth: '480px',
  width: '100%',
  margin: theme.spacing(3),
  
  // Extra small devices (phones, < 480px)
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(2, 1.5),
    borderRadius: '20px',
    maxWidth: 'calc(100vw - 24px)',
  },
  
  // Small devices (phones landscape, 480px - 639px)
  '@media (min-width: 480px) and (max-width: 639px)': {
  padding: theme.spacing(4),
    margin: theme.spacing(2.5, 2),
    borderRadius: '24px',
  },
  
  // Medium devices (tablets, 640px - 767px)
  '@media (min-width: 640px) and (max-width: 767px)': {
    padding: theme.spacing(5),
    margin: theme.spacing(3),
    borderRadius: '28px',
    maxWidth: '460px',
  },
  
  // Large devices (tablets landscape, 768px+)
  '@media (min-width: 768px)': {
    padding: theme.spacing(6),
    margin: theme.spacing(3),
    borderRadius: '32px',
    maxWidth: '480px',
  },
}));

// ----------------------------------------------------------------------

export default function Login() {
  const { t } = useTranslation();
  const { isLogged } = useAuth();
  const navigate = useNavigate();
  const smUp = useResponsive('up', 'sm');

  if (isLogged) {
    return <Navigate to="/post-login" replace />;
  }

  return (
    <Page title={t('pages.login.title')}>
      <RootStyle>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Logo
            sx={{
              height: { xs: 36, sm: 46, md: 54 },
              width: 'auto',
              maxWidth: { xs: 100, sm: 130, md: 150 },
            }}
          />
        </Box>

        {/* Glassmorphism Content Container */}
        <GlassContainer>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              mb: 2, 
              textAlign: 'center', 
              fontWeight: 800,
              background: `linear-gradient(135deg, #0063b1 0%, #00a3e0 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              fontSize: {
                xs: '1.4rem',
                sm: '1.6rem',
                md: '1.9rem',
                lg: '2.3rem',
              },
            }}
          >
              Se connecter
            </Typography>
            
            <LoginForm />

            {!smUp && (
            <Typography 
              variant="body2" 
              align="center" 
              sx={{ 
                mt: 3,
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
                color: 'primary.main',
                fontWeight: 600,
              }}
            >
                Pas encore de compte&nbsp;?&nbsp;
              <Link 
                variant="subtitle2" 
                to="/register" 
                component={RouterLink}
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                  color: 'primary.main',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  '&:hover': {
                    textDecoration: 'none',
                    opacity: 0.9,
                  },
                }}
              >
                    Créez un compte
              </Link>
              </Typography>
            )}
        </GlassContainer>

        {smUp && (
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              mt: 2,
              color: 'primary.main',
              fontSize: { sm: '0.85rem', md: '0.9rem' },
              fontWeight: 600,
            }}
          >
            Pas encore de compte&nbsp;?&nbsp;
            <Link 
              variant="subtitle2" 
              component={RouterLink} 
              to="/register" 
              sx={{ 
                color: 'primary.main', 
                textDecoration: 'underline',
                fontWeight: 700,
                '&:hover': {
                  textDecoration: 'none',
                  opacity: 0.9,
                },
              }}
            >
              Créez un compte
            </Link>
          </Typography>
        )}
      </RootStyle>
    </Page>
  );
}
