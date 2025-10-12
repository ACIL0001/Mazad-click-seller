import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Box, Grid, Card, CardContent, CardHeader, Button, Divider, Alert, Stack, Link, Stepper, Step, StepLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { styled, alpha, keyframes } from '@mui/material/styles';
import Page from '../components/Page';
import { UploadMultiFile } from '../components/upload/UploadMultiFile';
import Iconify from '../components/Iconify';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import { IdentityAPI } from '@/api/identity';
import { authStore } from '../contexts/authStore';
import { useSnackbar } from 'notistack';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import useAuth from '@/hooks/useAuth';
import { uploadPaymentProof, getStoredPaymentProof, clearStoredPaymentProof } from '../utils/paymentProofUpload';

// Animation keyframes for background icons
const floatAnimation = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
  }
  25% { 
    transform: translateY(-20px) rotate(5deg);
  }
  50% { 
    transform: translateY(-10px) rotate(0deg);
  }
  75% { 
    transform: translateY(-30px) rotate(-5deg);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% { 
    opacity: 0.4;
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(1.1);
  }
`;

const rotateAnimation = keyframes`
  0% { 
    transform: rotate(0deg);
  }
  100% { 
    transform: rotate(360deg);
  }
`;

const slideAnimation = keyframes`
  0% { 
    transform: translateX(-100px) rotate(-10deg);
    opacity: 0.3;
  }
  50% { 
    transform: translateX(50px) rotate(5deg);
    opacity: 0.6;
  }
  100% { 
    transform: translateX(200px) rotate(-5deg);
    opacity: 0.3;
  }
`;

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  40% {
    transform: translateY(-30px) rotate(10deg);
  }
  60% {
    transform: translateY(-15px) rotate(-5deg);
  }
`;

// Background container for animated icons
const AnimatedBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: -1,
  pointerEvents: 'none',
}));

// Animated icon styles
const FloatingIcon = styled(Box, {
  shouldForwardProp: (prop) => !['delay', 'duration', 'animationType'].includes(String(prop)),
})<{ delay?: string; duration?: string; animationType?: string }>(({ theme, delay = '0s', duration = '6s', animationType = 'float' }) => ({
  position: 'absolute',
  color: alpha(theme.palette.primary.main, 0.15),
  fontSize: '3rem',
  animation: `${
    animationType === 'float' ? floatAnimation :
    animationType === 'pulse' ? pulseAnimation :
    animationType === 'rotate' ? rotateAnimation :
    animationType === 'slide' ? slideAnimation :
    bounceAnimation
  } ${duration} ease-in-out infinite`,
  animationDelay: delay,
  zIndex: 0,
}));

const DocumentIcon = styled(Iconify)(({ theme }) => ({
  width: '100%',
  height: '100%',
  filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.1)})`,
}));

const GlassCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(20px) saturate(180%)',
  backgroundColor: alpha(theme.palette.background.paper, 0.15),
  boxShadow: `
    0 8px 32px rgba(31, 38, 135, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.08)
  `,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  borderRadius: '24px',
  overflow: 'hidden',
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.light, 0.3)}, transparent)`,
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `
      0 20px 60px rgba(31, 38, 135, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    backgroundColor: alpha(theme.palette.background.paper, 0.22),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  maxHeight: 'none',
  minHeight: '320px',
}));

const RequiredGlassCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(20px) saturate(180%)',
  backgroundColor: alpha('#fff5f5', 0.12),
  boxShadow: `
    0 8px 32px rgba(255, 107, 107, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.08)
  `,
  border: `1px solid ${alpha('#ff6b6b', 0.12)}`,
  borderRadius: '24px',
  overflow: 'hidden',
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${alpha('#ff6b6b', 0.3)}, transparent)`,
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `
      0 20px 60px rgba(255, 107, 107, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    backgroundColor: alpha('#fff5f5', 0.18),
    border: `1px solid ${alpha('#ff6b6b', 0.2)}`,
  },
  maxHeight: 'none',
  minHeight: '320px',
}));

const CompactCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
  borderBottom: 'none',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: theme.spacing(3),
    right: theme.spacing(3),
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.1)}, transparent)`,
  },
  '& .MuiCardHeader-title': {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: theme.palette.primary.dark,
    letterSpacing: '0.01em',
  },
  '& .MuiCardHeader-avatar': {
    marginRight: theme.spacing(1.5),
  },
}));

const RequiredCompactCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  background: `linear-gradient(135deg, ${alpha('#ff6b6b', 0.08)} 0%, ${alpha('#ff6b6b', 0.04)} 100%)`,
  borderBottom: 'none',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: theme.spacing(3),
    right: theme.spacing(3),
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${alpha('#ff6b6b', 0.15)}, transparent)`,
  },
  '& .MuiCardHeader-title': {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#d63384',
    letterSpacing: '0.01em',
  },
  '& .MuiCardHeader-avatar': {
    marginRight: theme.spacing(1.5),
  },
}));

const CompactCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2.5, 3, 3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
  overflowY: 'auto',
  background: 'transparent',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const CompactUploadContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  '& .MuiBox-root': {
    '& .MuiStack-root': {
      padding: theme.spacing(0.5),
    },
  },
  '& .MuiTypography-h5': {
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  '& .MuiTypography-body2': {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  '& .DropZoneStyle': {
    minHeight: '120px',
    padding: theme.spacing(2),
    borderRadius: '16px',
    border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
    backgroundColor: alpha(theme.palette.primary.light, 0.03),
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.light, 0.08),
      border: `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
      transform: 'translateY(-2px)',
    },
  },
  '& .MuiIconButton-root': {
    padding: '4px',
  },
  '& .MuiList-root': {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3, 4),
  borderRadius: '28px',
  backdropFilter: 'blur(25px) saturate(180%)',
  backgroundColor: alpha(theme.palette.background.paper, 0.15),
  boxShadow: `
    0 12px 40px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
    borderRadius: '28px 28px 0 0',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

const ProgressStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(5),
  padding: theme.spacing(4),
  backdropFilter: 'blur(25px) saturate(180%)',
  backgroundColor: alpha(theme.palette.background.paper, 0.12),
  borderRadius: '28px',
  boxShadow: `
    0 12px 40px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.08)
  `,
  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  '& .MuiStepLabel-root .Mui-completed': {
    color: theme.palette.success.main,
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: theme.palette.primary.main,
  },
  '& .MuiStepConnector-line': {
    borderColor: alpha(theme.palette.divider, 0.2),
  },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: '20px',
  backdropFilter: 'blur(20px) saturate(180%)',
  backgroundColor: alpha(theme.palette.background.paper, 0.15),
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  border: 'none',
  marginBottom: theme.spacing(3),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  backdropFilter: 'blur(8px)',
  boxShadow: 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    backgroundColor: alpha(theme.palette.action.hover, 0.1),
  },
}));

const ActionLoadingButton = styled(LoadingButton)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.25)',
  border: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(25, 118, 210, 0.35)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
  marginBottom: theme.spacing(1.5),
  letterSpacing: '0.02em',
}));

const SectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  borderRadius: '24px',
  backdropFilter: 'blur(20px) saturate(180%)',
  backgroundColor: alpha('#fff5f5', 0.08),
  boxShadow: `
    0 8px 32px rgba(255, 107, 107, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.08)
  `,
  border: `1px solid ${alpha('#ff6b6b', 0.08)}`,
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${alpha('#ff6b6b', 0.2)}, transparent)`,
    borderRadius: '24px 24px 0 0',
  },
}));

const OptionalSectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  borderRadius: '24px',
  backdropFilter: 'blur(20px) saturate(180%)',
  backgroundColor: alpha(theme.palette.background.paper, 0.08),
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.08)
  `,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  marginTop: theme.spacing(5),
  marginBottom: theme.spacing(3),
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
    borderRadius: '24px 24px 0 0',
  },
}));

const ActionContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(5),
  padding: theme.spacing(3, 4),
  borderRadius: '24px',
  backdropFilter: 'blur(20px) saturate(180%)',
  backgroundColor: alpha(theme.palette.background.paper, 0.08),
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.08)
  `,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
}));

