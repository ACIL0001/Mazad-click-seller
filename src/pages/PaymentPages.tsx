import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Grid, Card, CardContent, Button,
  Divider, CircularProgress, Alert, Stepper, Step, StepLabel, Checkbox, FormControlLabel,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup,
  FormControl, FormLabel, InputAdornment, IconButton, Chip, Avatar
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface PageProps {
  children: React.ReactNode;
  title: string;
}

// Page wrapper component
const Page = ({ children, title }: PageProps) => {
  useEffect(() => {
    document.title = title || 'Payment Page';
  }, [title]);
  return <Box>{children}</Box>;
};

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulse = keyframes`
  0% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
  100% { opacity: 0.4; transform: scale(1); }
`;

const slideIn = keyframes`
  0% { transform: translateX(-100px) rotate(-10deg); opacity: 0; }
  100% { transform: translateX(0) rotate(0deg); opacity: 0.6; }
`;

const rotate360 = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
  60% { transform: translateY(-7px); }
`;

const wave = keyframes`
  0% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(10px) translateY(-10px); }
  50% { transform: translateX(0) translateY(-5px); }
  75% { transform: translateX(-10px) translateY(-10px); }
  100% { transform: translateX(0) translateY(0); }
`;

// Background animated components
const BackgroundIcon = styled(Box)<{ delay?: number; animation?: 'float' | 'pulse' | 'slideIn' | 'rotate' | 'bounce' | 'wave' }>(({ theme, delay = 0, animation = 'float' }) => {
  const animations = {
    float: `${float} 4s ease-in-out infinite`,
    pulse: `${pulse} 3s ease-in-out infinite`,
    slideIn: `${slideIn} 2s ease-out infinite`,
    rotate: `${rotate360} 8s linear infinite`,
    bounce: `${bounce} 2s infinite`,
    wave: `${wave} 6s ease-in-out infinite`
  };

  return {
    position: 'absolute',
    opacity: 0.1,
    animation: animations[animation!],
    animationDelay: `${delay}s`,
    color: theme.palette.primary.main,
    fontSize: '3rem',
    zIndex: 0,
    pointerEvents: 'none',
    transition: 'all 0.3s ease',
  };
});

const PaymentShape = styled(Box)<{ shape?: 'circle' | 'square' | 'diamond' | 'hexagon'; delay?: number }>(({ theme, shape = 'circle', delay = 0 }) => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    opacity: 0.05,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    animation: `${float} 6s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    zIndex: 0,
    pointerEvents: 'none',
  };

  const shapeStyles: React.CSSProperties = {};

  switch (shape) {
    case 'square':
      shapeStyles.borderRadius = '12px';
      shapeStyles.transform = 'rotate(45deg)';
      break;
    case 'diamond':
      shapeStyles.borderRadius = '20%';
      shapeStyles.transform = 'rotate(45deg)';
      break;
    case 'hexagon':
      shapeStyles.clipPath = 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)';
      break;
    case 'circle':
    default:
      shapeStyles.borderRadius = '50%';
      break;
  }

  return {
    ...baseStyle,
    ...shapeStyles,
  };
});

const AnimatedBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  zIndex: 0,
});

// Styled components with enhanced background
const PaymentFormContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
  },
}));

const PaymentMethodCard = styled(Card)<{ selected?: boolean }>(({ theme, selected }) => ({
  position: 'relative',
  cursor: 'pointer',
  borderRadius: 12,
  border: '2px solid',
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  backgroundColor: selected ? 'rgba(25, 118, 210, 0.08)' : 'rgba(255, 255, 255, 0.9)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
  '&::before': selected ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
    animation: `${pulse} 3s ease-in-out infinite`,
  } : {},
}));

