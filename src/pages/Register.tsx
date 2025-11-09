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
  maxWidth: '540px',
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
    maxWidth: '500px',
  },
  
  // Large devices (tablets landscape, 768px+)
  '@media (min-width: 768px)': {
    padding: theme.spacing(6),
    margin: theme.spacing(3),
    borderRadius: '32px',
    maxWidth: '540px',
  },
}));

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'fixed',
  padding: '2px 20px',
  minHeight: '36px',
  background: 'transparent',
  
  '@media (max-width: 599px)': {
    padding: '2px 12px',
    minHeight: '32px',
  },
  
  '@media (min-width: 600px) and (max-width: 959px)': {
    padding: '2px 16px',
    minHeight: '34px',
  },
  
  '@media (min-width: 960px)': {
    padding: '3px 24px',
    minHeight: '38px',
  },
  
  '@media (min-width: 1280px)': {
    padding: '4px 32px',
    minHeight: '40px',
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
        {/* Header */}
        <HeaderStyle>
          {/* Logo only - scaled smaller for compact header */}
          <Logo />
          
          {/* Right: Login link - Only on desktop */}
          {smUp && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'primary.main',
                fontSize: { 
                  xs: '0.7rem',
                  sm: '0.75rem',
                  md: '0.8rem',
                  lg: '0.85rem',
                },
                fontWeight: 600,
              }}
            >
              Vous avez déjà un compte&nbsp;?&nbsp;
              <Link 
                variant="subtitle2" 
                component={RouterLink} 
                to="/login" 
                sx={{ 
                  color: 'primary.main', 
                  textDecoration: 'underline',
                  fontSize: 'inherit',
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
        </HeaderStyle>

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
      </RootStyle>
    </Page>
  );
}