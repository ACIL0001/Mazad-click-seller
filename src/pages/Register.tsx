//------------------------------------------------------------------------------
// <copyright file="Register.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// @mui
import { styled, alpha } from '@mui/material/styles';
import {
  Link,
  Container,
  Typography,
  Box,
} from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Logo from '../components/Logo';
import Page from '../components/Page';
// sections
import { RegisterForm } from '../sections/auth/register';
import useAuth from '../hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';

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
  padding: '60px 0 8px',
  '@media (max-width: 599px)': {
    padding: '32px 0 8px',
  },
  '@media (min-width: 600px) and (max-width: 959px)': {
    padding: '36px 0 8px',
  },
  '@media (min-width: 960px)': {
    padding: '48px 0 8px',
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
    0 6px 24px 0 ${alpha(theme.palette.common.black, 0.12)},
    inset 0 1px 0 0 ${alpha(theme.palette.common.white, 0.4)},
    inset 0 -1px 0 0 ${alpha(theme.palette.common.black, 0.04)}
  `,
  borderRadius: '28px',
  padding: theme.spacing(3),
  paddingTop: '16px',
  position: 'relative',
  zIndex: 10,
  maxWidth: '480px',
  width: '100%',
  margin: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    margin: theme.spacing(1.5, 1.5, 1.5, 1.5),
    borderRadius: '20px',
    maxWidth: 'calc(100vw - 20px)',
  },
  '@media (min-width: 480px) and (max-width: 639px)': {
    padding: theme.spacing(3),
    margin: theme.spacing(2, 1.8),
    borderRadius: '22px',
  },
  '@media (min-width: 640px) and (max-width: 767px)': {
    padding: theme.spacing(3.5),
    margin: theme.spacing(2),
    borderRadius: '26px',
    maxWidth: '460px',
  },
  '@media (min-width: 768px)': {
    padding: theme.spacing(4),
    margin: theme.spacing(2.5),
    borderRadius: '30px',
    maxWidth: '480px',
  },
}));

// ----------------------------------------------------------------------

export default function Register() {
  const { t } = useTranslation();
  const { isLogged } = useAuth();
  const navigate = useNavigate();

  const smUp = useResponsive('up', 'sm');

  if (isLogged) {
    return <Navigate to="/dashboard/app" replace />;
  }

  return (
    <Page title={t('pages.register.title')}>
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
                sm: '1.65rem',
                md: '2rem',
                lg: '2.35rem',
              },
            }}
          >
            Créer un compte
          </Typography>
          
          <RegisterForm />

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
              Vous avez déjà un compte&nbsp;?&nbsp;
              <Link 
                variant="subtitle2" 
                to="/login" 
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
                Connectez-vous
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
            Vous avez déjà un compte ? 
            <Link
              variant="subtitle2"
              component={RouterLink}
              to="/login"
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
              Connectez-vous
            </Link>
          </Typography>
        )}
      </RootStyle>
    </Page>
  );
}