const UploadArea = styled(Box)(({ theme }) => ({
  position: 'relative',
  border: '2px dashed',
  borderColor: theme.palette.divider,
  borderRadius: 12,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  overflow: 'hidden',
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

// Background Icons Component
const PaymentBackgroundIcons = () => {
  const icons = [
    { Icon: CreditCardIcon, top: '10%', left: '5%', delay: 0, animation: 'float' as const },
    { Icon: PaymentIcon, top: '20%', right: '8%', delay: 1, animation: 'bounce' as const },
    { Icon: AttachMoneyIcon, top: '35%', left: '3%', delay: 2, animation: 'wave' as const },
    { Icon: SecurityIcon, top: '50%', right: '5%', delay: 1.5, animation: 'pulse' as const },
    { Icon: AccountBalanceIcon, top: '70%', left: '7%', delay: 2.5, animation: 'float' as const },
    { Icon: PhoneAndroidIcon, top: '80%', right: '10%', delay: 0.5, animation: 'bounce' as const },
    { Icon: ReceiptIcon, top: '15%', left: '50%', delay: 3, animation: 'wave' as const },
    { Icon: TrendingUpIcon, top: '60%', right: '40%', delay: 1, animation: 'rotate' as const },
    { Icon: CheckCircleOutlineIcon, top: '40%', left: '80%', delay: 2, animation: 'pulse' as const },
  ];

  const shapes = [
    { shape: 'circle' as const, size: 60, top: '5%', right: '20%', delay: 0 },
    { shape: 'square' as const, size: 80, top: '25%', left: '15%', delay: 1 },
    { shape: 'diamond' as const, size: 50, top: '45%', right: '25%', delay: 2 },
    { shape: 'hexagon' as const, size: 70, top: '65%', left: '20%', delay: 1.5 },
    { shape: 'circle' as const, size: 90, top: '85%', right: '15%', delay: 2.5 },
    { shape: 'square' as const, size: 40, top: '30%', right: '50%', delay: 3 },
  ];

  return (
    <AnimatedBackground>
      {/* Animated Icons */}
      {icons.map(({ Icon, top, left, right, delay, animation }, index) => (
        <BackgroundIcon
          key={index}
          delay={delay}
          animation={animation}
          sx={{
            top,
            left,
            right,
          }}
        >
          <Icon fontSize="inherit" />
        </BackgroundIcon>
      ))}
      
      {/* Animated Shapes */}
      {shapes.map(({ shape, size, top, left, right, delay }, index) => (
        <PaymentShape
          key={`shape-${index}`}
          shape={shape}
          delay={delay}
          sx={{
            width: size,
            height: size,
            top,
            left,
            right,
          }}
        />
      ))}
    </AnimatedBackground>
  );
};

// Payment method selection component with enhanced background
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
          <Box sx={{ mt: 3, p: 3, backgroundColor: 'rgba(250, 250, 250, 0.8)', borderRadius: 2, position: 'relative' }}>
            <PaymentBackgroundIcons />
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
                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
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
                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
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
                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
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
                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'baridimob':
        return (
          <Box sx={{ mt: 3, p: 3, backgroundColor: 'rgba(250, 250, 250, 0.8)', borderRadius: 2, position: 'relative' }}>
            <PaymentBackgroundIcons />
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
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneAndroidIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Alert severity="info" icon={<InfoIcon />}>
              Après validation, vous recevrez un code QR pour finaliser le paiement via l'app BaridiMob
            </Alert>
          </Box>
        );
      
      case 'cheque':
        return (
          <Box sx={{ mt: 3, p: 3, backgroundColor: 'rgba(250, 250, 250, 0.8)', borderRadius: 2, position: 'relative' }}>
            <PaymentBackgroundIcons />
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
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', mb: 2 }}
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
      <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <PaymentBackgroundIcons />
        <Container maxWidth="md" sx={{ pt: 4, pb: 5, position: 'relative', zIndex: 1 }}>
          <Stepper activeStep={1} alternativeLabel sx={{ mb: 4, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2, p: 2 }}>
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
                    <BackgroundIcon
                      delay={0}
                      animation="pulse"
                      sx={{ position: 'absolute', top: '20%', right: '20%', opacity: 0.05 }}
                    >
                      <CloudUploadIcon fontSize="inherit" />
                    </BackgroundIcon>
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
                    backgroundColor: 'rgba(76, 175, 80, 0.1)'
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
                textTransform: 'none',
                background: loading ? undefined : 'linear-gradient(45deg, #1976d2, #42a5f5)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                }
              }}
            >
              {loading ? 'Traitement en cours...' : `Confirmer le paiement - ${selectedPlan.price} DA`}
            </LoadingButton>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Paiement sécurisé • Vos données sont protégées
            </Typography>
          </PaymentFormContainer>
        </Container>
      </Box>
    </Page>
  );
};

