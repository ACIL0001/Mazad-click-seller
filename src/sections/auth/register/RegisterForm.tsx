import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../../../api/auth';
import { TermsAPI } from '../../../api/terms';
import { CategoryAPI } from '../../../api/category';
import { authStore } from '../../../contexts/authStore';
import { styled, useTheme } from '@mui/material/styles';
// material
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  FormControlLabel,
  Checkbox,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// component
import Iconify from '../../../components/Iconify';
import { ACCOUNT_TYPE } from '../../../types/User';

// Define USER_TYPE enum
export enum USER_TYPE {
  CLIENT = 'CLIENT',
  PROFESSIONAL = 'PROFESSIONAL',
}

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

// Styled components
const AccountTypeToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  width: '100%',
  '& .MuiToggleButton-root': {
    flex: 1,
    minHeight: 80,
    fontSize: '1.1rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 12,
    border: `2px solid ${theme.palette.grey[300]}`,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      borderColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        borderColor: theme.palette.primary.dark,
      },
    },
    '&:first-of-type': {
      marginRight: theme.spacing(1),
    },
    '&:last-of-type': {
      marginLeft: theme.spacing(1),
    },
  },
}));

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

// Terms Agreement Box - Modern card style matching buyer app
const TermsAgreementBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.background.paper,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
    borderRadius: '12px 12px 0 0',
  },
  '& .terms-card-header': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
  '& .terms-card-icon': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
  },
  '& .terms-card-title': {
    fontSize: '1rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    margin: 0,
  },
  '& .terms-card-subtitle': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    margin: 0,
  },
  '& .terms-row': {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    cursor: 'pointer',
    margin: 0,
    padding: theme.spacing(1),
    borderRadius: 8,
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .terms-checkbox': {
    margin: 0,
    marginTop: 2,
    '&.MuiCheckbox-root': {
      padding: 0,
      '&.Mui-checked': {
        color: theme.palette.primary.main,
      },
    },
  },
  '& .terms-text': {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: theme.palette.text.primary,
    flex: 1,
  },
  '& .terms-link': {
    background: 'none',
    border: 'none',
    color: theme.palette.primary.main,
    textDecoration: 'none',
    cursor: 'pointer',
    fontSize: 'inherit',
    fontWeight: 600,
    padding: 0,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& .terms-warning': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.warning.light,
    borderRadius: 8,
    border: `1px solid ${theme.palette.warning.main}`,
    '& .warning-icon': {
      color: theme.palette.warning.main,
      fontSize: '1rem',
    },
    '& span': {
      fontSize: '0.875rem',
      color: theme.palette.warning.dark,
      fontWeight: 500,
    },
  },
}));

