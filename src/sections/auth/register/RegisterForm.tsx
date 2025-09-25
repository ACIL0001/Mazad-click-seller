import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../../../api/auth';
import { TermsAPI } from '../../../api/terms';
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
    minHeight: 56,
    fontSize: '1.1rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 8,
    border: `2px solid ${theme.palette.grey[300]}`,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      borderColor: theme.palette.primary.main,
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

// Terms Agreement Box
const TermsAgreementBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 8,
  border: `1px solid ${theme.palette.grey[300]}`,
  backgroundColor: theme.palette.grey[50],
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '& .MuiFormControlLabel-root': {
    margin: 0,
    alignItems: 'flex-start',
    '& .MuiCheckbox-root': {
      marginTop: -4,
      marginRight: theme.spacing(1),
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

// Helper function to convert Algerian phone to international format
function convertToInternationalPhone(phone: string): string {
  // Remove all spaces and non-digit characters
  const cleanPhone = phone.replace(/\s/g, '').replace(/[^0-9]/g, '');
  
  // If phone starts with 0, replace with +213
  if (cleanPhone.startsWith('0')) {
    return '+213' + cleanPhone.substring(1);
  }
  
  // If phone already starts with 213, add +
  if (cleanPhone.startsWith('213')) {
    return '+' + cleanPhone;
  }
  
  // If phone already has +213, return as is
  if (cleanPhone.startsWith('+213')) {
    return cleanPhone;
  }
  
  // Default: assume it's local format without 0, add +213
  return '+213' + cleanPhone;
}

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
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      type: USER_TYPE.CLIENT,
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      if (!termsAccepted) {
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
          phone: convertToInternationalPhone(values.phone), // Convert to +213 format
          type: values.type === USER_TYPE.CLIENT ? 'CLIENT' : 'PROFESSIONAL',
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
        } else {
          // Fallback to get all public terms if getLatest fails
          const publicTermsList = await TermsAPI.getPublic();
          if (publicTermsList && publicTermsList.length > 0) {
            // Sort by creation date and get the most recent active terms
            const mostRecentTerms = publicTermsList
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            
            if (mostRecentTerms) {
              setTermsContent(mostRecentTerms.content);
            } else {
              setTermsContent('<p>Aucun terme et condition disponible actuellement.</p>');
            }
          } else {
            setTermsContent('<p>Aucun terme et condition disponible actuellement.</p>');
          }
        }
      } catch (error) {
        console.error('Failed to fetch terms:', error);
        setTermsContent('<p>Erreur lors du chargement des termes et conditions. Veuillez réessayer plus tard.</p>');
      } finally {
        setIsLoadingTerms(false);
      }
    }
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
              <ToggleButton value={USER_TYPE.CLIENT} aria-label="acheteur vendeur">
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Iconify icon="eva:people-fill" width={24} height={24} />
                  <Typography variant="subtitle1" fontWeight="inherit">
                    Acheteur & Vendeur
                  </Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value={USER_TYPE.PROFESSIONAL} aria-label="professionnel">
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Iconify icon="eva:briefcase-fill" width={24} height={24} />
                  <Typography variant="subtitle1" fontWeight="inherit">
                    Professionnel
                  </Typography>
                </Box>
              </ToggleButton>
            </AccountTypeToggleButtonGroup>
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

            {/* Professional Terms Agreement Section */}
            <TermsAgreementBox>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={termsAccepted} 
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    sx={{
                      '&.Mui-checked': {
                        color: 'primary.main',
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
                    J'ai lu et j'accepte les{' '}
                    <Link 
                      component="button" 
                      variant="body2" 
                      onClick={handleOpenTerms}
                      sx={{ 
                        fontWeight: 600,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      termes et conditions d'utilisation
                    </Link>
                    {' '}ainsi que la{' '}
                    <Link 
                      component="button" 
                      variant="body2" 
                      onClick={handleOpenTerms}
                      sx={{ 
                        fontWeight: 600,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      politique de confidentialité
                    </Link>
                    .
                  </Typography>
                }
              />
              
              {!termsAccepted && (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mt: 1.5, 
                    fontSize: '0.875rem',
                    '& .MuiAlert-icon': {
                      fontSize: '1rem'
                    }
                  }}
                >
                  Vous devez accepter les termes et conditions pour continuer
                </Alert>
              )}
            </TermsAgreementBox>

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={!termsAccepted}
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