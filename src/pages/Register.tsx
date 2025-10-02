//------------------------------------------------------------------------------
// <copyright file="Register.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// @mui
import { styled } from '@mui/material/styles';
import {
  Link,
  Container,
  Typography,
} from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Logo from '../components/Logo';
import Page from '../components/Page';
// sections
import { RegisterForm } from '../sections/auth/register';
import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  padding: theme.spacing(3),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
    padding: theme.spacing(7, 5, 0, 7),
  },
}));

const SectionStyle = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: theme.shadows[8],
  backgroundColor: theme.palette.background.default,
  '& img': {
    width: '100%',
    height: '100vh',
    objectFit: 'cover',
  },
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Register() {
  const { t } = useTranslation();
  const { isLogged } = useAuth();

  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');

  const renderSection = (
    <SectionStyle>
      <img 
        alt="register" 
        src="/static/logo/mazadclick-cover.png" 
        onError={(e) => {
          // Silently hide the image if it fails to load
          e.currentTarget.style.display = 'none';
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </SectionStyle>
  );

  const renderContent = (
    <Container maxWidth="sm">
      <ContentStyle>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>
          Créer un compte
        </Typography>
        
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>
          Rejoignez notre plateforme et commencez à acheter et vendre en toute sécurité
        </Typography>

        <RegisterForm />

        {!smUp && (
          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            {t('pages.register.alreadyHaveAccount')} &nbsp;
            <Link variant="subtitle2" to="/login" component={RouterLink}>
              {t('pages.register.signInLink')}
            </Link>
          </Typography>
        )}
      </ContentStyle>
    </Container>
  );

  if (isLogged) {
    return <Navigate to="/dashboard/app" replace />;
  }

  return (
    <Page title={t('pages.register.title')}>
      <RootStyle>
        <HeaderStyle>
          <Logo />
          {smUp && (
            <Typography variant="body2" sx={{ mt: { md: -2 } }}>
              {t('pages.register.alreadyHaveAccount')} &nbsp;
              <Link variant="subtitle2" component={RouterLink} to="/login">
                {t('pages.register.signInLink')}
              </Link>
            </Typography>
          )}
        </HeaderStyle>

        {mdUp && renderSection}
        {renderContent}
      </RootStyle>
    </Page>
  );
}