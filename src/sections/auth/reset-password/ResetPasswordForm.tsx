import * as Yup from 'yup';
import { useState, useRef, useEffect } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import { useNavigate } from 'react-router-dom';

// material
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Box,
  Paper,
  styled,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Button,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// component
import Iconify from '../../../components/Iconify';
// API
import { AuthAPI } from '../../../api/auth';
import { OtpAPI } from '@/api/otp';
import { useSnackbar } from 'notistack';

// Styled components
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

const steps = ['Numéro de téléphone', 'Vérification OTP', 'Nouveau mot de passe'];

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifiedOtp, setVerifiedOtp] = useState('');
  
  // Refs for OTP inputs
  const inputRefs = useRef([]);

  // Step 1: Phone number schema
  const PhoneSchema = Yup.object().shape({
    phone: Yup.string().required('Le numéro de téléphone est requis'),
  });

  // Step 3: Password schema
  const PasswordSchema = Yup.object().shape({
    password: Yup.string()
      .required('Le mot de passe est requis')
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: Yup.string()
      .required('La confirmation du mot de passe est requise')
      .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas')
  });

  // Form for Step 1: Phone number
  const phoneFormik = useFormik({
    initialValues: {
      phone: '',
    },
    validationSchema: PhoneSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        // Request OTP to be sent to phone for password reset
        await OtpAPI.requestPasswordReset({ phone: values.phone });
        setPhone(values.phone);
        setActiveStep(1); // Move to OTP verification step
        setResendTimer(60);
      } catch (error) {
        setErrors({ phone: error.message || 'Une erreur est survenue' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Form for Step 3: New password
  const passwordFormik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: PasswordSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setIsSubmitting(true);
        // Reset password with new password using the new backend endpoint
        await AuthAPI.PasswordReset({
          phone,
          code: verifiedOtp,
          newPassword: values.password,
        });
        // Navigate to login page
        enqueueSnackbar('Mot de passe réinitialisé avec succès', { variant: 'success' });
        navigate('/login', { replace: true });
      } catch (error) {
        setErrors({ password: error.response?.data?.message || error.message || 'Une erreur est survenue' });
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
  });

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value !== '' && index < 4) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle OTP keydown
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    try {
      setIsSubmitting(true);
      const otpValue = otp.join('');
      // Verify OTP for password reset
      await OtpAPI.confirmPasswordReset({ 
        code: otpValue,
        phone 
      });
      setVerifiedOtp(otpValue); // Store verified OTP
      setIsVerified(true);
      setActiveStep(2); // Move to password reset step
    } catch (error) {
      console.error('OTP verification error:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    try {
      setIsSubmitting(true);
      await OtpAPI.requestPasswordReset({ phone });
      setResendTimer(60);
      setOtp(['', '', '', '', '']); // Clear OTP input fields
    } catch (error) {
      console.error('OTP resend error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start/update timer for OTP resend
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

  // Initialize OTP input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5);
  }, []);

  return (
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
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <FormikProvider value={phoneFormik}>
          <Form autoComplete="off" noValidate onSubmit={phoneFormik.handleSubmit}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <IconButton 
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  width: 64,
                  height: 64,
                  mb: 2
                }}
              >
                <Iconify icon="eva:phone-fill" width={30} height={30} style={{ color: theme.palette.primary.main }} />
              </IconButton>
              <Typography variant="h5" fontWeight={600}>
                Réinitialisation par téléphone
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Entrez votre numéro de téléphone pour recevoir un code de vérification
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <StyledTextField
              fullWidth
              label="Téléphone"
              {...phoneFormik.getFieldProps('phone')}
              placeholder="05 99 99 99 99"
              error={Boolean(phoneFormik.touched.phone && phoneFormik.errors.phone)}
              helperText={phoneFormik.touched.phone && phoneFormik.errors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Iconify icon="eva:phone-fill" width={20} height={20} sx={{ mr: 1 }} />
                      +213
                    </Box>
                  </InputAdornment>
                ),
              }}
            />

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={phoneFormik.isSubmitting}
              sx={{ 
                borderRadius: 1.5,
                py: 1.5,
                mt: 2,
                boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
                '&:hover': {
                  boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              Envoyer le code
            </LoadingButton>
          </Form>
        </FormikProvider>
      )}

      {activeStep === 1 && (
        <Box>
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
              Vérification du code
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Veuillez entrer le code à 5 chiffres envoyé au
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              +213 {phone}
            </Typography>
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
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  inputProps={{ maxLength: 1 }}
                  autoFocus={index === 0}
                />
              ))}
            </Stack>
            
            <LoadingButton
              fullWidth
              size="large"
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={otp.includes('') || isSubmitting}
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
              Vérifier
            </LoadingButton>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Vous n'avez pas reçu le code? {''}
            </Typography>
            <Button
              variant="text"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || isSubmitting}
              sx={{ 
                mt: 1,
                display: 'inline-flex',
                alignItems: 'center',
                color: resendTimer > 0 ? 'text.disabled' : 'primary.main',
              }}
            >
              <Iconify icon="eva:refresh-fill" width={16} height={16} style={{ marginRight: 4 }} />
              {resendTimer > 0 ? `Renvoyer (${resendTimer}s)` : 'Renvoyer le code'}
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === 2 && (
        <FormikProvider value={passwordFormik}>
          <Form autoComplete="off" noValidate onSubmit={passwordFormik.handleSubmit}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <IconButton 
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  width: 64,
                  height: 64,
                  mb: 2
                }}
              >
                <Iconify icon="eva:lock-fill" width={30} height={30} style={{ color: theme.palette.primary.main }} />
              </IconButton>
              <Typography variant="h5" fontWeight={600}>
                Créer un nouveau mot de passe
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Votre identité a été vérifiée. Définissez votre nouveau mot de passe
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <StyledTextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Nouveau mot de passe"
              {...passwordFormik.getFieldProps('password')}
              error={Boolean(passwordFormik.touched.password && passwordFormik.errors.password)}
              helperText={passwordFormik.touched.password && passwordFormik.errors.password}
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

            <StyledTextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Confirmer le mot de passe"
              {...passwordFormik.getFieldProps('confirmPassword')}
              error={Boolean(passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword)}
              helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:lock-fill" width={20} height={20} />
                  </InputAdornment>
                ),
              }}
            />

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={passwordFormik.isSubmitting}
              sx={{ 
                borderRadius: 1.5,
                py: 1.5,
                mt: 2,
                boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
                '&:hover': {
                  boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              Réinitialiser le mot de passe
            </LoadingButton>
          </Form>
        </FormikProvider>
      )}
    </Paper>
  );
} 