// Enhanced Success Page with animated background
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
    const methods: { [key: string]: { name: string; icon: string; time: string } } = {
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
      <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <PaymentBackgroundIcons />
        <Container maxWidth="md" sx={{ pt: 10, pb: 5, position: 'relative', zIndex: 1 }}>
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
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              position: 'relative'
            }}
          >
            <BackgroundIcon
              delay={0}
              animation="bounce"
              sx={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.1 }}
            >
              <CheckCircleOutlineIcon fontSize="inherit" />
            </BackgroundIcon>
            <BackgroundIcon
              delay={1}
              animation="pulse"
              sx={{ position: 'absolute', top: '20%', right: '15%', opacity: 0.1 }}
            >
              <SecurityIcon fontSize="inherit" />
            </BackgroundIcon>
            <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 120, mb: 3 }} />
            <Typography variant="h3" gutterBottom color="success.main">
              Paiement Confirmé !
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
              Votre abonnement au plan <strong>{plan?.name}</strong> a été enregistré
            </Typography>
          </Box>

          {/* Enhanced Success Popup with animations */}
          <Dialog
            open={openPopup}
            onClose={handleClosePopup}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 4,
                textAlign: 'center',
                p: 3,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)'
              }
            }}
          >
            <BackgroundIcon
              delay={0}
              animation="rotate"
              sx={{ position: 'absolute', top: '5%', right: '10%', opacity: 0.08 }}
            >
              <PaymentIcon fontSize="inherit" />
            </BackgroundIcon>
            <BackgroundIcon
              delay={1.5}
              animation="pulse"
              sx={{ position: 'absolute', bottom: '10%', left: '15%', opacity: 0.08 }}
            >
              <AttachMoneyIcon fontSize="inherit" />
            </BackgroundIcon>
            
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
                    margin: '0 auto 16px',
                    animation: `${bounce} 2s infinite`
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
                sx={{ 
                  mb: 3, 
                  fontSize: '0.9rem',
                  animation: `${pulse} 3s ease-in-out infinite`
                }}
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
                backgroundColor: requiresVerification ? 'rgba(255, 152, 0, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <BackgroundIcon
                  delay={0.5}
                  animation="wave"
                  sx={{ position: 'absolute', top: '20%', right: '20%', opacity: 0.05 }}
                >
                  <AccessTimeIcon fontSize="inherit" />
                </BackgroundIcon>
                <AccessTimeIcon sx={{ 
                  mb: 1, 
                  color: requiresVerification ? 'warning.dark' : 'info.dark',
                  fontSize: 32,
                  animation: `${rotate360} 4s linear infinite`
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
              
              <Box sx={{ position: 'relative', mb: 2 }}>
                <BackgroundIcon
                  delay={1}
                  animation="bounce"
                  sx={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)', opacity: 0.1 }}
                >
                  <ReceiptIcon fontSize="inherit" />
                </BackgroundIcon>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  📧 Un email de confirmation a été envoyé
                </Typography>
              </Box>
              
              <Box sx={{ position: 'relative', mb: 3 }}>
                <BackgroundIcon
                  delay={2}
                  animation="wave"
                  sx={{ position: 'absolute', right: '-30px', top: '50%', transform: 'translateY(-50%)', opacity: 0.1 }}
                >
                  <PhoneAndroidIcon fontSize="inherit" />
                </BackgroundIcon>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  📱 Vous recevrez un SMS de validation
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ position: 'relative' }}>
                <BackgroundIcon
                  delay={0}
                  animation="pulse"
                  sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05 }}
                >
                  <AccessTimeIcon fontSize="inherit" />
                </BackgroundIcon>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Redirection automatique dans{' '}
                  <Chip 
                    label={countdown}
                    size="small"
                    color="primary"
                    sx={{ 
                      fontWeight: 'bold',
                      animation: countdown <= 5 ? `${pulse} 1s ease-in-out infinite` : 'none'
                    }}
                  />{' '}
                  secondes
                </Typography>
              </Box>
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
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease'
                }}
                startIcon={<CheckCircleOutlineIcon />}
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
                  textTransform: 'none',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Fermer
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Page>
  );
};