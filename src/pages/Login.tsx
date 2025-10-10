import React from 'react';
import { Navigate } from 'react-router-dom';
import { Typography, styled, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Page from '../components/Page';
import LoginForm from '../sections/auth/login/LoginForm';
import useAuth from '../hooks/useAuth';
import useResponsive from '../hooks/useResponsive';

// ----------------------------------------------------------------------

const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const ImageSection = styled('div')(({ theme }) => ({
  flex: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.grey[50],
  [theme.breakpoints.down('md')]: {
    minHeight: '40vh',
    flex: 'none',
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.spacing(1),
    boxShadow: theme.customShadows.card,
  },
}));

const FormSection = styled('div')(({ theme }) => ({
  flex: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('md')]: {
    minHeight: '60vh',
    flex: 'none',
  },
}));

const ContentStyle = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
}));

// ----------------------------------------------------------------------

export default function Login() {
  const { t } = useTranslation();
  const { isLogged } = useAuth();
  const smUp = useResponsive('up', 'sm');

  if (isLogged) {
    return <Navigate to="/post-login" replace />;
  }

  return (
    <Page title={t('pages.login.title')}>
      <LoginContainer>
        <ImageSection>
          {navigator.onLine && (
            <img 
              alt="login" 
              src="/static/logo/mazadclick-cover.jpg" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </ImageSection>
        
        <FormSection>
          <ContentStyle>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>
              Se connecter
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>
              Connectez-vous à votre compte pour accéder à la plateforme
            </Typography>

            <LoginForm />

            {!smUp && (
              <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                Pas encore de compte? &nbsp;
                <RouterLink to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography variant="subtitle2" component="span" sx={{ color: 'primary.main' }}>
                    Créer un compte
                  </Typography>
                </RouterLink>
              </Typography>
            )}
          </ContentStyle>
        </FormSection>
      </LoginContainer>
    </Page>
  );
}