// Background Icons Component
const BackgroundIcons = () => {
  return (
    <AnimatedBackground>
      {/* Document upload icons */}
      <FloatingIcon style={{ top: '10%', left: '5%' }} delay="0s" duration="8s" animationType="float">
        <DocumentIcon icon="mdi:file-upload" />
      </FloatingIcon>
      
      <FloatingIcon style={{ top: '20%', right: '8%' }} delay="1s" duration="6s" animationType="pulse">
        <DocumentIcon icon="mdi:file-document-multiple" />
      </FloatingIcon>
      
      <FloatingIcon style={{ top: '40%', left: '3%' }} delay="2s" duration="10s" animationType="bounce">
        <DocumentIcon icon="mdi:certificate" />
      </FloatingIcon>
      
      <FloatingIcon style={{ bottom: '30%', right: '5%' }} delay="1.5s" duration="7s" animationType="float">
        <DocumentIcon icon="mdi:file-check" />
      </FloatingIcon>
      
      <FloatingIcon style={{ bottom: '15%', left: '10%' }} delay="3s" duration="9s" animationType="pulse">
        <DocumentIcon icon="mdi:shield-check" />
      </FloatingIcon>
      
      {/* Identity verification icons */}
      <FloatingIcon style={{ top: '60%', left: '15%' }} delay="4s" duration="8s" animationType="rotate">
        <DocumentIcon icon="mdi:account-check" />
      </FloatingIcon>
      
      <FloatingIcon style={{ top: '30%', right: '20%' }} delay="2.5s" duration="6s" animationType="bounce">
        <DocumentIcon icon="mdi:card-account-details" />
      </FloatingIcon>
      
      <FloatingIcon style={{ bottom: '50%', right: '15%' }} delay="5s" duration="7s" animationType="float">
        <DocumentIcon icon="mdi:file-certificate" />
      </FloatingIcon>
      
      {/* Professional documents icons */}
      <FloatingIcon style={{ top: '50%', left: '25%' }} delay="1.8s" duration="9s" animationType="pulse">
        <DocumentIcon icon="mdi:briefcase-check" />
      </FloatingIcon>
      
      <FloatingIcon style={{ bottom: '40%', left: '30%' }} delay="3.5s" duration="8s" animationType="slide">
        <DocumentIcon icon="mdi:file-chart" />
      </FloatingIcon>
      
      <FloatingIcon style={{ top: '35%', right: '30%' }} delay="4.2s" duration="6s" animationType="bounce">
        <DocumentIcon icon="mdi:bank" />
      </FloatingIcon>
      
      <FloatingIcon style={{ bottom: '20%', right: '25%' }} delay="6s" duration="7s" animationType="float">
        <DocumentIcon icon="mdi:numeric" />
      </FloatingIcon>
      
      {/* Additional scattered icons */}
      <FloatingIcon style={{ top: '70%', right: '12%' }} delay="7s" duration="8s" animationType="pulse">
        <DocumentIcon icon="mdi:file-lock" />
      </FloatingIcon>
      
      <FloatingIcon style={{ top: '15%', left: '20%' }} delay="8s" duration="6s" animationType="rotate">
        <DocumentIcon icon="mdi:cloud-upload" />
      </FloatingIcon>
      
      <FloatingIcon style={{ bottom: '60%', left: '8%' }} delay="2.8s" duration="9s" animationType="bounce">
        <DocumentIcon icon="mdi:file-pdf-box" />
      </FloatingIcon>
      
      <FloatingIcon style={{ top: '80%', left: '40%' }} delay="5.5s" duration="7s" animationType="slide">
        <DocumentIcon icon="mdi:check-circle" />
      </FloatingIcon>
      
      <FloatingIcon style={{ top: '25%', left: '35%' }} delay="9s" duration="8s" animationType="float">
        <DocumentIcon icon="mdi:file-image" />
      </FloatingIcon>
      
      <FloatingIcon style={{ bottom: '35%', right: '35%' }} delay="4.8s" duration="6s" animationType="pulse">
        <DocumentIcon icon="mdi:folder-upload" />
      </FloatingIcon>
    </AnimatedBackground>
  );
};

