//------------------------------------------------------------------------------
// <copyright file="Login.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
// @mui
import { styled } from '@mui/material/styles';
import {
  Link,
  Container,
  Typography,
  TextField,
  Alert,
  Stack,
  Box,
  Paper,
  IconButton,
  InputAdornment,
  useTheme,
  CircularProgress
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Logo from '../components/Logo';
import Page from '../components/Page';
import Iconify from '../components/Iconify';
// auth
import { AuthAPI } from '../api/auth';
import { authStore } from '../contexts/authStore';
import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { ACCOUNT_TYPE } from '../types/User';

// Helper function to create alpha color
function alpha(color: string, value: number): string {
  return `rgba(${hexToRgb(color)}, ${value})`;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

// ----------------------------------------------------------------------

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: theme.transitions.create(['box-shadow', 'border-color']),
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    }
  },
  marginBottom: theme.spacing(2)
}));

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

function LoginForm() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [afterSubmitError, setAfterSubmitError] = useState('');
  const { t } = useTranslation();

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Format d\'email invalide')
      .required('L\'email est requis'),
    password: Yup.string().required('Le mot de passe est requis'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: true,
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setErrors, setSubmitting, resetForm }) => {
      try {
        setAfterSubmitError(''); // Clear previous errors
        const response = await AuthAPI.login({
          login: values.email, // Changed from email to login to match API expectations
          password: values.password,
        });
        
        console.log('Login response:', response);
        
        // Extract data from the response based on its structure
        let tokens, user;
        
        // Handle different response structures
        if (response?.data) {
          // Response is wrapped in data property (axios full response)
          tokens = response.data.session || response.data.tokens;
          user = response.data.user;
          console.log('Response has data structure, extracted tokens and user:', { tokens, user });
        } else {
          // Direct response object
          tokens = response.session || response.tokens;
          user = response.user;
          console.log('Response has direct structure, extracted tokens and user:', { tokens, user });
        }
        
        if (!tokens || !user) {
          console.error('Invalid response format, missing tokens or user:', response);
          throw new Error('Invalid response format');
        }
        
        // Format tokens for storage
        const formattedTokens = {
          accessToken: tokens.access_token || tokens.accessToken,
          refreshToken: tokens.refresh_token || tokens.refreshToken,
        };
        
        // Store auth data
        console.log('🔐 Login - Storing auth data:', { tokens: formattedTokens, user: user });
        authStore.getState().set({
          tokens: formattedTokens,
          user: user,
        });
        console.log('🔐 Login - Auth data stored successfully');
        
        resetForm();
        
        // Check if user is verified
        console.log('🔐 Login - User verification status:', user);
        console.log('🔐 Login - isVerified raw value:', user.isVerified);
        
        // Strict comparison with boolean true or handle undefined/null cases
        // Check verification status only for PROFESSIONAL users
        if (user.type === ACCOUNT_TYPE.PROFESSIONAL) {
          // In some APIs, isVerified might be undefined if the user is verified by default
          const isVerified = user.isVerified === true || (user.isVerified !== false && user.isVerified !== 0);
          console.log('🔐 Login - Professional user isVerified check result:', isVerified);
          
          if (isVerified) {
            // Redirect to dashboard for verified professional users
            console.log('🔐 Login - Professional user is verified, redirecting to dashboard');
            navigate('/dashboard/app');
            enqueueSnackbar('Connexion réussie!', { variant: 'success' });
          } else {
            // For unverified professional users, redirect to waiting for verification page
            console.log('🔐 Login - Professional user is not verified, redirecting to waiting page');
            navigate('/waiting-for-verification');
            enqueueSnackbar('Votre compte est en attente de vérification.', { 
              variant: 'warning',
              preventDuplicate: true 
            });
          }
        } else {
          // CLIENT and RESELLER users don't need verification - redirect directly to dashboard
          console.log('🔐 Login - Client/Reseller user, redirecting to dashboard without verification check');
          navigate('/dashboard/app');
          enqueueSnackbar('Connexion réussie!', { variant: 'success' });
        }
      } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
        
        if (error?.response?.data?.message) {
          // Handle array of validation errors
          if (Array.isArray(error.response.data.message)) {
            // Join all validation messages
            errorMessage = error.response.data.message.join('. ');
          } else {
            errorMessage = error.response.data.message;
          }
          
          // Check if phone verification required
          if (errorMessage.includes('vérification') || errorMessage.includes('verification') || 
              error.response.data.requiresPhoneVerification) {
            navigate('/otp-verification', {
              state: {
                fromLogin: true,
                login: values.email,
                phone: error.response.data.phone
              }
            });
            return;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Log the actual validation errors to help debug
        if (error?.response?.data?.message && Array.isArray(error.response.data.message)) {
          console.log('Validation errors:', error.response.data.message);
        }
        
        setAfterSubmitError(errorMessage); // Use the new state variable
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <FormikProvider value={formik}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: 'primary.main'
          }
        }}
      >
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {afterSubmitError && (
              <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>
                {afterSubmitError}
              </Alert>
            )}
            
            <StyledTextField
              fullWidth
              autoComplete="username"
              type="email"
              label={t('auth.email')}
              placeholder="exemple@email.com"
              {...getFieldProps('email')}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:email-fill" width={20} height={20} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              label={t('auth.password')}
              {...getFieldProps('password')}
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password && errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:lock-fill" width={20} height={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleShowPassword} edge="end">
                      <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Box
                component="span"
                role="button"
                onClick={() => navigate('/forgot-password')}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {t('auth.forgotPassword')}
              </Box>
            </Box>
          </Stack>

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ 
              borderRadius: 1.5,
              py: 1.5,
              boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
              '&:hover': {
                boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
              }
            }}
          >
            {t('auth.login')}
          </LoadingButton>
        </Form>
      </Paper>
      
      {/* Modal for unverified users - removed since we redirect instead */}
    </FormikProvider>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const { isLogged, auth, isReady } = useAuth();

  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');

  const renderSection = (
    <SectionStyle>
      <img alt="login" src="/static/logo/mazadclick-cover.png" />
    </SectionStyle>
  );

  const renderContent = (
    <Container maxWidth="sm">
      <ContentStyle>
        <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
          <Typography variant="h4" gutterBottom>
            {t('pages.login.title')}
          </Typography>

          <Stack direction="row" spacing={0.5}>
            <Typography variant="body2"> {t('pages.login.subtitle')} </Typography>
          </Stack>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          {t('pages.login.loginRequired')}
        </Alert>

        <LoginForm />

        {!smUp && (
          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            {t('pages.login.dontHaveAccount')} &nbsp;
            <Link variant="subtitle2" to="/register" component={RouterLink}>
              {t('pages.login.signUpLink')}
            </Link>
          </Typography>
        )}
      </ContentStyle>
    </Container>
  );

  // Wait for auth to be ready before making any decisions
  if (!isReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if user is already logged in and verified
  if (isLogged && auth?.user) {
    // Only check verification for PROFESSIONAL users
    if (auth.user.type === ACCOUNT_TYPE.PROFESSIONAL) {
  const isVerified = auth.user.isVerified === true || 
                    (auth.user.isVerified !== false && auth.user.isVerified !== 0);
  
  if (isVerified) {
    return <Navigate to="/dashboard/app" replace />;
  } else {
    return <Navigate to="/waiting-for-verification" replace />;
  }
} else {
  // CLIENT and RESELLER users don't need verification - redirect to dashboard
  return <Navigate to="/dashboard/app" replace />;
}

  return (
    <Page title={t('pages.login.title')}>
      <RootStyle>
        <HeaderStyle>
          <Logo />
          {smUp && (
            <Typography variant="body2" sx={{ mt: { md: -2 } }}>
              {t('pages.login.dontHaveAccount')} &nbsp;
              <Link variant="subtitle2" component={RouterLink} to="/register">
                {t('pages.login.signUpLink')}
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