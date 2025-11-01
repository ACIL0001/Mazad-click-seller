import { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { 
  Card, 
  Link, 
  Container, 
  Typography, 
  Stack, 
  TextField, 
  Button, 
  Box, 
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import { AlertColor } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
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

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
  [theme.breakpoints.up('md')]: {
    width: '40vw',
    maxWidth: 'none',
    margin: 0,
    minHeight: '100vh',
  },
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: 'unset',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(2, 0),
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
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
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
            isVerified: true, // Ensure isVerified is set to true
            isHasIdentity: false // Ensure isHasIdentity is set to false for new users
          },
          tokens: {
            accessToken: verificationResult.tokens.accessToken,
            refreshToken: verificationResult.tokens.refreshToken
          }
        };
        authStore.getState().set(authData);
        console.log('OtpVerification - Stored auth data:', authData);
        
        // Navigate based on user type
        setTimeout(() => {
          const userType = verificationResult.user.type;
          console.log('OtpVerification - User type for navigation:', userType);
          console.log('OtpVerification - User data:', verificationResult.user);
          console.log('OtpVerification - Auth store state:', authStore.getState().auth);
          
          // Restore proper flow for professional users
          if (userType === 'PROFESSIONAL' || userType === ACCOUNT_TYPE.PROFESSIONAL) {
            console.log('OtpVerification - Professional user detected, navigating to identity verification');
            console.log('OtpVerification - About to navigate to /identity-verification');
            navigate('/identity-verification', { state: { user: verificationResult.user }, replace: true });
          } else {
            console.log('OtpVerification - Regular user, navigating to dashboard');
            navigate('/dashboard/app', { replace: true });
          }
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
    <Page title={t('otpVerification')}>
      <RootStyle>
        <HeaderStyle>
          <Logo />
          <Button size="small" variant="text" onClick={() => navigate('/register', { state: { user, phone } })} sx={{ ml: 2, fontWeight: 600 }}>
            ← Retour
          </Button>
          {smUp && (
            <Typography variant="body2" sx={{ mt: { md: -2 } }}>
              {t('backTo')} {''}
              <Link variant="subtitle2" component={RouterLink} to="/login">
                {t('login')}
              </Link>
            </Typography>
          )}
        </HeaderStyle>

        {mdUp && (
          <SectionStyle
            style={{
              backgroundImage: `url(/static/logo/mazadclick-cover.png)`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
            }}
          >
          </SectionStyle>
        )}

        <Container sx={mdUp ? { width: '60vw', minHeight: '100vh', margin: 8, padding: 0 } : {}}>
          <ContentStyle>
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
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <IconButton 
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    width: 64,
                    height: 64,
                    mb: 2
                  }}
                >
                  <Iconify icon="eva:shield-fill" width={30} height={30} style={{ color: theme.palette.primary.main }} />
                </IconButton>
                <Typography variant="h5" fontWeight={600}>
                  {t('otpVerification')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  {t('enterOtpCode')}
                </Typography>
                {phone && (
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    +213 {phone}
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
                    borderRadius: 1.5,
                    py: 1.5,
                    boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
                    '&:hover': {
                      boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                    }
                  }}
                >
                  {t('verifyOtp')}
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('didNotReceiveCode')} {''}
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
                    mt: 1
                  }}
                  disabled={resendTimer > 0}
                >
                  <Iconify icon="eva:refresh-fill" width={16} height={16} style={{ marginRight: 4 }} />
                  {resendTimer > 0 ? `${t('resendOtp')} (${resendTimer}s)` : t('resendOtp')}
                </Link>
              </Box>

              {!smUp && (
                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                  {t('backTo')} {''}
                  <Link variant="subtitle2" to="/login" component={RouterLink}>
                    {t('login')}
                  </Link>
                </Typography>
              )}
            </Paper>
          </ContentStyle>
        </Container>
      </RootStyle>
    </Page>
  );
} 