// Terms Modal Component
function TermsModal({ open, onClose, termsContent, isLoading }: { 
  open: boolean; 
  onClose: () => void; 
  termsContent: string;
  isLoading: boolean;
}) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid',
        borderColor: 'divider',
        fontWeight: 600,
        fontSize: '1.25rem'
      }}>
        Termes et Conditions d'Utilisation
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ 
          height: '450px', 
          overflow: 'auto', 
          padding: 3,
          '& h1, & h2, & h3': {
            color: 'primary.main',
            marginTop: 2,
            marginBottom: 1,
          },
          '& p': {
            marginBottom: 1.5,
            lineHeight: 1.6,
          },
          '& ul, & ol': {
            paddingLeft: 2,
            marginBottom: 1.5,
          },
          '& div': {
            '& ul': {
              textAlign: 'left',
              paddingLeft: '1.5rem',
              '& li': {
                marginBottom: '0.5rem',
              }
            }
          }
        }}>
          {isLoading ? (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress size={40} />
              <Typography sx={{ mt: 2 }}>Chargement des termes...</Typography>
              <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                Connexion à la base de données...
              </Typography>
            </Box>
          ) : termsContent ? (
            <div dangerouslySetInnerHTML={{ __html: termsContent }} />
          ) : (
            <Box textAlign="center" py={4}>
              <Iconify icon="eva:alert-circle-fill" width={48} height={48} sx={{ color: 'warning.main', mb: 2 }} />
              <Typography color="text.secondary">
                Impossible de charger les termes et conditions. Veuillez réessayer.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="contained">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

interface RegisterFormProps {
  // Remove the termsAccepted prop as we'll manage it internally
}

export default function RegisterForm(props: RegisterFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [isLoadingTerms, setIsLoadingTerms] = useState(false);
  const [hasTerms, setHasTerms] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const theme = useTheme();

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string()
      .required('Le prénom ne doit pas être vide')
      .min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: Yup.string()
      .required('Le nom ne doit pas être vide')
      .min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: Yup.string()
      .email('Format d\'email invalide')
      .required('L\'email est requis'),
    password: Yup.string()
      .required('Le mot de passe est requis')
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    phone: Yup.string()
      .required('Le numéro de téléphone est requis')
      .matches(/^0[5-7][0-9]{2} [0-9]{2} [0-9]{2} [0-9]{2}$/, 'Le numéro doit être au format 0XXX XX XX XX')
      .test('phone-format', 'Format de téléphone invalide', (value) => {
        if (!value) return false;
        // Remove spaces and check if it's 10 digits starting with 0
        const cleanPhone = value.replace(/\s/g, '');
        return cleanPhone.length === 10 && cleanPhone.startsWith('0');
      }),
    type: Yup.string()
      .required('Le type de vendeur est requis')
      .oneOf(Object.values(USER_TYPE), 'Le type d\'utilisateur doit être l\'une des valeurs suivantes'),
    secteur: Yup.string()
      .when('type', {
        is: USER_TYPE.PROFESSIONAL,
        then: (schema) => schema.required('Le secteur est requis pour les professionnels'),
        otherwise: (schema) => schema.notRequired(),
      }),
    entreprise: Yup.string()
      .when('type', {
        is: USER_TYPE.PROFESSIONAL,
        then: (schema) => schema
          .required('Le nom de l\'entreprise est requis pour les professionnels')
          .min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères'),
        otherwise: (schema) => schema.notRequired(),
      }),
    postOccupé: Yup.string()
      .when('type', {
        is: USER_TYPE.PROFESSIONAL,
        then: (schema) => schema.notRequired(),
        otherwise: (schema) => schema.notRequired(),
      }),
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      type: USER_TYPE.PROFESSIONAL, // Default to PROFESSIONAL as requested
      secteur: '',
      entreprise: '',
      postOccupé: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      if (hasTerms && !termsAccepted) {
        alert('Vous devez accepter les termes et conditions pour continuer');
        setSubmitting(false);
        return;
      }

      try {
        // Transform values to match the User interface
        const userData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          phone: values.phone.replace(/\s/g, ''), // Remove spaces for storage
          type: 'PROFESSIONAL', // Always send PROFESSIONAL type to backend as requested
          secteur: values.secteur,
          entreprise: values.entreprise,
          postOccupé: values.postOccupé,
        };
        console.log('userData', userData);

        const signupRes = await AuthAPI.signup(userData as any);
        console.log('signupRes', signupRes);
        
        const userObj = signupRes.user || signupRes.data?.user;
        
        // Check if phone verification is required (new response format)
        if (signupRes.requiresPhoneVerification || signupRes.data?.requiresPhoneVerification) {
          console.log('Phone verification required, not storing tokens yet');
          
          // Navigate to OTP verification without storing tokens
          navigate('/otp-verification', { 
            replace: true, 
            state: { 
              user: userObj,
              phone: userData.phone,
              fromRegistration: true // Flag to indicate coming from registration
            } 
          });
        } else {
          // Legacy response format - handle tokens if present but still require OTP
          let tokens = signupRes.tokens || signupRes.session || signupRes.data?.tokens || signupRes.data?.session;
          if (tokens && tokens.access_token) {
            tokens = {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
            };
          }
          
          console.log('Legacy response format detected, storing tokens but requiring OTP verification');
          if (tokens && userObj) {
            authStore.getState().set({ tokens, user: userObj });
            console.log('Stored tokens:', tokens);
            console.log('Stored user:', userObj);
          }
          
          // Navigate to OTP verification
          navigate('/otp-verification', { 
            replace: true, 
            state: { 
              user: userObj,
              phone: userData.phone,
              fromRegistration: true
            } 
          });
        }
      } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error cases
        let errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
        
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Set form errors based on the error type
        if (errorMessage.includes('email') || errorMessage.includes('Email')) {
          setErrors({ email: errorMessage });
        } else if (errorMessage.includes('phone') || errorMessage.includes('Phone')) {
          setErrors({ phone: errorMessage });
        } else {
          // Show general error
          console.error('Registration failed:', errorMessage);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, values } = formik;

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setFieldValue('type', newType);
    }
  };

  // Phone number formatter
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    let phoneNumber = value.replace(/\D/g, '');
    
    // Remove leading zero if more than 10 digits (to handle pasted numbers)
    if (phoneNumber.length > 10 && phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.substring(1);
    }
    
    // Limit to 10 digits (0 + 9 digits)
    if (phoneNumber.length > 10) {
      phoneNumber = phoneNumber.slice(0, 10);
    }
    
    // Format as 0XXX XX XX XX
    if (phoneNumber.length > 0) {
      phoneNumber = phoneNumber.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
    }
    
    return phoneNumber;
  };

  const handlePhoneChange = (event) => {
    const formattedValue = formatPhoneNumber(event.target.value);
    setFieldValue('phone', formattedValue);
  };

  // Fetch categories for secteur dropdown
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const result = await CategoryAPI.getCategories();
      if (result && result.data) {
        setCategories(result.data);
      } else if (Array.isArray(result)) {
        setCategories(result);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleOpenTerms = async () => {
    setTermsModalOpen(true);
    
    // Only fetch terms if we haven't already loaded them
    if (!termsContent) {
      setIsLoadingTerms(true);
      try {
        // Use the public endpoint to get the latest terms
        const latestTerms = await TermsAPI.getLatest();
        
        if (latestTerms && latestTerms.content) {
          setTermsContent(latestTerms.content);
          setHasTerms(true);
        } else {
          // Fallback to get all public terms if getLatest fails
          const publicTermsList = await TermsAPI.getPublic();
          if (publicTermsList && publicTermsList.length > 0) {
            // Sort by creation date and get the most recent active terms
            const mostRecentTerms = publicTermsList
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            
            if (mostRecentTerms) {
              setTermsContent(mostRecentTerms.content);
              setHasTerms(true);
            } else {
              setTermsContent('');
              setHasTerms(false);
            }
          } else {
            setTermsContent('');
            setHasTerms(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch terms:', error);
        setTermsContent('');
        setHasTerms(false);
      } finally {
        setIsLoadingTerms(false);
      }
    }
  };

  // Check once on mount if terms exist; if yes, require acceptance, otherwise hide the section
  // and allow registration without displaying terms
  // We purposefully keep it silent and fast
  useEffect(() => {
    const checkTermsAvailability = async () => {
      if (!hasTerms && !termsContent) {
        // Don't make API calls if we're offline
        if (!navigator.onLine) {
          return;
        }
        
        try {
          const latest = await TermsAPI.getLatest();
          if (latest && latest.content) {
            setHasTerms(true);
          } else {
            // Fallback to get all public terms if getLatest fails
            const list = await TermsAPI.getPublic();
            const hasTermsAvailable = !!(list && list.length > 0);
            setHasTerms(hasTermsAvailable);
          }
        } catch (error) {
          // Silently handle network errors without console spam
          if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
            // Retry after 10 seconds if we haven't exceeded max retries
            if (retryCount < 2) {
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
              }, 10000);
            }
          } else {
            setHasTerms(false);
          }
        }
      }
    };

    checkTermsAvailability();
  }, [hasTerms, termsContent, retryCount]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Terms section will show when hasTerms is true

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
          {/* Account Type Switch at the top */}
          <Box 
            sx={{ 
              mb: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
              Type de compte
            </Typography>
            
            <AccountTypeToggleButtonGroup
              value={values.type}
              exclusive
              onChange={handleTypeChange}
              aria-label="account type"
            >
              <ToggleButton 
                value={USER_TYPE.CLIENT} 
                aria-label="acheteur vendeur"
                disabled={true}
                sx={{
                  opacity: 0.7,
                  cursor: 'not-allowed',
                  position: 'relative',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                  border: '2px solid #d0d0d0',
                  color: 'text.disabled',
                  '&:hover': {
                    backgroundColor: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                    color: 'text.disabled',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'linear-gradient(135deg, #e8e8e8 0%, #d8d8d8 100%)',
                    color: 'text.disabled',
                    borderColor: '#c0c0c0',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 1.5,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Box sx={{ 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)',
                    border: '2px solid #d0d0d0',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <Iconify icon="eva:people-fill" width={28} height={28} sx={{ color: '#999' }} />
                    <Box sx={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(255, 152, 0, 0.3)',
                      border: '2px solid white'
                    }}>
                      <Iconify 
                        icon="eva:clock-fill" 
                        width={12} 
                        height={12} 
                        sx={{ color: 'white' }}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ 
                        color: '#666',
                        mb: 0.5,
                        fontSize: '1rem'
                      }}
                    >
                      Acheteur & Vendeur
                    </Typography>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                      border: '1px solid #ffb74d',
                      boxShadow: '0 1px 3px rgba(255, 152, 0, 0.2)'
                    }}>
                      <Iconify 
                        icon="eva:clock-outline" 
                        width={12} 
                        height={12} 
                        sx={{ color: '#f57c00' }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#e65100',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Bientôt disponible
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ToggleButton>
              <ToggleButton 
                value={USER_TYPE.PROFESSIONAL} 
                aria-label="professionnel"
                sx={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  color: 'white',
                  border: '2px solid #1976d2',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 1.5
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                  }}>
                    <Iconify icon="eva:briefcase-fill" width={28} height={28} sx={{ color: 'white' }} />
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={700}
                      sx={{ 
                        color: 'white',
                        fontSize: '1rem',
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }}
                    >
                      Professionnel
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.7rem',
                        fontWeight: 500
                      }}
                    >
                      Disponible maintenant
                    </Typography>
                  </Box>
                </Box>
              </ToggleButton>
            </AccountTypeToggleButtonGroup>
            
            {/* Information about disabled CLIENT option */}
            <Box sx={{
              mt: 1,
              mb: 1,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 1.5,
              background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
              borderRadius: 1,
              border: '1px solid #ffb74d',
              boxShadow: '0 2px 6px rgba(255, 152, 0, 0.1)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(90deg, #ff9800 0%, #f57c00 100%)',
                borderRadius: '4px 4px 0 0'
              }
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%'
              }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  boxShadow: '0 1px 4px rgba(255, 152, 0, 0.3)',
                  flexShrink: 0
                }}>
                  <Iconify 
                    icon="eva:clock-fill" 
                    width={12} 
                    height={12} 
                    sx={{ color: 'white' }}
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#bf360c', 
                    lineHeight: 1.4,
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}
                >
                  Le compte <strong>"Acheteur & Vendeur"</strong> sera bientôt disponible. 
                  Créez un compte <strong>Professionnel</strong> en attendant.
                </Typography>
              </Box>
            </Box>

            {values.type === USER_TYPE.PROFESSIONAL && (
              <Box sx={{
                mt: 1,
                mb: 2,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Iconify icon="eva:info-fill" width={20} height={20} style={{ marginRight: 2, color: theme.palette.info.main }} />
                <Typography variant="body2" sx={{ color: 'info.main', textAlign: 'center' }}>
                  Le compte Professionnel est réservé uniquement aux entreprises.
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  placeholder="Entrez votre prénom"
                  {...getFieldProps('firstName')}
                  error={Boolean(touched.firstName && errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:person-fill" width={20} height={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  placeholder="Entrez votre nom"
                  {...getFieldProps('lastName')}
                  error={Boolean(touched.lastName && errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:person-fill" width={20} height={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>

            {/* Professional-specific fields */}
            {values.type === USER_TYPE.PROFESSIONAL && (
              <>
                <FormControl 
                  fullWidth 
                  error={Boolean(touched.secteur && errors.secteur)}
                  sx={{ mb: 2 }}
                >
                  <InputLabel id="secteur-label">Secteur d'activité</InputLabel>
                  <Select
                    labelId="secteur-label"
                    id="secteur"
                    value={values.secteur}
                    label="Secteur d'activité"
                    onChange={(event) => setFieldValue('secteur', event.target.value)}
                    disabled={loadingCategories}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <Box sx={{ color: 'text.secondary' }}>Choisir votre secteur d'activité</Box>;
                      }
                      return selected;
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <Iconify icon="eva:briefcase-fill" width={20} height={20} />
                      </InputAdornment>
                    }
                  >
                    {loadingCategories ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Chargement des secteurs...
                      </MenuItem>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <MenuItem key={category._id} value={category.name}>
                          {category.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        Aucun secteur disponible
                      </MenuItem>
                    )}
                  </Select>
                  {touched.secteur && errors.secteur && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.secteur}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  fullWidth
                  label="Nom de l'entreprise"
                  placeholder="Entrez le nom de votre entreprise"
                  {...getFieldProps('entreprise')}
                  error={Boolean(touched.entreprise && errors.entreprise)}
                  helperText={touched.entreprise && errors.entreprise}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:home-fill" width={20} height={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Post occupé"
                  placeholder="Entrez votre poste (optionnel)"
                  {...getFieldProps('postOccupé')}
                  error={Boolean(touched.postOccupé && errors.postOccupé)}
                  helperText={touched.postOccupé && errors.postOccupé || "Optionnel"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:briefcase-fill" width={20} height={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            <TextField
              fullWidth
              autoComplete="username"
              type="email"
              label="Email"
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
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Téléphone"
              value={values.phone}
              onChange={handlePhoneChange}
              placeholder="0XXX XX XX XX"
              error={Boolean(touched.phone && errors.phone)}
              helperText={touched.phone && errors.phone || "Format: 0XXX XX XX XX (ex: 0551 23 45 67)"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:phone-fill" width={20} height={20} sx={{ mr: 1 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              autoComplete="new-password"
              type={showPassword ? 'text' : 'password'}
              label="Mot de passe"
              placeholder="Minimum 6 caractères"
              {...getFieldProps('password')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:lock-fill" width={20} height={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                      <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password && errors.password}
            />

            {/* Terms Agreement Section - Modern card style matching buyer app */}
            {hasTerms && (
              <TermsAgreementBox>
                <div className="terms-card-header">
                  <div className="terms-card-icon">
                    <Iconify icon="eva:file-text-fill" width={20} height={20} />
                  </div>
                  <div>
                    <div className="terms-card-title">Termes et confidentialité</div>
                    <div className="terms-card-subtitle">Veuillez lire et accepter pour continuer</div>
                  </div>
                </div>

                <label className="terms-row" onClick={() => setTermsAccepted(!termsAccepted)}>
                  <Checkbox 
                    checked={termsAccepted} 
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="terms-checkbox"
                    sx={{
                      '&.Mui-checked': {
                        color: 'primary.main',
                      }
                    }}
                  />
                  <div className="terms-text">
                    J'ai lu et j'accepte les{' '}
                    <button 
                      type="button" 
                      className="terms-link" 
                      onClick={handleOpenTerms}
                    >
                      termes et conditions d'utilisation
                    </button>{' '}
                    ainsi que la{' '}
                    <button 
                      type="button" 
                      className="terms-link" 
                      onClick={handleOpenTerms}
                    >
                      politique de confidentialité
                    </button>
                    .
                  </div>
                </label>

                {!termsAccepted && (
                  <div className="terms-warning" role="alert">
                    <Iconify icon="eva:alert-circle-fill" className="warning-icon" />
                    <span>Vous devez accepter les termes et conditions pour continuer</span>
                  </div>
                )}
              </TermsAgreementBox>
            )}

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={hasTerms ? !termsAccepted : false}
              loading={isSubmitting}
              sx={{ 
                borderRadius: 1.5,
                py: 1.5,
                mt: 2,
                boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
                '&:hover': {
                  boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                '&.Mui-disabled': {
                  backgroundColor: 'grey.300',
                  color: 'grey.500',
                  opacity: 0.6,
                  cursor: 'not-allowed',
                }
              }}
            >
              {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
            </LoadingButton>
          </Stack>
        </Form>
      </Paper>

      {/* Terms Modal */}
      <TermsModal 
        open={termsModalOpen} 
        onClose={() => setTermsModalOpen(false)} 
        termsContent={termsContent}
        isLoading={isLoadingTerms}
      />
    </FormikProvider>
  );
}