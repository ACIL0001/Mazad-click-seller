import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Grid, Card, CardContent, Button,
  Divider, CircularProgress, Alert, Stepper, Step, StepLabel, Checkbox, FormControlLabel,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup,
  FormControl, FormLabel, InputAdornment, IconButton, Chip, Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Page wrapper component
const Page = ({ children, title }) => {
  useEffect(() => {
    document.title = title || 'Payment Page';
  }, [title]);
  return <Box>{children}</Box>;
};

// Styled components
const PaymentFormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
  },
}));

const PaymentMethodCard = styled(Card)<{ selected?: boolean }>(({ theme, selected }) => ({
  cursor: 'pointer',
  borderRadius: 12,
  border: '2px solid',
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  backgroundColor: selected ? theme.palette.primary.light : 'transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const UploadArea = styled(Box)(({ theme }) => ({
  border: '2px dashed',
  borderColor: theme.palette.divider,
  borderRadius: 12,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '200px',
  borderRadius: 8,
  objectFit: 'cover',
});

// Payment method selection component
export const PaymentMethodSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPlan } = location.state || {};
  
  const [selectedMethod, setSelectedMethod] = useState('');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    phoneNumber: '',
    transactionId: '',
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedPlan) {
      navigate('/subscription-plans', { replace: true });
    }
  }, [selectedPlan, navigate]);

  const paymentMethods = [
    {
      id: 'cib',
      name: 'Carte CIB',
      description: 'Paiement sécurisé avec votre carte bancaire CIB',
      icon: <CreditCardIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#1976d2',
      details: 'Limite: Selon votre banque • Instantané'
    },
    {
      id: 'edahabia',
      name: 'Carte EDAHABIA',
      description: 'Paiement avec votre carte Algérie Poste',
      icon: <AccountBalanceIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      color: '#4caf50',
      details: 'Limite: 200,000 DA/jour • Instantané'
    },
    {
      id: 'baridimob',
      name: 'BaridiMob',
      description: 'Paiement mobile via application BaridiMob',
      icon: <PhoneAndroidIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      color: '#ff9800',
      details: 'Limite: 200,000 DA/jour • QR Code disponible'
    },
    {
      id: 'cheque',
      name: 'Chèque bancaire',
      description: 'Paiement par chèque avec justificatif',
      icon: <ReceiptIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      color: '#9c27b0',
      details: 'Délai: 3-5 jours ouvrables • Photo requise'
    }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl('');
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      navigate('/payment-success', { 
        state: { 
          plan: selectedPlan,
          paymentMethod: selectedMethod,
          requiresVerification: selectedMethod === 'cheque' || uploadedFile
        } 
      });
    }, 2000);
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'cib':
      case 'edahabia':
        return (
          <Box sx={{ mt: 3, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informations de la carte
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nom sur la carte"
                  fullWidth
                  variant="outlined"
                  value={formData.cardName}
                  onChange={handleInputChange('cardName')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Numéro de carte"
                  fullWidth
                  variant="outlined"
                  value={formData.cardNumber}
                  onChange={handleInputChange('cardNumber')}
                  placeholder="16 chiffres"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCardIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Date d'expiration"
                  fullWidth
                  variant="outlined"
                  placeholder="MM/AA"
                  value={formData.expiryDate}
                  onChange={handleInputChange('expiryDate')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Code CVV"
                  fullWidth
                  variant="outlined"
                  placeholder="3 chiffres"
                  value={formData.cvv}
                  onChange={handleInputChange('cvv')}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'baridimob':
        return (
          <Box sx={{ mt: 3, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Paiement BaridiMob
            </Typography>
            <TextField
              label="Numéro de téléphone"
              fullWidth
              variant="outlined"
              placeholder="0X XX XX XX XX"
              value={formData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneAndroidIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Alert severity="info" icon={<InfoIcon />}>
              Après validation, vous recevrez un code QR pour finaliser le paiement via l'app BaridiMob
            </Alert>
          </Box>
        );
      
      case 'cheque':
        return (
          <Box sx={{ mt: 3, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Paiement par chèque
            </Typography>
            <TextField
              label="Numéro de chèque"
              fullWidth
              variant="outlined"
              placeholder="Numéro du chèque"
              value={formData.transactionId}
              onChange={handleInputChange('transactionId')}
              sx={{ mb: 2 }}
            />
            <Alert severity="warning" sx={{ mb: 2 }}>
              Veuillez joindre une photo claire de votre chèque pour validation
            </Alert>
          </Box>
        );
      
      default:
        return null;
    }
  };

  if (!selectedPlan) {
    return <CircularProgress />;
  }

  return (
    <Page title="Méthodes de paiement - Algérie">
      <Container maxWidth="md" sx={{ pt: 4, pb: 5 }}>
        <Stepper activeStep={1} alternativeLabel sx={{ mb: 4 }}>
          {['Choisir un plan', 'Paiement', 'Confirmation'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <PaymentFormContainer elevation={0}>
          <Typography variant="h4" align="center" gutterBottom>
            Finaliser votre abonnement
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Plan sélectionné: <strong>{selectedPlan.name}</strong> - {selectedPlan.price} DA
          </Typography>
          
          <Divider sx={{ mb: 4 }} />

          {/* Payment Methods */}
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Choisissez votre méthode de paiement
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {paymentMethods.map((method) => (
              <Grid item xs={12} sm={6} key={method.id}>
                <PaymentMethodCard
                  selected={selectedMethod === method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  elevation={selectedMethod === method.id ? 4 : 1}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {method.icon}
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" component="div">
                          {method.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {method.details}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {method.description}
                    </Typography>
                  </CardContent>
                </PaymentMethodCard>
              </Grid>
            ))}
          </Grid>

          {/* Payment Form */}
          {selectedMethod && renderPaymentForm()}

          {/* File Upload Section */}
          {(selectedMethod === 'cheque' || selectedMethod) && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Justificatif de paiement {selectedMethod === 'cheque' ? '(Obligatoire)' : '(Optionnel)'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Téléchargez une photo de votre reçu, chèque ou capture d'écran du paiement
              </Typography>
              
              {!uploadedFile ? (
                <UploadArea>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload">
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Cliquez pour télécharger
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ou glissez-déposez votre image ici
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Formats acceptés: JPG, PNG, PDF (Max: 5MB)
                    </Typography>
                  </label>
                </UploadArea>
              ) : (
                <Box sx={{ 
                  border: '1px solid',
                  borderColor: 'success.main',
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: 'success.light'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhotoCameraIcon sx={{ color: 'success.dark', mr: 1 }} />
                      <Typography variant="body1" color="success.dark">
                        {uploadedFile.name}
                      </Typography>
                    </Box>
                    <IconButton onClick={removeFile} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  {previewUrl && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <PreviewImage src={previewUrl} alt="Preview" />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Submit Button */}
          <LoadingButton
            variant="contained"
            size="large"
            fullWidth
            loading={loading}
            onClick={handlePayment}
            disabled={!selectedMethod || (selectedMethod === 'cheque' && !uploadedFile)}
            sx={{ 
              mt: 4, 
              borderRadius: 12, 
              py: 2,
              fontSize: '1.1rem',
              textTransform: 'none'
            }}
          >
            {loading ? 'Traitement en cours...' : `Confirmer le paiement - ${selectedPlan.price} DA`}
          </LoadingButton>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Paiement sécurisé • Vos données sont protégées
          </Typography>
        </PaymentFormContainer>
      </Container>
    </Page>
  );
};

// Enhanced Success Page
export const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, paymentMethod, requiresVerification } = location.state || {};
  const [openPopup, setOpenPopup] = useState(false);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!plan) {
      navigate('/subscription-plans', { replace: true });
      return;
    }

    setOpenPopup(true);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [plan, navigate]);

  const handleClosePopup = () => {
    setOpenPopup(false);
    navigate('/login', { replace: true });
  };

  const handleGoToLogin = () => {
    navigate('/login', { replace: true });
  };

  const getMethodDetails = () => {
    const methods = {
      'cib': { name: 'Carte CIB', icon: '💳', time: 'immédiat' },
      'edahabia': { name: 'Carte EDAHABIA', icon: '🏦', time: 'immédiat' },
      'baridimob': { name: 'BaridiMob', icon: '📱', time: 'immédiat' },
      'cheque': { name: 'Chèque bancaire', icon: '📄', time: '3-5 jours' }
    };
    return methods[paymentMethod] || { name: 'Paiement', icon: '✅', time: '24h' };
  };

  const methodDetails = getMethodDetails();

  return (
    <Page title="Paiement confirmé">
      <Container maxWidth="md" sx={{ pt: 10, pb: 5 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            p: 4,
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            minHeight: '70vh',
            justifyContent: 'center',
            backgroundColor: 'background.paper'
          }}
        >
          <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 120, mb: 3 }} />
          <Typography variant="h3" gutterBottom color="success.main">
            Paiement Confirmé !
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
            Votre abonnement au plan <strong>{plan?.name}</strong> a été enregistré
          </Typography>
        </Box>

        {/* Enhanced Success Popup */}
        <Dialog
          open={openPopup}
          onClose={handleClosePopup}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              textAlign: 'center',
              p: 3
            }
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h2" component="div" sx={{ mb: 1 }}>
                {methodDetails.icon}
              </Typography>
              <CheckCircleOutlineIcon 
                sx={{ 
                  color: 'success.main', 
                  fontSize: 60,
                  display: 'block', 
                  margin: '0 auto 16px' 
                }} 
              />
            </Box>
            <Typography variant="h4" component="div" color="success.main">
              Paiement Confirmé !
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 1 }}>
            <Chip 
              label={`${methodDetails.name}`}
              variant="outlined" 
              sx={{ mb: 3, fontSize: '0.9rem' }}
            />
            
            <Typography variant="h6" gutterBottom>
              Plan "{plan?.name}" activé avec succès
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              mt: 3, 
              mb: 3,
              p: 3,
              backgroundColor: requiresVerification ? 'warning.light' : 'info.light',
              borderRadius: 3
            }}>
              <AccessTimeIcon sx={{ 
                mb: 1, 
                color: requiresVerification ? 'warning.dark' : 'info.dark',
                fontSize: 32 
              }} />
              <Typography variant="h6" color={requiresVerification ? 'warning.dark' : 'info.dark'} fontWeight="bold">
                {requiresVerification ? 'Vérification en cours' : 'Traitement en cours'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {requiresVerification 
                  ? `Votre justificatif sera vérifié sous 24-48h`
                  : `Confirmation dans les ${methodDetails.time}`
                }
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              📧 Un email de confirmation a été envoyé
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              📱 Vous recevrez un SMS de validation
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Redirection automatique dans <strong>{countdown}</strong> secondes
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGoToLogin}
              size="large"
              sx={{ 
                borderRadius: 12, 
                px: 4, 
                py: 1.5,
                minWidth: 180,
                textTransform: 'none'
              }}
            >
              Accéder à mon compte
            </Button>
            <Button
              variant="outlined"
              onClick={handleClosePopup}
              size="large"
              sx={{ 
                borderRadius: 12, 
                px: 3, 
                py: 1.5,
                textTransform: 'none'
              }}
            >
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
};