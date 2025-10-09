import React, { useState } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Alert,
  Link,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Iconify from '../../../components/Iconify';
import { AuthAPI } from '../../../api/auth';
import { authStore } from '../../../contexts/authStore';
import app from '../../../config';

// ----------------------------------------------------------------------

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const LoginSchema = Yup.object().shape({
    login: Yup.string()
      .required('Email ou numéro de téléphone requis'),
    password: Yup.string()
      .required('Mot de passe requis'),
  });

  const formik = useFormik({
    initialValues: {
      login: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoginError(null);
      
      try {
        console.log('🔐 Attempting login with:', { login: values.login, hasPassword: !!values.password });
        console.log('🔐 AuthAPI.login method:', AuthAPI.login);
        console.log('🔐 API base URL:', app.baseURL);
        console.log('🔐 API key:', app.apiKey ? 'Present' : 'Missing');
        
        const response = await AuthAPI.login({
          login: values.login,
          password: values.password,
        });

        console.log('🔐 Login response:', response);
        console.log('🔐 Response type:', typeof response);
        console.log('🔐 Response keys:', response ? Object.keys(response) : 'null/undefined');
        
        // Additional debugging for response structure
        if (response && typeof response === 'object') {
          console.log('🔐 Response has data property:', 'data' in response);
          console.log('🔐 Response has user property:', 'user' in response);
          console.log('🔐 Response has session property:', 'session' in response);
          if (response.data) {
            console.log('🔐 Response.data keys:', Object.keys(response.data));
            console.log('🔐 Response.data has user:', 'user' in response.data);
            console.log('🔐 Response.data has session:', 'session' in response.data);
          }
        }

        // Handle different response formats
        let loginData;
        if (response && response.data) {
          // Full axios response (when returnFullResponse = true)
          loginData = response.data;
          console.log('🔐 Using response.data:', loginData);
        } else {
          // Direct response data (when returnFullResponse = false)
          loginData = response;
          console.log('🔐 Using direct response:', loginData);
        }

        if (loginData && loginData.user && loginData.session) {
          const { user, session } = loginData;
          
          // Check if user is banned
          if (user.isBanned) {
            setLoginError('Votre compte a été banni. Vous ne pouvez pas vous connecter.');
            return;
          }

          // Store authentication data
          const authData = {
            user,
            tokens: {
              accessToken: session.accessToken,
              refreshToken: session.refreshToken,
            },
          };

          console.log('🔐 Storing auth data:', authData);
          authStore.getState().set(authData);

          // Redirect to post-login page to choose role
          console.log('🔐 Login successful, redirecting to post-login page');
          navigate('/post-login', { replace: true });
          
          if (onSuccess) {
            onSuccess();
          }
        } else {
          console.error('❌ Invalid login response structure:', loginData);
          console.error('❌ Expected: { user, session }');
          console.error('❌ Received:', loginData);
          throw new Error('Invalid response from server - missing user or session data');
        }
      } catch (error: any) {
        console.error('❌ Login error:', error);
        
        let errorMessage = 'Une erreur est survenue lors de la connexion.';
        
        if (error.response?.data?.message) {
          const serverMessage = error.response.data.message;
          if (serverMessage.includes('Invalid credentials - login')) {
            errorMessage = 'Email ou numéro de téléphone incorrect.';
          } else if (serverMessage.includes('Invalid credentials - password')) {
            errorMessage = 'Mot de passe incorrect.';
          } else if (serverMessage.includes('Phone number not verified')) {
            errorMessage = 'Votre numéro de téléphone n\'est pas vérifié. Veuillez vérifier votre numéro avec le code OTP qui vous a été envoyé.';
            // Redirect to OTP verification
            navigate('/otp-verification', { 
              state: { 
                phone: values.login,
                fromLogin: true 
              } 
            });
            return;
          } else {
            errorMessage = serverMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setLoginError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate>
        <Stack spacing={3}>
          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}

          <TextField
            fullWidth
            autoComplete="username"
            type="text"
            label="Email ou numéro de téléphone"
            placeholder="exemple@email.com ou 0555 12 34 56"
            {...getFieldProps('login')}
            error={Boolean(touched.login && errors.login)}
            helperText={touched.login && errors.login}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:person-fill" width={20} height={20} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            label="Mot de passe"
            placeholder="Entrez votre mot de passe"
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
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
          <Link 
            component="button" 
            variant="body2" 
            underline="hover"
            onClick={() => navigate('/reset-password')}
            sx={{ textAlign: 'left' }}
          >
            Mot de passe oublié?
          </Link>
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ py: 1.5 }}
        >
          Se connecter
        </LoadingButton>

        <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 3 }}>
          <Typography variant="body2">
            Pas encore de compte? &nbsp;
            <Link 
              variant="subtitle2" 
              component="button"
              onClick={() => navigate('/register')}
              underline="hover"
            >
              Créer un compte
            </Link>
          </Typography>
        </Stack>
      </Form>
    </FormikProvider>
  );
}