export default function IdentityVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const { enqueueSnackbar } = useSnackbar();
  const { refreshUserData } = useAuth();
  
  // Add authentication check and identity status check
  useEffect(() => {
    const { tokens, user: authUser } = authStore.getState().auth;
    if (!tokens || !tokens.accessToken) {
      navigate('/login');
      return;
    }

    // Check if user is verified (has completed OTP validation)
    if (!authUser?.isVerified) {
      enqueueSnackbar('Veuillez d\'abord valider votre numéro de téléphone', { 
        variant: 'warning',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
      navigate('/login');
      return;
    }

    // Check if we've already shown this message in this session
    const hasShownMessage = sessionStorage.getItem('identityMessageShown') === 'true';
    if (hasShownMessage) {
      console.log('IdentityVerification - Message already shown this session, skipping check');
      return;
    }

    // Check if user already has identity documents submitted
    const checkIdentityStatus = async () => {
      try {
        console.log('IdentityVerification - Checking if user already has identity documents...');
        const identity = await IdentityAPI.getMy();
        console.log('IdentityVerification - Identity check result:', identity);
        
        // Check if we just submitted documents to avoid circular redirects
        const justSubmitted = localStorage.getItem('identityJustSubmitted') === 'true';
        
        if (identity && !justSubmitted) {
          console.log('IdentityVerification - User already has identity, redirecting to subscription plans');
          
          // Set the flag to avoid showing the message again in this session
          sessionStorage.setItem('identityMessageShown', 'true');
          
          enqueueSnackbar('Vous avez déjà soumis vos documents d\'identité', { 
            variant: 'info',
            preventDuplicate: true,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center'
            }
          });
          
          // Navigate with a slight delay to ensure the message is seen
          setTimeout(() => {
            navigate('/subscription-plans');
          }, 200);
          return;
        }
        console.log('IdentityVerification - No existing identity found, proceeding with form');
      } catch (error) {
        console.error('Error checking identity status:', error);
        // Continue with the form if there's an error checking status
      }
    };

    checkIdentityStatus();
  }, []);

  // OPTIONAL FIELDS ONLY (removed commercialRegister, carteAutoEntrepreneur, and nif as they're now required)
  const [nis, setNis] = useState<File[]>([]);
  const [balanceSheet, setBalanceSheet] = useState<File[]>([]);
  const [certificates, setCertificates] = useState<File[]>([]);

  // NEW REQUIRED FIELDS
  const [registreCommerceCarteAuto, setRegistreCommerceCarteAuto] = useState<File[]>([]);
  const [nifRequired, setNifRequired] = useState<File[]>([]);
  const [carteFellah, setCarteFellah] = useState<File[]>([]);
  
  // OPTIONAL FIELDS (moved from required)
  const [numeroArticle, setNumeroArticle] = useState<File[]>([]);
  const [c20, setC20] = useState<File[]>([]);
  const [misesAJourCnas, setMisesAJourCnas] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error' | 'info' | null, message: string}>({
    type: null,
    message: '',
  });

  const handleLogout = () => {
    authStore.getState().clear();
    navigate('/login');
  };

  // Handle document upload for optional fields (removed redundant handlers)
  const handleDropNis = useCallback((acceptedFiles: File[]) => {
    setNis(acceptedFiles);
  }, []);

  const handleDropBalanceSheet = useCallback((acceptedFiles: File[]) => {
    setBalanceSheet(acceptedFiles);
  }, []);

  const handleDropCertificates = useCallback((acceptedFiles: File[]) => {
    setCertificates(acceptedFiles);
  }, []);

  // Handle document upload for new required fields
  const handleDropRegistreCommerceCarteAuto = useCallback((acceptedFiles: File[]) => {
    setRegistreCommerceCarteAuto(acceptedFiles);
  }, []);

  const handleDropNifRequired = useCallback((acceptedFiles: File[]) => {
    setNifRequired(acceptedFiles);
  }, []);

  const handleDropCarteFellah = useCallback((acceptedFiles: File[]) => {
    setCarteFellah(acceptedFiles);
  }, []);

  const handleDropNumeroArticle = useCallback((acceptedFiles: File[]) => {
    setNumeroArticle(acceptedFiles);
  }, []);

  const handleDropC20 = useCallback((acceptedFiles: File[]) => {
    setC20(acceptedFiles);
  }, []);

  const handleDropMisesAJourCnas = useCallback((acceptedFiles: File[]) => {
    setMisesAJourCnas(acceptedFiles);
  }, []);

  // Clear file handlers
  const handleRemoveAll = (setter: React.Dispatch<React.SetStateAction<File[]>>) => {
    setter([]);
  };

  const handleRemove = (file: File, files: File[], setter: React.Dispatch<React.SetStateAction<File[]>>) => {
    const filteredFiles = files.filter((_file) => _file !== file);
    setter(filteredFiles);
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validate required fields (only registre commerce and NIF are mandatory)
    const requiredFieldsValidation = [
      { files: registreCommerceCarteAuto, name: 'Registre de commerce/carte auto-entrepreneur' },
      { files: nifRequired, name: 'NIF' },
    ];

    const missingRequired = requiredFieldsValidation.filter(field => !field.files.length);
    
    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map(field => field.name).join(', ');
      setSubmitStatus({
        type: 'error',
        message: `Les documents suivants sont requis: ${missingNames}`,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({
      type: 'info',
      message: 'Soumission des documents en cours...',
    });

    try {
      const formData = new FormData();
      
      // REQUIRED FIELDS - Only append the first file since backend expects maxCount: 1
      if (registreCommerceCarteAuto.length > 0) {
        formData.append('registreCommerceCarteAuto', registreCommerceCarteAuto[0]);
      }
      if (nifRequired.length > 0) {
        formData.append('nifRequired', nifRequired[0]);
      }
      
      // OPTIONAL FIELD - Carte Fellah (required only for fellah category)
      if (carteFellah.length > 0) {
        formData.append('carteFellah', carteFellah[0]);
      }
      
      // OPTIONAL FIELDS - Only append the first file since backend expects maxCount: 1
      if (numeroArticle.length > 0) {
        formData.append('numeroArticle', numeroArticle[0]);
      }
      if (c20.length > 0) {
        formData.append('c20', c20[0]);
      }
      if (misesAJourCnas.length > 0) {
        formData.append('misesAJourCnas', misesAJourCnas[0]);
      }
      if (nis.length > 0) {
        formData.append('nis', nis[0]);
      }
      if (balanceSheet.length > 0) {
        formData.append('last3YearsBalanceSheet', balanceSheet[0]);
      }
      if (certificates.length > 0) {
        formData.append('certificates', certificates[0]);
      }

      // Debug: Log what we're sending
      console.log('📤 Submitting identity documents with fields:');
      for (let pair of formData.entries()) {
        console.log(`  - ${pair[0]}: ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
      }

      // Call API to upload professional documents
      const identityResult = await IdentityAPI.create(formData);
      
      // Upload payment proof if it exists
      console.log('🔍 Checking for stored payment proof...');
      const storedPaymentProof = getStoredPaymentProof();
      console.log('🔍 Stored payment proof:', storedPaymentProof);
      
      if (storedPaymentProof && storedPaymentProof.file && identityResult?._id) {
        console.log('✅ Found stored payment proof, uploading to identity:', identityResult._id);
        console.log('🔍 Payment proof file details:', {
          name: storedPaymentProof.fileName,
          type: storedPaymentProof.fileType,
          size: storedPaymentProof.file.size
        });
        
        try {
          const paymentProofUploaded = await uploadPaymentProof(identityResult._id, storedPaymentProof.file);
          if (paymentProofUploaded) {
            console.log('✅ Payment proof uploaded successfully');
            clearStoredPaymentProof(); // Clear from session storage after successful upload
          } else {
            console.error('❌ Failed to upload payment proof');
          }
        } catch (paymentError) {
          console.error('❌ Error uploading payment proof:', paymentError);
          // Don't fail the entire process if payment proof upload fails
        }
      } else {
        console.log('❌ No stored payment proof found or no identity ID');
        console.log('🔍 Debug info:', {
          hasStoredProof: !!storedPaymentProof,
          hasFile: !!(storedPaymentProof && storedPaymentProof.file),
          hasIdentityId: !!identityResult?._id,
          identityId: identityResult?._id
        });
      }
      
      // Refresh user data to get updated isHasIdentity status
      const updatedUser = await refreshUserData();
      
      console.log('IdentityVerification - User data after upload:', updatedUser);
      console.log('IdentityVerification - isHasIdentity status:', updatedUser?.isHasIdentity);
      
      // Set flags to indicate documents have been submitted in this session
      localStorage.setItem('identityJustSubmitted', 'true');
      sessionStorage.setItem('identityMessageShown', 'true');
      
      setSubmitStatus({
        type: 'success',
        message: 'Documents soumis avec succès! Redirection vers le tableau de bord...',
      });
      enqueueSnackbar('Documents soumis avec succès', { variant: 'success' });
      
      // Add a small delay to ensure state updates are processed
      setTimeout(() => {
        // Navigate to dashboard to show the updated status (Documents Under Review page)
        navigate('/subscription-plans');
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error submitting identity documents:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      // Handle specific error cases
      let errorMessage = 'Une erreur est survenue lors de la soumission. Veuillez réessayer.';
      
      if (error?.response?.status === 400) {
        // Bad Request - likely validation error
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = 'Les documents requis sont manquants ou invalides. Veuillez vérifier que vous avez téléchargé le Registre de commerce/Carte auto-entrepreneur et le NIF.';
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // If it's a duplicate submission error, redirect to subscription plans
      if (errorMessage.includes('déjà soumis') || errorMessage.includes('doublon') || errorMessage.includes('already')) {
        setSubmitStatus({
          type: 'info',
          message: 'Vous avez déjà soumis vos documents d\'identité. Redirection vers le tableau de bord...',
        });
        enqueueSnackbar('Documents déjà soumis', { variant: 'info' });
        navigate('/subscription-plans');
        return;
      }
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage,
      });
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Page title="Vérification d'identité professionnelle">
      {/* Animated Background Icons */}
      <BackgroundIcons />
      
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <HeaderSection>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Logo sx={{ mr: 2, width: 120, height: 80 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                Vérification d'identité professionnelle
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
                Complétez votre profil en téléchargeant les documents requis
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/login"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleLogout}
            sx={{ 
              height: 48, 
              borderRadius: 3,
              px: 3,
              fontSize: 16,
              textTransform: 'none',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              borderColor: alpha('#1976d2', 0.3),
              backgroundColor: alpha('#1976d2', 0.05),
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#1976d2',
                backgroundColor: alpha('#1976d2', 0.1),
                transform: 'translateY(-2px)',
              }
            }}
          >
            Retour à la connexion
          </Button>
        </HeaderSection>

        {/* Progress Stepper */}
        <ProgressStepper activeStep={0} alternativeLabel>
          <Step>
            <StepLabel>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.9rem' }}>
                  Étape 1
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  Vérification d'identité
                </Typography>
              </Box>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.9rem' }}>
                  Étape 2
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  Choix d'abonnement
                </Typography>
              </Box>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.9rem' }}>
                  Étape 3
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  Paiement
                </Typography>
              </Box>
            </StepLabel>
          </Step>
        </ProgressStepper>

        {submitStatus.type && (
          <StyledAlert severity={submitStatus.type}>
            {submitStatus.message}
          </StyledAlert>
        )}

        <SectionContainer>
          <SectionTitle variant="h6">
            Documents obligatoires à fournir
          </SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
            Le <strong>Registre de commerce/Carte auto-entrepreneur</strong> et le <strong>NIF</strong> sont obligatoires pour tous. 
            La <strong>Carte Fellah</strong> est obligatoire uniquement pour la catégorie Fellah. Les autres documents sont optionnels.
          </Typography>
        </SectionContainer>

        <Grid container spacing={4}>
          {/* REQUIRED FIELDS */}
          <Grid item xs={12} sm={6} md={4}>
            <RequiredGlassCard>
              <RequiredCompactCardHeader 
                title="Registre de commerce/Carte auto-entrepreneur (OBLIGATOIRE)" 
                titleTypographyProps={{ variant: 'subtitle2' }}
                avatar={<Box sx={{ 
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #d63384 100%)',
                  borderRadius: '12px', 
                  p: 1, 
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                }}>
                  <Iconify icon="mdi:file-document" width={20} height={20} sx={{ color: 'white' }} />
                </Box>}
              />
              <CompactCardContent>
                <Typography variant="body2" sx={{ mb: 2, color: '#d63384', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Document obligatoire: Registre de commerce, carte auto-entrepreneur, agrément ou carte d'artisan.
                </Typography>
                <CompactUploadContainer>
                  <UploadMultiFile
                    showPreview
                    files={registreCommerceCarteAuto}
                    onDrop={handleDropRegistreCommerceCarteAuto}
                    onRemove={(file) => handleRemove(file, registreCommerceCarteAuto, setRegistreCommerceCarteAuto)}
                    onRemoveAll={() => handleRemoveAll(setRegistreCommerceCarteAuto)}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    compact
                  />
                </CompactUploadContainer>
              </CompactCardContent>
            </RequiredGlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <RequiredGlassCard>
              <RequiredCompactCardHeader 
                title="NIF (OBLIGATOIRE)" 
                titleTypographyProps={{ variant: 'subtitle2' }}
                avatar={<Box sx={{ 
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #d63384 100%)',
                  borderRadius: '12px', 
                  p: 1, 
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                }}>
                  <Iconify icon="mdi:card-account-details" width={20} height={20} sx={{ color: 'white' }} />
                </Box>}
              />
              <CompactCardContent>
                <Typography variant="body2" sx={{ mb: 2, color: '#d63384', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Document obligatoire: Numéro d'identification fiscale (NIF).
                </Typography>
                <CompactUploadContainer>
                  <UploadMultiFile
                    showPreview
                    files={nifRequired}
                    onDrop={handleDropNifRequired}
                    onRemove={(file) => handleRemove(file, nifRequired, setNifRequired)}
                    onRemoveAll={() => handleRemoveAll(setNifRequired)}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    compact
                  />
                </CompactUploadContainer>
              </CompactCardContent>
            </RequiredGlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <RequiredGlassCard>
              <RequiredCompactCardHeader 
                title="Carte Fellah (OBLIGATOIRE pour Fellah)" 
                titleTypographyProps={{ variant: 'subtitle2' }}
                avatar={<Box sx={{ 
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #d63384 100%)',
                  borderRadius: '12px', 
                  p: 1, 
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                }}>
                  <Iconify icon="mdi:account-card" width={20} height={20} sx={{ color: 'white' }} />
                </Box>}
              />
              <CompactCardContent>
                <Typography variant="body2" sx={{ mb: 2, color: '#d63384', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Document obligatoire uniquement pour la catégorie Fellah.
                </Typography>
                <CompactUploadContainer>
                  <UploadMultiFile
                    showPreview
                    files={carteFellah}
                    onDrop={handleDropCarteFellah}
                    onRemove={(file) => handleRemove(file, carteFellah, setCarteFellah)}
                    onRemoveAll={() => handleRemoveAll(setCarteFellah)}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    compact
                  />
                </CompactUploadContainer>
              </CompactCardContent>
            </RequiredGlassCard>
          </Grid>
        </Grid>

        {/* OPTIONAL FIELDS SECTION */}
        <OptionalSectionContainer>
          <SectionTitle variant="h6">
            Documents optionnels
          </SectionTitle>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
            Ces documents ne sont pas obligatoires mais peuvent accélérer votre processus de vérification.
          </Typography>
        </OptionalSectionContainer>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <GlassCard>
              <CompactCardHeader 
                title="Numéro d'article (Optionnel)" 
                titleTypographyProps={{ variant: 'subtitle2' }}
                avatar={<Box sx={{ 
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  borderRadius: '12px', 
                  p: 1, 
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                }}>
                  <Iconify icon="mdi:numeric" width={20} height={20} sx={{ color: 'white' }} />
                </Box>}
              />
              <CompactCardContent>
                <Typography variant="body2" sx={{ mb: 2, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Document optionnel: Numéro d'article d'imposition.
                </Typography>
                <CompactUploadContainer>
                  <UploadMultiFile
                    showPreview
                    files={numeroArticle}
                    onDrop={handleDropNumeroArticle}
                    onRemove={(file) => handleRemove(file, numeroArticle, setNumeroArticle)}
                    onRemoveAll={() => handleRemoveAll(setNumeroArticle)}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    compact
                  />
                </CompactUploadContainer>
              </CompactCardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <GlassCard>
              <CompactCardHeader 
                title="C20 (Optionnel)" 
                titleTypographyProps={{ variant: 'subtitle2' }}
                avatar={<Box sx={{ 
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                  borderRadius: '12px', 
                  p: 1, 
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                }}>
                  <Iconify icon="mdi:file-certificate" width={20} height={20} sx={{ color: 'white' }} />
                </Box>}
              />
              <CompactCardContent>
                <Typography variant="body2" sx={{ mb: 2, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Document optionnel: Certificat C20.
                </Typography>
                <CompactUploadContainer>
                  <UploadMultiFile
                    showPreview
                    files={c20}
                    onDrop={handleDropC20}
                    onRemove={(file) => handleRemove(file, c20, setC20)}
                    onRemoveAll={() => handleRemoveAll(setC20)}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    compact
                  />
                </CompactUploadContainer>
              </CompactCardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <GlassCard>
              <CompactCardHeader 
                title="Mises à jour CNAS/CASNOS et CACOBAPT (Optionnel)" 
                titleTypographyProps={{ variant: 'subtitle2' }}
                avatar={<Box sx={{ 
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  borderRadius: '12px', 
                  p: 1, 
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                }}>
                  <Iconify icon="mdi:update" width={20} height={20} sx={{ color: 'white' }} />
                </Box>}
              />
              <CompactCardContent>
                <Typography variant="body2" sx={{ mb: 2, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Document optionnel: Mises à jour CNAS/CASNOS et CACOBAPT.
                </Typography>
                <CompactUploadContainer>
                  <UploadMultiFile
                    showPreview
                    files={misesAJourCnas}
                    onDrop={handleDropMisesAJourCnas}
                    onRemove={(file) => handleRemove(file, misesAJourCnas, setMisesAJourCnas)}
                    onRemoveAll={() => handleRemoveAll(setMisesAJourCnas)}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    compact
                  />
                </CompactUploadContainer>
              </CompactCardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <GlassCard>
              <CompactCardHeader 
                title="NIS (Optionnel)" 
                titleTypographyProps={{ variant: 'subtitle2' }}
                avatar={<Box sx={{ 
                  background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                  borderRadius: '12px', 
                  p: 1, 
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                }}>
                  <Iconify icon="mdi:card-bulleted" width={20} height={20} sx={{ color: 'white' }} />
                </Box>}
              />
              <CompactCardContent>
                <Typography variant="body2" sx={{ mb: 2, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Document optionnel: Certificat NIS.
                </Typography>
                <CompactUploadContainer>
                  <UploadMultiFile
                    showPreview
                    files={nis}
                    onDrop={handleDropNis}
                    onRemove={(file) => handleRemove(file, nis, setNis)}
                    onRemoveAll={() => handleRemoveAll(setNis)}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    compact
                  />
                </CompactUploadContainer>
              </CompactCardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <GlassCard>
              <CompactCardHeader 
                title="Bilans des 3 dernières années (Optionnel)" 
                titleTypographyProps={{ variant: 'subtitle2' }}
                avatar={<Box sx={{ 
                  background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
                  borderRadius: '12px', 
                  p: 1, 
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
                }}>
                  <Iconify icon="mdi:file-chart" width={20} height={20} sx={{ color: 'white' }} />
                </Box>}
              />
              <CompactCardContent>
                <Typography variant="body2" sx={{ mb: 2, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Document optionnel: Bilans financiers des 3 dernières années.
                </Typography>
                <CompactUploadContainer>
                  <UploadMultiFile
                    showPreview
                    files={balanceSheet}
                    onDrop={handleDropBalanceSheet}
                    onRemove={(file) => handleRemove(file, balanceSheet, setBalanceSheet)}
                    onRemoveAll={() => handleRemoveAll(setBalanceSheet)}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    compact
                  />
                </CompactUploadContainer>
              </CompactCardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <GlassCard>
              <CompactCardHeader 
                title="Certificats (Optionnel)" 
                titleTypographyProps={{ variant: 'subtitle2' }}
                avatar={<Box sx={{ 
                  background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                  borderRadius: '12px', 
                  p: 1, 
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                }}>
                  <Iconify icon="mdi:certificate" width={20} height={20} sx={{ color: 'white' }} />
                </Box>}
              />
              <CompactCardContent>
                <Typography variant="body2" sx={{ mb: 2, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Document optionnel: Certificats professionnels pertinents.
                </Typography>
                <CompactUploadContainer>
                  <UploadMultiFile
                    showPreview
                    files={certificates}
                    onDrop={handleDropCertificates}
                    onRemove={(file) => handleRemove(file, certificates, setCertificates)}
                    onRemoveAll={() => handleRemoveAll(setCertificates)}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    compact
                  />
                </CompactUploadContainer>
              </CompactCardContent>
            </GlassCard>
          </Grid>
        </Grid>

        <ActionContainer>
          <Stack direction="row" spacing={3} justifyContent="flex-end">
            <ActionButton 
              variant="outlined" 
              color="inherit" 
              onClick={handleCancel}
              sx={{ 
                color: 'text.secondary',
                backgroundColor: alpha('#000', 0.02),
                '&:hover': {
                  backgroundColor: alpha('#000', 0.08),
                }
              }}
            >
              Annuler
            </ActionButton>
            <ActionLoadingButton 
              variant="contained" 
              onClick={handleSubmit} 
              loading={isSubmitting}
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                }
              }}
            >
              Soumettre les documents
            </ActionLoadingButton>
          </Stack>
        </ActionContainer>
      </Container>
    </Page>
  );
}