import { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { 
  Link, 
  Typography, 
  Stack, 
  TextField, 
  Button, 
  Box, 
  Paper,
  Divider,
  IconButton
} from '@mui/material';
// components
import Page from '../components/Page';
import Logo from '../components/Logo';
import app from '../config';
import { OtpAPI } from '@/api/otp';
import { useSnackbar } from 'notistack';
import Iconify from '../components/Iconify';
import { ACCOUNT_TYPE } from '@/types/User';
import { authStore } from '../contexts/authStore';
import { AuthAPI } from '@/api/auth';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
  position: 'relative',
}));

const HeaderStyle = styled('header')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  backgroundColor: 'transparent',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2, 4),
  },
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  width: '100%',
  marginTop: theme.spacing(10),
}));

const OtpInput = styled(TextField)(({ theme }) => ({
  width: 56,
  height: 56,
  margin: theme.spacing(0, 0.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '& input': {
      textAlign: 'center',
      fontSize: 24,
      padding: theme.spacing(1),
      color: theme.palette.text.primary,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

// Helper function to create alpha color
function alpha(color, value) {
  return `rgba(${hexToRgb(color)}, ${value})`;
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

// ----------------------------------------------------------------------

export default function OtpVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for URL parameters (from buyer app redirect)
  const urlParams = new URLSearchParams(location.search);
  const phoneFromUrl = urlParams.get('phone');
  const fromBuyer = urlParams.get('fromBuyer') === 'true';
  
  const phone = location.state?.phone || location.state?.user?.phone || phoneFromUrl;
  const user = location.state?.user;
  const theme = useTheme();
  
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const inputRefs = useRef([]);
  const { enqueueSnackbar } = useSnackbar();
  const [resendTimer, setResendTimer] = useState(0);
  
  // Log user data for debugging
  useEffect(() => {
    console.log('OtpVerification - User data received:', user);
    console.log('OtpVerification - Phone number:', phone);
    console.log('OtpVerification - User type:', user?.type);
    console.log('OtpVerification - Location state:', location.state);
    
    // Check if we have the required data
    // For users coming from login, we might not have full user data, just phone/email
    const fromLogin = location.state?.fromLogin;
    const loginValue = location.state?.login;
    
    if (fromLogin && loginValue && !phone) {
      // User came from login with email, but we need phone number
      console.log('OtpVerification - User came from login with email, need phone number');
      enqueueSnackbar('Veuillez vous inscrire avec votre numéro de téléphone.', { variant: 'error' });
      navigate('/register', { replace: true });
    } else if (!phone && !user && !fromBuyer) {
      console.error('OtpVerification - Missing required data, redirecting to register');
      enqueueSnackbar('Données manquantes. Veuillez vous inscrire à nouveau.', { variant: 'error' });
      navigate('/register', { replace: true });
    }
  }, [user, phone, navigate, enqueueSnackbar, location.state]);
  
  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5);
  }, []);
  
  const handleChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // No need to clear snackbar
      if (value !== '' && index < 4) {
        inputRefs.current[index + 1].focus();
      }
    }
  };
  
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };
  
  const handleSubmit = async () => {
    const otpValue = otp.join('');
    try {
      console.log('OtpVerification - Submitting OTP:', otpValue);
      const verificationResult = await OtpAPI.confirm({ code: otpValue, phone });
      
      enqueueSnackbar(t('verificationSuccess'), { variant: 'success' });
      
      // Check if user is coming from login (phone verification after login attempt)
      const fromLogin = location.state?.fromLogin;
      const fromRegistration = location.state?.fromRegistration;
      
      if (fromLogin || fromBuyer) {
        // User came from login, redirect them back to login to complete the login process
        console.log('OtpVerification - User came from login/buyer, redirecting back to login');
        setTimeout(() => {
          if (fromBuyer) {
            enqueueSnackbar('Numéro vérifié avec succès! Redirection vers l\'application acheteur...', { variant: 'success' });
            // Redirect back to buyer app login
            window.location.href = `${window.location.protocol}//${window.location.hostname}:3000/auth/login`;
          } else {
            enqueueSnackbar('Numéro vérifié avec succès! Veuillez vous connecter à nouveau.', { variant: 'success' });
            navigate('/login', { replace: true });
          }
        }, 1500);
      } else if (verificationResult && verificationResult.tokens && verificationResult.user) {
        // New response format: OTP verification successful and tokens provided
        console.log('OtpVerification - Verification successful, storing tokens and navigating');
        
        // Store authentication data
        const authData = {
          user: {
            ...verificationResult.user,
            isVerified: true, // Ensure isVerified is set to true after OTP
            isHasIdentity: true // Set to true since identity verification is no longer required
          },
          tokens: {
            accessToken: verificationResult.tokens.accessToken,
            refreshToken: verificationResult.tokens.refreshToken
          }
        };
        authStore.getState().set(authData);
        console.log('OtpVerification - Stored auth data:', authData);
        
        // Navigate to subscription plans after OTP verification
        setTimeout(() => {
          console.log('OtpVerification - Redirecting to subscription plans');
          console.log('OtpVerification - User data:', verificationResult.user);
          
          // All users go to subscription plans after OTP verification
          navigate('/subscription-plans', { 
            state: { 
              user: verificationResult.user,
              fromRegistration: true 
            }, 
            replace: true 
          });
        }, 500);
      } else {
        // Legacy response format or no tokens - redirect to login
        console.log('OtpVerification - Legacy response or no tokens, redirecting to login');
        setTimeout(() => {
          enqueueSnackbar('Vérification réussie! Veuillez vous connecter.', { variant: 'success' });
          navigate('/login', { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error('OtpVerification - Error during OTP verification:', err);
      if (err.response && err.response.data) {
        console.error('Backend error:', err.response.data);
        enqueueSnackbar(err.response.data.message || t('unknownError'), { variant: 'error' });
      } else {
        console.error(err);
        enqueueSnackbar(err.message || t('unknownError'), { variant: 'error' });
      }
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (resendTimer > 0) return;
    try {
      await OtpAPI.resend({ phone });
      enqueueSnackbar(t('otpResentSuccess'), { variant: 'success' });
      setResendTimer(60);
    } catch (err) {
      if (err.response && err.response.data) {
        enqueueSnackbar(err.response.data.message || t('otpResendError'), { variant: 'error' });
      } else {
        enqueueSnackbar(t('otpResendError'), { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    if (resendTimer === 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  return (
    <Page title="Vérification OTP">
      <HeaderStyle>
        <Logo />
        <Button
          size="small"
          startIcon={<Iconify icon="eva:arrow-back-fill" width={16} height={16} />}
          onClick={() => navigate('/register', { state: { user, phone } })}
          sx={{
            ml: 'auto',
            color: 'text.primary',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            padding: '6px 12px',
            borderRadius: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          Retour
        </Button>
      </HeaderStyle>

      <RootStyle>
        <ContentStyle>
          <Paper
            elevation={8}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              backgroundColor: 'background.paper',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              }
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <IconButton 
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  width: 72,
                  height: 72,
                  mb: 2.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  }
                }}
              >
                <Iconify icon="eva:shield-fill" width={36} height={36} style={{ color: theme.palette.primary.main }} />
              </IconButton>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>
                Vérification OTP
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Veuillez entrer le code à 5 chiffres envoyé à
              </Typography>
              {phone && (
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {phone}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4 }}>
                {otp.map((digit, index) => (
                  <OtpInput
                    key={index}
                    inputRef={(el) => (inputRefs.current[index] = el)}
                    variant="outlined"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    inputProps={{ maxLength: 1 }}
                    autoFocus={index === 0}
                  />
                ))}
              </Stack>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={handleSubmit}
                disabled={otp.includes('')}
                sx={{ 
                  borderRadius: 2,
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: `0 8px 20px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Vérifier
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Vous n'avez pas reçu le code ?
              </Typography>
              <Link
                variant="subtitle2"
                component="button"
                onClick={handleResend}
                sx={{ 
                  border: 'none',
                  background: 'none',
                  cursor: resendTimer > 0 ? 'default' : 'pointer',
                  color: resendTimer > 0 ? 'text.disabled' : 'primary.main',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.95rem',
                  '&:hover': {
                    textDecoration: resendTimer > 0 ? 'none' : 'underline',
                  }
                }}
                disabled={resendTimer > 0}
              >
                <Iconify icon="eva:refresh-fill" width={18} height={18} style={{ marginRight: 6 }} />
                {resendTimer > 0 ? `Renvoyer OTP (${resendTimer}s)` : 'Renvoyer OTP'}
              </Link>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Retour à la{' '}
                <Link 
                  variant="subtitle2" 
                  component={RouterLink} 
                  to="/login"
                  sx={{ 
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  page de connexion
                </Link>
              </Typography>
            </Box>
          </Paper>
        </ContentStyle>
      </RootStyle>
    </Page>
  );
} 