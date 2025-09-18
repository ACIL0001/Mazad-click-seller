//------------------------------------------------------------------------------
// <copyright file="Page404.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>                                                                
//------------------------------------------------------------------------------


import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// material
import { styled } from '@mui/material/styles';
import { Button, Typography, Container } from '@mui/material';
// components
import Page from '../components/Page';
import SvgIconStyle from '../components/SvgIconStyle';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10),
}));

// ----------------------------------------------------------------------

export default function Page404() {
  const { t } = useTranslation();

  return (
    <Page title={t('pages.notFound.title')}>
      <RootStyle>
        <Container maxWidth="lg">
          <SvgIconStyle
            src="/static/illustrations/illustration_404.svg"
            sx={{
              width: 560,
              maxWidth: '100%',
              height: 320,
            }}
          />

          <Typography variant="h3" sx={{ mb: 2 }}>
            {t('pages.notFound.title')}
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            {t('pages.notFound.subtitle')}
          </Typography>

          <Button
            size="large"
            variant="contained"
            component={RouterLink}
            to="/"
            sx={{ mt: 5 }}
          >
            {t('pages.notFound.backToHome')}
          </Button>
        </Container>
      </RootStyle>
    </Page>
  );
}
