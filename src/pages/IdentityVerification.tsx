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
  
  // Check if we're coming from subscription-plans FIRST, before any other checks
  // This must be done outside useEffect to prevent any redirects from happening
  const fromSubscriptionPlans = React.useMemo(() => {
    // Check if we're coming from OTP (normal navigation) - if so, clear any goToStep2 flag
    const fromOtp = location.state?.fromOtp !== false && !location.state?.fromSubscriptionPlans && !location.state?.goToStep2;
    if (fromOtp && sessionStorage.getItem('goToStep2') === 'true') {
      console.log('IdentityVerification - Coming from OTP, clearing goToStep2 flag');
      sessionStorage.removeItem('goToStep2');
      sessionStorage.removeItem('fromSubscriptionPlans');
    }
    
    const fromState = location.state?.fromSubscriptionPlans === true || location.state?.allowAccess === true;
    const fromStorage = sessionStorage.getItem('fromSubscriptionPlans') === 'true' ||
                       sessionStorage.getItem('allowIdentityVerificationAccess') === 'true';
    const result = fromState || fromStorage;
    
    if (result) {
      console.log('IdentityVerification - Detected navigation from subscription-plans', {
        fromState,
        fromStorage,
        locationState: location.state,
        pathname: window.location.pathname,
        href: window.location.href
      });
      
      // Prevent any navigation away from this page if we're coming from subscription-plans
      // Set a flag that other parts of the code can check
      sessionStorage.setItem('blockRedirectsFromIdentityVerification', 'true');
    }
    
    return result;
  }, [location.state]);

  // Add authentication check and identity status check
  useEffect(() => {
    // Double-check the flag at the start of useEffect
    const checkFlagAgain = location.state?.fromSubscriptionPlans === true || 
                          location.state?.allowAccess === true ||
                          sessionStorage.getItem('fromSubscriptionPlans') === 'true' ||
                          sessionStorage.getItem('allowIdentityVerificationAccess') === 'true' ||
                          sessionStorage.getItem('blockRedirectsFromIdentityVerification') === 'true';
    
    const { tokens, user: authUser } = authStore.getState().auth;
    if (!tokens || !tokens.accessToken) {
      if (!checkFlagAgain) {
        navigate('/login');
      }
      return;
    }

    // Check if user is verified (has completed OTP validation)
    if (!authUser?.isVerified) {
      if (!checkFlagAgain) {
        enqueueSnackbar('Veuillez d\'abord valider votre numéro de téléphone', { 
          variant: 'warning',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        navigate('/login');
      }
      return;
    }

    // Check if we're coming from subscription-plans (back button clicked)
    // If so, skip the redirect check and allow user to view/edit the form
    if (fromSubscriptionPlans || checkFlagAgain) {
      // Clear the flags
      sessionStorage.removeItem('fromSubscriptionPlans');
      sessionStorage.removeItem('allowIdentityVerificationAccess');
      sessionStorage.removeItem('blockRedirectsFromIdentityVerification');
      sessionStorage.removeItem('goToStep2');
      // Allow user to view the form even if they already have documents
      console.log('IdentityVerification - Coming from subscription-plans, allowing access to form');
      console.log('IdentityVerification - Skipping identity redirect check');
      console.log('IdentityVerification - User has identity:', authUser?.isHasIdentity);
      console.log('IdentityVerification - Current pathname:', window.location.pathname);
      console.log('IdentityVerification - Current step:', currentStep);
      // Skip the identity check that would redirect away
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

  // Step management
  // Initialize step based on whether we're coming from subscription-plans
  // If coming from subscription-plans with goToStep2 flag, start at step 2 (optional documents)
  // Otherwise (from OTP or normal navigation), start at step 1 (required documents)
  const initialStep = React.useMemo(() => {
    // Ensure goToStep2 flag is cleared if coming from OTP (normal navigation)
    const isFromOtp = !location.state?.fromSubscriptionPlans && !location.state?.goToStep2;
    if (isFromOtp && sessionStorage.getItem('goToStep2') === 'true') {
      sessionStorage.removeItem('goToStep2');
      console.log('IdentityVerification - Coming from OTP, cleared goToStep2 flag, starting at step 1');
      return 1;
    }
    
    // Only check for goToStep2 flag - this is explicitly set when coming from subscription-plans
    const goToStep2 = location.state?.goToStep2 === true ||
                      sessionStorage.getItem('goToStep2') === 'true';
    
    if (goToStep2) {
      console.log('IdentityVerification - Initializing at step 2 (optional documents) - coming from subscription-plans');
      return 2;
    }
    
    // Default: start at step 1 (required documents) when coming from OTP or normal navigation
    console.log('IdentityVerification - Initializing at step 1 (required documents) - normal navigation from OTP');
    return 1;
  }, [location.state]);
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isStep1Valid, setIsStep1Valid] = useState(initialStep === 2);

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

  // Step validation and navigation
  const validateStep1 = () => {
    const hasRcAndNif = registreCommerceCarteAuto.length > 0 && nifRequired.length > 0;
    const hasCarteFellah = carteFellah.length > 0;
    return hasRcAndNif || hasCarteFellah;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const isValid = validateStep1();
      if (!isValid) {
        setSubmitStatus({
          type: 'error',
          message: 'Vous devez fournir soit (RC/autres + NIF/N° articles) soit (Carte Fellah uniquement).',
        });
        return;
      }
      setIsStep1Valid(true);
      setCurrentStep(2);
      setSubmitStatus({ type: null, message: '' });
    }
  };

  const handlePreviousStep = (e?: React.MouseEvent) => {
    // Prevent event propagation in case there are nested buttons
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('IdentityVerification - handlePreviousStep called, currentStep:', currentStep);
    
    if (currentStep === 2) {
      console.log('IdentityVerification - Going back from step 2 to step 1');
      // Set a flag to prevent any navigation during step change
      sessionStorage.setItem('changingStep', 'true');
      // Change step
      setCurrentStep(1);
      setSubmitStatus({ type: null, message: '' });
      // Clear the flag after a short delay
      setTimeout(() => {
        sessionStorage.removeItem('changingStep');
      }, 100);
    } else {
      console.log('IdentityVerification - handlePreviousStep called but currentStep is not 2:', currentStep);
    }
    
    // Explicitly return false to prevent any default behavior
    return false;
  };

  const handleFinishStep1 = async () => {
    const isValid = validateStep1();
    if (!isValid) {
      setSubmitStatus({
        type: 'error',
        message: 'Vous devez fournir soit (RC/autres + NIF/N° articles) soit (Carte Fellah uniquement).',
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

      // Debug: Log what we're sending
      console.log('📤 Submitting required documents (step 1) with fields:');
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
      
      console.log('IdentityVerification - User data after upload (step 1):', updatedUser);
      console.log('IdentityVerification - isHasIdentity status:', updatedUser?.isHasIdentity);
      
      // Set flags to indicate documents have been submitted in this session
      localStorage.setItem('identityJustSubmitted', 'true');
      sessionStorage.setItem('identityMessageShown', 'true');
      
      setSubmitStatus({
        type: 'success',
        message: 'Documents soumis avec succès! Redirection vers les plans d\'abonnement...',
      });
      enqueueSnackbar('Documents soumis avec succès', { variant: 'success' });
      
      // Add a small delay to ensure state updates are processed
      setTimeout(() => {
        // Navigate to subscription plans
        navigate('/subscription-plans');
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error submitting identity documents (step 1):', error);
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
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage,
      });
      enqueueSnackbar(errorMessage, { variant: 'error' });
      
      setIsSubmitting(false);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    // Only submit from step 2, step 1 validation is handled in handleNextStep
    if (currentStep !== 2) {
      return;
    }

    // Validate required fields: Either (RC + NIF) OR (Carte Fellah only)
    const hasRcAndNif = registreCommerceCarteAuto.length > 0 && nifRequired.length > 0;
    const hasCarteFellah = carteFellah.length > 0;
    
    if (!hasRcAndNif && !hasCarteFellah) {
      setSubmitStatus({
        type: 'error',
        message: 'Vous devez fournir soit (RC/autres + NIF/N° articles) soit (Carte Fellah uniquement).',
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
        // Navigate to subscription plans
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
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // If we're on step 2, go back to step 1 instead of OTP
              if (currentStep === 2) {
                console.log('IdentityVerification - Header back button clicked in step 2, going to step 1');
                setCurrentStep(1);
                setSubmitStatus({ type: null, message: '' });
              } else {
                // Only navigate to OTP if we're on step 1
                console.log('IdentityVerification - Header back button clicked in step 1, going to OTP');
                navigate('/otp-verification', { state: { user, phone: user?.phone } });
              }
            }}
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
            ← Retour
          </Button>
        </HeaderSection>

        {/* Progress Stepper */}
        <ProgressStepper activeStep={currentStep - 1} alternativeLabel>
          <Step>
            <StepLabel>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: currentStep >= 1 ? 'primary.main' : 'text.secondary', fontSize: '0.9rem' }}>
                  Étape 1
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  Documents obligatoires
                </Typography>
              </Box>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: currentStep >= 2 ? 'primary.main' : 'text.secondary', fontSize: '0.9rem' }}>
                  Étape 2
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  Documents optionnels
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
                  Choix d'abonnement
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

        {currentStep === 1 && (
          <SectionContainer>
            <SectionTitle variant="h6">
              Documents obligatoires à fournir
            </SectionTitle>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
              Vous devez fournir soit <strong>(RC/autres + NIF/N° articles)</strong> soit <strong>(Carte Fellah uniquement)</strong>. 
              Les autres documents sont optionnels mais peuvent accélérer votre processus de vérification.
            </Typography>
          </SectionContainer>
        )}

        {currentStep === 2 && (
          <OptionalSectionContainer>
            <SectionTitle variant="h6">
              Documents optionnels
            </SectionTitle>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
              Ces documents ne sont pas obligatoires mais peuvent accélérer votre processus de vérification.
            </Typography>
          </OptionalSectionContainer>
        )}

        <Grid container spacing={4}>
          {/* STEP 1: REQUIRED FIELDS */}
          {currentStep === 1 && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <RequiredGlassCard>
                  <RequiredCompactCardHeader 
                    title="RC/autres (OBLIGATOIRE)" 
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
                    title="NIF/N° articles (OBLIGATOIRE)" 
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
                      Document obligatoire: Numéro d'identification fiscale (NIF) ou Numéro d'articles.
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
            </>
          )}

          {/* STEP 2: OPTIONAL FIELDS */}
          {currentStep === 2 && (
            <>
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
            </>
          )}
        </Grid>

        <ActionContainer>
          <Stack direction="row" spacing={3} justifyContent="space-between">
            <Box>
              {currentStep === 2 && (
                <ActionButton 
                  variant="outlined" 
                  color="primary"
                  onClick={(e) => {
                    console.log('IdentityVerification - Précédent button clicked in step 2');
                    e.preventDefault();
                    e.stopPropagation();
                    // Ensure we're on step 2 before proceeding
                    if (currentStep === 2) {
                      // Directly change step without navigation
                      console.log('IdentityVerification - Changing step from 2 to 1 directly');
                      setCurrentStep(1);
                      setSubmitStatus({ type: null, message: '' });
                    }
                  }}
                  type="button"
                  startIcon={<Iconify icon="eva:arrow-back-fill" />}
                  sx={{ 
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    backgroundColor: alpha('#1976d2', 0.05),
                    zIndex: 10,
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: alpha('#1976d2', 0.12),
                      borderColor: 'primary.dark',
                    }
                  }}
                >
                  Précédent (Documents obligatoires)
                </ActionButton>
              )}
            </Box>
            
            <Stack direction="row" spacing={3}>
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
              
              {currentStep === 1 ? (
                <>
                  <ActionButton 
                    variant="contained" 
                    onClick={handleFinishStep1}
                    disabled={isSubmitting}
                    startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                    sx={{
                      background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        color: 'rgba(0, 0, 0, 0.26)',
                      }
                    }}
                  >
                    {isSubmitting ? 'Soumission en cours...' : 'Terminer'}
                  </ActionButton>
                  <ActionButton 
                    variant="contained" 
                    onClick={handleNextStep}
                    endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                    sx={{
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      }
                    }}
                  >
                    Suivant
                  </ActionButton>
                </>
              ) : (
                <ActionLoadingButton 
                  variant="contained" 
                  onClick={handleSubmit} 
                  loading={isSubmitting}
                  startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                    }
                  }}
                >
                  Terminer
                </ActionLoadingButton>
              )}
            </Stack>
          </Stack>
        </ActionContainer>
      </Container>
    </Page>
  );
}