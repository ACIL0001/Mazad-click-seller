import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Grid, Card, CardContent, Button,
  Divider, CircularProgress, Alert, Chip, List, ListItem, ListItemIcon, ListItemText, CardActions,
  Fade, Slide, useTheme, alpha, IconButton, Stack, Dialog, DialogContent, DialogActions
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DiamondIcon from '@mui/icons-material/Diamond';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import SpeedIcon from '@mui/icons-material/Speed';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import GavelIcon from '@mui/icons-material/Gavel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DescriptionIcon from '@mui/icons-material/Description';
import { SubscriptionAPI, SubscriptionPlan } from '../api/subscription';
import { authStore } from '../contexts/authStore';

// Real API is imported from '../api/subscription'

// Page wrapper component
const Page = ({ children, title }) => {
  useEffect(() => {
    document.title = title || "Plans d'abonnement";
  }, [title]);
  return <Box>{children}</Box>;
};

// Animations
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(3deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const bounceIn = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeInUp = keyframes`
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const checkmarkDraw = keyframes`
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
`;

const ripple = keyframes`
  0% { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
`;

// Background subscription icons animation
const subscriptionFloat = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.1; }
  25% { transform: translateY(-10px) translateX(5px) rotate(2deg); opacity: 0.2; }
  50% { transform: translateY(-15px) translateX(-3px) rotate(-1deg); opacity: 0.15; }
  75% { transform: translateY(-8px) translateX(4px) rotate(1deg); opacity: 0.25; }
`;

// Modern styled components with subscription-themed background
const MainContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #f8faff 0%, #e3f2fd 25%, #ffffff 50%, #f0f7ff 75%, #e8f4fd 100%),
    radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(25, 118, 210, 0.06) 0%, transparent 50%)
  `,
  backgroundSize: '400% 400%, 800px 800px, 600px 600px',
  animation: `${gradientShift} 25s ease infinite`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 90% 80%, rgba(147, 197, 253, 0.03) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  }
}));

// Subscription background icons
const SubscriptionIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  color: '#1976d2',
  opacity: 0.1,
  animation: `${subscriptionFloat} 8s ease-in-out infinite`,
  pointerEvents: 'none',
  zIndex: 0,
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  textAlign: 'center',
  padding: theme.spacing(6, 0, 4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-30%',
    left: '50%',
    width: '120%',
    height: '160%',
    background: `
      conic-gradient(from 45deg at 50% 50%, 
        rgba(59, 130, 246, 0.08) 0deg, 
        rgba(147, 197, 253, 0.04) 90deg, 
        rgba(219, 234, 254, 0.06) 180deg, 
        rgba(59, 130, 246, 0.05) 270deg, 
        rgba(59, 130, 246, 0.08) 360deg)
    `,
    transform: 'translateX(-50%)',
    borderRadius: '50%',
    zIndex: -1,
    animation: `${floatAnimation} 25s ease-in-out infinite`,
  }
}));

const TitleGradient = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    #1565c0 0%, 
    #1976d2 25%, 
    #2196f3 50%, 
    #42a5f5 75%, 
    #64b5f6 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundSize: '200% 200%',
  animation: `${gradientShift} 6s ease infinite`,
  fontWeight: 800,
  letterSpacing: '-0.02em',
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: `linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 197, 253, 0.15))`,
  animation: `${pulseAnimation} 5s ease-in-out infinite`,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(59, 130, 246, 0.08)',
}));

const PlanCard = styled(Card)<{ selected?: boolean; popular?: boolean }>(({ theme, selected, popular }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: 24,
  border: 'none',
  background: selected 
    ? `linear-gradient(145deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(240, 247, 255, 0.98) 50%, 
        rgba(227, 242, 253, 0.95) 100%)`
    : `linear-gradient(145deg, 
        rgba(255, 255, 255, 0.9) 0%, 
        rgba(248, 250, 252, 0.95) 100%)`,
  backdropFilter: 'blur(20px)',
  boxShadow: selected
    ? `
        0 24px 48px -8px rgba(59, 130, 246, 0.2),
        0 0 0 2px rgba(59, 130, 246, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9)
      `
    : `
        0 12px 24px -6px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(59, 130, 246, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.7)
      `,
  transform: selected ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)',
  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:hover': {
    transform: selected ? 'translateY(-12px) scale(1.03)' : 'translateY(-6px) scale(1.01)',
    boxShadow: selected
      ? `
          0 32px 64px -8px rgba(59, 130, 246, 0.25),
          0 0 0 2px rgba(59, 130, 246, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 1)
        `
      : `
          0 16px 32px -6px rgba(59, 130, 246, 0.1),
          0 0 0 1px rgba(59, 130, 246, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
  },
  '&::before': popular ? {
    content: '"⭐ POPULAIRE"',
    position: 'absolute',
    top: 20,
    right: -35,
    background: `linear-gradient(135deg, #1565c0, #1976d2)`,
    color: 'white',
    padding: '6px 40px',
    fontSize: '0.7rem',
    fontWeight: 700,
    transform: 'rotate(45deg)',
    zIndex: 2,
    boxShadow: '0 6px 12px rgba(21, 101, 192, 0.25)',
    letterSpacing: '0.3px',
  } : {},
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: selected 
      ? `linear-gradient(90deg, #1565c0, #1976d2, #2196f3)` 
      : `linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(147, 197, 253, 0.4))`,
    borderRadius: '24px 24px 0 0',
  }
}));

const PlanIcon = styled(Box)(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `
    linear-gradient(135deg, 
      rgba(59, 130, 246, 0.08) 0%, 
      rgba(147, 197, 253, 0.15) 50%, 
      rgba(219, 234, 254, 0.2) 100%)
  `,
  border: `2px solid rgba(59, 130, 246, 0.1)`,
  marginBottom: theme.spacing(2),
  position: 'relative',
  backdropFilter: 'blur(8px)',
}));

const FeatureItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 0),
  borderRadius: 12,
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    padding: theme.spacing(0.5, 1.5),
    transform: 'translateX(6px)',
  },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(1.2, 2.5),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const PrimaryButton = styled(ModernButton)(({ theme }) => ({
  background: `linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #2196f3 100%)`,
  color: 'white',
  boxShadow: `
    0 10px 20px rgba(21, 101, 192, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15)
  `,
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: `
      0 12px 24px rgba(21, 101, 192, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2)
    `,
  },
}));

// Success Dialog Styles - Modern & Well-Spaced
const SuccessDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiBackdrop-root': {
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%)',
    backdropFilter: 'blur(12px)',
  },
  '& .MuiDialog-paper': {
    borderRadius: 28,
    padding: 0,
    maxWidth: 560,
    width: '90%',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.24), 0 0 100px rgba(76, 175, 80, 0.2)',
    position: 'relative',
  }
}));

const SuccessHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(5, 3, 4),
  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 50%, #81c784 100%)',
  overflow: 'hidden',
  textAlign: 'center',
  minHeight: '240px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-60%',
    right: '-15%',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
    animation: `${ripple} 4s ease-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-40%',
    left: '-15%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
    animation: `${ripple} 4s ease-out 1.5s infinite`,
  }
}));

const SuccessIconWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 96,
  height: 96,
  margin: '0 auto',
  marginBottom: theme.spacing(2.5),
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150%',
    height: '150%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%)',
    animation: `${ripple} 3s ease-out infinite`,
  },
}));

const SuccessIcon = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  width: 96,
  height: 96,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2), inset 0 2px 8px rgba(255, 255, 255, 0.9)',
  animation: `${bounceIn} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
  border: '4px solid rgba(255, 255, 255, 0.3)',
  '& svg': {
    fontSize: 56,
    color: '#4caf50',
    filter: 'drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3))',
  }
}));

const CelebrationIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  fontSize: '2.5rem',
  animation: `${floatAnimation} 3s ease-in-out infinite`,
  opacity: 0.85,
  zIndex: 1,
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
}));

const getPlanIcon = (planRole: string) => {
  const iconProps = { sx: { fontSize: 36, color: '#1976d2' } };
  
  if (planRole === 'PROFESSIONAL') {
    return <WorkspacePremiumIcon {...iconProps} />;
  }
  if (planRole === 'RESELLER') {
    return <StoreIcon {...iconProps} />;
  }
  return <DiamondIcon {...iconProps} />;
};

// Smart icon matching function
const getBenefitIcon = (benefitText: string) => {
  const text = benefitText.toLowerCase();
  const iconProps = { sx: { fontSize: 18 } };
  
  // Support & Service
  if (text.includes('support') || text.includes('assistance') || text.includes('aide') || text.includes('service client')) {
    return <SupportAgentIcon {...iconProps} />;
  }
  
  // Priority & Speed
  if (text.includes('prioritaire') || text.includes('priority') || text.includes('rapide') || text.includes('fast') || text.includes('instant')) {
    return <FlashOnIcon {...iconProps} />;
  }
  
  // Unlimited & Infinite
  if (text.includes('illimité') || text.includes('unlimited') || text.includes('infini') || text.includes('infinite')) {
    return <AllInclusiveIcon {...iconProps} />;
  }
  
  // Listings & Products
  if (text.includes('listing') || text.includes('annonce') || text.includes('produit') || text.includes('product')) {
    return <ListAltIcon {...iconProps} />;
  }
  
  // Analytics & Statistics & Reports
  if (text.includes('analytics') || text.includes('analyse') || text.includes('statistique') || text.includes('rapport') || text.includes('report') || text.includes('données') || text.includes('data')) {
    return <AnalyticsIcon {...iconProps} />;
  }
  
  // Charts & Market
  if (text.includes('marché') || text.includes('market') || text.includes('chart') || text.includes('graphique')) {
    return <BarChartIcon {...iconProps} />;
  }
  
  // Search & Discovery
  if (text.includes('recherche') || text.includes('search') || text.includes('trouver') || text.includes('find') || text.includes('découvrir')) {
    return <SearchIcon {...iconProps} />;
  }
  
  // Network & Professional & Community
  if (text.includes('réseau') || text.includes('network') || text.includes('professionnel') || text.includes('professional') || text.includes('communauté') || text.includes('community')) {
    return <GroupIcon {...iconProps} />;
  }
  
  // Auction & Bidding
  if (text.includes('enchère') || text.includes('auction') || text.includes('bid') || text.includes('offre')) {
    return <GavelIcon {...iconProps} />;
  }
  
  // Exclusive & Premium & VIP
  if (text.includes('exclusif') || text.includes('exclusive') || text.includes('premium') || text.includes('vip') || text.includes('privilège')) {
    return <EmojiEventsIcon {...iconProps} />;
  }
  
  // Access & Unlock
  if (text.includes('accès') || text.includes('access') || text.includes('débloque') || text.includes('unlock')) {
    return <LockOpenIcon {...iconProps} />;
  }
  
  // Security & Verified & Trust
  if (text.includes('sécurit') || text.includes('security') || text.includes('vérifié') || text.includes('verified') || text.includes('confiance') || text.includes('trust')) {
    return <VerifiedIcon {...iconProps} />;
  }
  
  // Tools & Features
  if (text.includes('outil') || text.includes('tool') || text.includes('fonctionnalit') || text.includes('feature') || text.includes('avancé') || text.includes('advanced')) {
    return <AutoAwesomeIcon {...iconProps} />;
  }
  
  // Profit & Revenue & Money
  if (text.includes('profit') || text.includes('revenu') || text.includes('revenue') || text.includes('gain') || text.includes('monétis')) {
    return <AttachMoneyIcon {...iconProps} />;
  }
  
  // Resale & Reseller
  if (text.includes('revente') || text.includes('resale') || text.includes('revendeur') || text.includes('reseller')) {
    return <StoreIcon {...iconProps} />;
  }
  
  // Inventory & Stock
  if (text.includes('inventaire') || text.includes('inventory') || text.includes('stock')) {
    return <InventoryIcon {...iconProps} />;
  }
  
  // Notifications & Alerts
  if (text.includes('notification') || text.includes('alerte') || text.includes('alert') || text.includes('avis')) {
    return <NotificationsActiveIcon {...iconProps} />;
  }
  
  // Visibility & Featured & Promotion
  if (text.includes('visibilité') || text.includes('visibility') || text.includes('mis en avant') || text.includes('featured') || text.includes('promotion')) {
    return <VisibilityIcon {...iconProps} />;
  }
  
  // Discount & Offer & Deal
  if (text.includes('réduction') || text.includes('discount') || text.includes('offre spéciale') || text.includes('deal') || text.includes('promo')) {
    return <LocalOfferIcon {...iconProps} />;
  }
  
  // Shipping & Delivery & Logistics
  if (text.includes('livraison') || text.includes('shipping') || text.includes('delivery') || text.includes('logistique') || text.includes('transport')) {
    return <LocalShippingIcon {...iconProps} />;
  }
  
  // Business & Company & Enterprise
  if (text.includes('entreprise') || text.includes('business') || text.includes('company') || text.includes('société')) {
    return <BusinessIcon {...iconProps} />;
  }
  
  // Performance & Speed Metrics
  if (text.includes('performance') || text.includes('vitesse') || text.includes('speed') || text.includes('rapidité')) {
    return <SpeedIcon {...iconProps} />;
  }
  
  // Assessment & Evaluation
  if (text.includes('évaluation') || text.includes('assessment') || text.includes('analyse de profitabilité')) {
    return <AssessmentIcon {...iconProps} />;
  }
  
  // Documents & Reports & Files
  if (text.includes('document') || text.includes('fichier') || text.includes('file') || text.includes('certificat')) {
    return <DescriptionIcon {...iconProps} />;
  }
  
  // Premium & Quality
  if (text.includes('premium') || text.includes('qualité') || text.includes('quality') || text.includes('excellence')) {
    return <WorkspacePremiumIcon {...iconProps} />;
  }
  
  // Growth & Trending
  if (text.includes('croissance') || text.includes('growth') || text.includes('développement') || text.includes('development') || text.includes('augment')) {
    return <TrendingUpIcon {...iconProps} />;
  }
  
  // Default: checkmark for anything else
  return <CheckCircleOutlineIcon {...iconProps} />;
};

const SubscriptionPlans = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [userRole, setUserRole] = useState<string>('PROFESSIONAL');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        
        // Get user role from auth store
        const { auth } = authStore.getState();
        const currentUserRole = auth?.user?.type || 'PROFESSIONAL';
        setUserRole(currentUserRole);
        
        console.log('🔍 Fetching subscription plans for role:', currentUserRole);
        
        // Fetch plans from real API
        const response = await SubscriptionAPI.getPlansByRole(currentUserRole);
        console.log('📦 API Response:', response);
        
        // Handle different response formats
        let plansData = [];
        if (response.success && response.plans) {
          plansData = response.plans;
          console.log('📋 Using response.plans from success response');
        } else if (Array.isArray(response)) {
          plansData = response;
          console.log('📋 Using direct array response');
        } else if (response.plans) {
          plansData = response.plans;
          console.log('📋 Using response.plans from non-success response');
        } else {
          console.warn('⚠️ Unexpected response format:', response);
        }
        
        // Filter active plans
        const activePlans = plansData.filter(plan => plan.isActive !== false);
        console.log('✅ Active plans:', activePlans);
        
        setPlans(activePlans);
        if (activePlans.length > 0) {
          setSelectedPlan(activePlans[0]);
        }
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching subscription plans:', err);
        setError('Impossible de charger les plans d\'abonnement. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleProceedToPayment = () => {
    if (!selectedPlan) {
      setError('Veuillez sélectionner un plan avant de continuer.');
      return;
    }
    
    // Show success dialog instead of navigating to payment
    setShowSuccessDialog(true);
    setProcessingPayment(false);
  };

  // Countdown and redirect effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccessDialog && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (showSuccessDialog && countdown === 0) {
      navigate('/waiting-for-verification', { replace: true });
    }
    return () => clearTimeout(timer);
  }, [showSuccessDialog, countdown, navigate]);

  const PlanFeatureList = ({ plan }: { plan: SubscriptionPlan }) => {
    // Use benefits from API if available, otherwise fall back to default features
    let features = [];
    
    if (plan.benefits && plan.benefits.length > 0) {
      // Display benefits from the API with smart icon matching
      features = plan.benefits.map(benefit => ({
        text: benefit,
        icon: getBenefitIcon(benefit)
      }));
    } else {
      // Fallback to default features if no benefits provided (with smart icons)
      if (plan.role === 'PROFESSIONAL') {
        features = [
          { text: 'Accès à un réseau de professionnels', icon: getBenefitIcon('Accès à un réseau de professionnels') },
          { text: 'Fonctionnalités avancées de recherche', icon: getBenefitIcon('Fonctionnalités avancées de recherche') },
          { text: 'Statistiques de marché', icon: getBenefitIcon('Statistiques de marché') },
          { text: 'Support technique prioritaire', icon: getBenefitIcon('Support technique prioritaire') }
        ];
      } else if (plan.role === 'RESELLER') {
        features = [
          { text: 'Outils avancés de revente', icon: getBenefitIcon('Outils avancés de revente') },
          { text: 'Accès aux listes d\'enchères exclusives', icon: getBenefitIcon('Accès aux listes d\'enchères exclusives') },
          { text: 'Rapports d\'analyse de profitabilité', icon: getBenefitIcon('Rapports d\'analyse de profitabilité') },
          { text: 'Support dédié aux revendeurs', icon: getBenefitIcon('Support dédié aux revendeurs') }
        ];
      }
    }

    return (
      <List dense sx={{ mt: 2 }}>
        {features.map((feature, index) => (
          <FeatureItem key={index} disableGutters>
            <ListItemIcon sx={{ 
              minWidth: 32, 
              color: '#1976d2',
              '& .MuiSvgIcon-root': {
                filter: 'drop-shadow(0 1px 2px rgba(25, 118, 210, 0.15))'
              }
            }}>
              {feature.icon}
            </ListItemIcon>
            <ListItemText 
              primary={feature.text} 
              primaryTypographyProps={{ 
                fontSize: '0.9rem', 
                fontWeight: 500,
                color: 'text.primary'
              }} 
            />
          </FeatureItem>
        ))}
      </List>
    );
  };

  if (loading) {
    return (
      <MainContainer>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 3
        }}>
          <Box sx={{ position: 'relative' }}>
            <CircularProgress 
              size={56} 
              thickness={3} 
              sx={{ 
                color: '#1976d2',
                filter: 'drop-shadow(0 3px 6px rgba(25, 118, 210, 0.2))'
              }} 
            />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 24, color: '#1976d2', animation: `${pulseAnimation} 2s infinite` }} />
            </Box>
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              background: `linear-gradient(135deg, #1565c0, #1976d2, #2196f3)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600
            }}
          >
            Chargement de vos plans...
          </Typography>
        </Box>
      </MainContainer>
    );
  }

  if (error) {
    return (
      <MainContainer>
        <Container maxWidth="md" sx={{ pt: 8 }}>
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: 3,
                fontSize: '1rem',
                py: 2.5,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(244, 67, 54, 0.15)'
              }}
            >
              {error}
            </Alert>
          </Fade>
        </Container>
      </MainContainer>
    );
  }

  if (!loading && plans.length === 0) {
    return (
      <MainContainer>
        <Container maxWidth="md" sx={{ pt: 8 }}>
          <Fade in>
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 3,
                fontSize: '1rem',
                py: 2.5,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(33, 150, 243, 0.15)'
              }}
            >
              Aucun plan d'abonnement disponible pour votre rôle ({userRole}). Veuillez contacter le support.
            </Alert>
          </Fade>
        </Container>
      </MainContainer>
    );
  }

  return (
    <Page title="Plans d'Abonnement Premium">
      <MainContainer>
        {/* Subscription-themed floating background icons */}
        <SubscriptionIcon sx={{ top: '8%', left: '4%', animationDelay: '0s' }}>
          <CreditCardIcon sx={{ fontSize: 40 }} />
        </SubscriptionIcon>
        <SubscriptionIcon sx={{ top: '15%', right: '6%', animationDelay: '2s' }}>
          <WorkspacePremiumIcon sx={{ fontSize: 35 }} />
        </SubscriptionIcon>
        <SubscriptionIcon sx={{ top: '60%', left: '2%', animationDelay: '4s' }}>
          <ShoppingCartIcon sx={{ fontSize: 32 }} />
        </SubscriptionIcon>
        <SubscriptionIcon sx={{ top: '45%', right: '3%', animationDelay: '1s' }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 38 }} />
        </SubscriptionIcon>
        <SubscriptionIcon sx={{ top: '75%', left: '8%', animationDelay: '3s' }}>
          <VerifiedIcon sx={{ fontSize: 30 }} />
        </SubscriptionIcon>
        <SubscriptionIcon sx={{ bottom: '10%', right: '7%', animationDelay: '5s' }}>
          <StarIcon sx={{ fontSize: 34 }} />
        </SubscriptionIcon>

        {/* Small floating elements */}
        <FloatingElement sx={{ top: '12%', left: '8%', width: 80, height: 80, animationDelay: '0s' }} />
        <FloatingElement sx={{ top: '25%', right: '10%', width: 60, height: 60, animationDelay: '1.5s' }} />
        <FloatingElement sx={{ bottom: '20%', left: '5%', width: 70, height: 70, animationDelay: '3s' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <HeroSection>
            <Fade in timeout={800}>
              <Box>
                <TitleGradient 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    lineHeight: 0.9,
                    mb: 2,
                    textShadow: '0 3px 15px rgba(25, 118, 210, 0.15)'
                  }}
                >
                  Plans Abonnement
                </TitleGradient>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#424242',
                    fontWeight: 300,
                    fontSize: { xs: '1.1rem', md: '1.4rem' },
                    mb: 1,
                    opacity: 0.8
                  }}
                >
                  {userRole === 'PROFESSIONAL' ? 'Solutions Professionnelles' : 'Solutions Revendeurs'}
                </Typography>

                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#666',
                    fontWeight: 400,
                    maxWidth: '500px',
                    mx: 'auto',
                    lineHeight: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  Choisissez le plan qui correspond à vos besoins et commencez dès aujourd'hui.
                </Typography>
              </Box>
            </Fade>
          </HeroSection>

          <Container maxWidth="md" sx={{ pb: 6 }}>
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
              {plans.map((plan, index) => (
                <Grid item xs={12} sm={6} md={4} key={plan.id || index}>
                  <Slide in timeout={600 + index * 150} direction="up">
                    <PlanCard
                      selected={selectedPlan?.id === plan.id}
                      popular={index === 1}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3, textAlign: 'center' }}>
                        <PlanIcon>
                          {getPlanIcon(plan.role)}
                        </PlanIcon>
                        
                        <Typography 
                          variant="h4" 
                          component="h2" 
                          sx={{ 
                            fontWeight: 700,
                            mb: 1.5,
                            fontSize: '1.5rem',
                            background: `linear-gradient(135deg, #1565c0, #1976d2)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {plan.name}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              fontWeight: 800,
                              fontSize: '2rem',
                              lineHeight: 1,
                              background: `linear-gradient(135deg, #1565c0, #2196f3)`,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              textShadow: '0 2px 10px rgba(25, 118, 210, 0.1)'
                            }}
                          >
                            {plan.price.toLocaleString('fr-DZ')}
                            <Typography 
                              component="span" 
                              variant="h6" 
                              sx={{ 
                                ml: 0.5, 
                                color: '#666',
                                fontWeight: 400,
                                fontSize: '1rem'
                              }}
                            >
                              DZD
                            </Typography>
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#666',
                            fontSize: '0.9rem',
                            lineHeight: 1.4,
                            mb: 2,
                            px: 0.5
                          }}
                        >
                          {plan.description}
                        </Typography>
                        
                        <Divider 
                          sx={{ 
                            my: 2, 
                            background: `linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.2), transparent)`,
                            height: 1.5,
                            border: 'none'
                          }} 
                        />
                        
                        <PlanFeatureList plan={plan} />
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'center', p: 3, pt: 0 }}>
                        {selectedPlan?.id === plan.id ? (
                          <PrimaryButton
                            fullWidth
                            size="medium"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => setSelectedPlan(plan)}
                          >
                            Plan Sélectionné
                          </PrimaryButton>
                        ) : (
                          <ModernButton
                            variant="outlined"
                            fullWidth
                            size="medium"
                            onClick={() => setSelectedPlan(plan)}
                            sx={{
                              borderColor: '#1976d2',
                              color: '#1976d2',
                              borderWidth: 1.5,
                              '&:hover': {
                                borderColor: '#1565c0',
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                transform: 'translateY(-1px)',
                              }
                            }}
                          >
                            Choisir ce Plan
                          </ModernButton>
                        )}
                      </CardActions>
                    </PlanCard>
                  </Slide>
                </Grid>
              ))}
            </Grid>

            {selectedPlan && (
              <Slide in timeout={800} direction="up">
                <Box sx={{ mt: 5 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      p: 4,
                      maxWidth: '600px',
                      mx: 'auto'
                    }}
                  >
                    {/* Simple Header */}
                    <Box textAlign="center" mb={4}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#333',
                          mb: 1
                        }}
                      >
                        Résumé de commande
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vérifiez votre sélection avant de continuer
                      </Typography>
                    </Box>
                    
                    {/* Plan Summary */}
                    <Box 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2, 
                        background: '#f8f9fa',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        mb: 3
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {selectedPlan.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedPlan.description}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              fontWeight: 700,
                              color: '#1976d2'
                            }}
                          >
                            {selectedPlan.price.toLocaleString('fr-DZ')} DZD
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    
                    {/* Payment Button */}
                    <LoadingButton
                      onClick={handleProceedToPayment}
                      loading={processingPayment}
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        py: 2,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        background: '#1976d2',
                        '&:hover': {
                          background: '#1565c0',
                        },
                      }}
                    >
                      {processingPayment ? 'Traitement...' : 'Continuer vers le paiement'}
                    </LoadingButton>

                    {/* Simple Trust Line */}
                    <Box sx={{ 
                      mt: 3, 
                      pt: 2, 
                      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" color="text.secondary">
                        Paiement sécurisé • Support 24/7 • Activation immédiate
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Slide>
            )}
          </Container>
        </Container>

        {/* Success Dialog - Redesigned */}
        <SuccessDialog
          open={showSuccessDialog}
          onClose={() => {}}
          disableEscapeKeyDown
          aria-labelledby="success-dialog-title"
        >
          {/* Green Header with Success Icon */}
          <SuccessHeader>
            {/* Floating Celebration Emojis */}
            <CelebrationIcon sx={{ top: '15%', left: '10%', animationDelay: '0s' }}>
              🎉
            </CelebrationIcon>
            <CelebrationIcon sx={{ top: '25%', right: '12%', animationDelay: '0.5s' }}>
              ✨
            </CelebrationIcon>
            <CelebrationIcon sx={{ bottom: '20%', left: '15%', animationDelay: '1s' }}>
              🎊
            </CelebrationIcon>
            <CelebrationIcon sx={{ bottom: '15%', right: '8%', animationDelay: '1.5s' }}>
              🌟
            </CelebrationIcon>

            {/* Success Icon */}
            <SuccessIconWrapper>
              <SuccessIcon>
                <CheckCircleOutlineIcon />
              </SuccessIcon>
            </SuccessIconWrapper>

            {/* Title - Felicitations */}
            <Typography 
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#ffffff',
                textAlign: 'center',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.15)',
                letterSpacing: '-0.5px',
                position: 'relative',
                zIndex: 2,
                animation: `${fadeInUp} 0.6s ease-out 0.2s both`,
                mb: 2
              }}
            >
              Félicitations ! 🎉
            </Typography>

            {/* Subtitle */}
            <Typography 
              sx={{ 
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                color: 'rgba(255, 255, 255, 0.95)',
                textAlign: 'center',
                fontWeight: 400,
                position: 'relative',
                zIndex: 2,
                animation: `${fadeInUp} 0.6s ease-out 0.3s both`,
                lineHeight: 1.6,
                px: { xs: 2, sm: 3, md: 4 },
                maxWidth: '100%',
                wordWrap: 'break-word'
              }}
            >
              Vous êtes à quelques heures seulement de devenir un membre professionnel MazadClick
            </Typography>
          </SuccessHeader>

          {/* White Content Area - Better Spacing */}
          <DialogContent sx={{ p: 5 }}>
            {/* Plan Selected Badge */}
            <Box 
              sx={{ 
                textAlign: 'center',
                mb: 4,
                animation: `${fadeInUp} 0.6s ease-out 0.4s both`
              }}
            >
              <Chip
                icon={<DiamondIcon />}
                label={`Plan ${selectedPlan?.name}`}
                sx={{
                  px: 3,
                  py: 3,
                  height: 'auto',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  border: 'none',
                  color: '#1565c0',
                  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)',
                  '& .MuiChip-icon': {
                    fontSize: '1.3rem',
                    color: '#1976d2',
                  },
                  '& .MuiChip-label': {
                    px: 1.5,
                  }
                }}
              />
            </Box>

            {/* Verification Notice - Well Spaced */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                p: 3,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                border: 'none',
                mb: 4,
                boxShadow: '0 4px 16px rgba(255, 152, 0, 0.12)',
                animation: `${fadeInUp} 0.6s ease-out 0.5s both`
              }}
            >
              <Box 
                sx={{ 
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 8px 20px rgba(255, 152, 0, 0.3)',
                }}
              >
                <AccessTimeIcon sx={{ color: '#fff', fontSize: 32 }} />
              </Box>
              <Box flex={1}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#e65100', mb: 0.5 }}>
                  Vérification en cours
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
                  Vos documents seront vérifiés sous <strong>24 à 48 heures</strong>
                </Typography>
              </Box>
            </Box>

            {/* Countdown Badge - Better Spacing */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                p: 3,
                borderRadius: 4,
                background: countdown <= 3 
                  ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)'
                  : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: 'none',
                mb: 4,
                boxShadow: countdown <= 3 
                  ? '0 4px 16px rgba(244, 67, 54, 0.15)'
                  : '0 4px 16px rgba(33, 150, 243, 0.15)',
                animation: `${fadeInUp} 0.6s ease-out 0.6s both`
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1rem' }}>
                Redirection dans
              </Typography>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: countdown <= 3 
                    ? 'linear-gradient(135deg, #f44336 0%, #e57373 100%)'
                    : 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  color: '#fff',
                  boxShadow: countdown <= 3 
                    ? '0 6px 20px rgba(244, 67, 54, 0.4)'
                    : '0 6px 20px rgba(25, 118, 210, 0.4)',
                  animation: countdown <= 3 ? `${pulseAnimation} 0.6s ease-in-out infinite` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {countdown}
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1rem' }}>
                {countdown === 1 ? 'seconde' : 'secondes'}
              </Typography>
            </Box>

            {/* Action Button - Well Spaced */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate('/waiting-for-verification', { replace: true })}
              startIcon={<VerifiedIcon />}
              sx={{
                py: 2.5,
                borderRadius: 4,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)',
                animation: `${fadeInUp} 0.6s ease-out 0.7s both`,
                '&:hover': {
                  background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)',
                  boxShadow: '0 12px 32px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-3px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Voir mon statut de vérification
            </Button>

            {/* Footer Note - Better Spacing */}
            <Typography 
              variant="body2" 
              sx={{ 
                display: 'block',
                textAlign: 'center',
                color: 'text.secondary',
                mt: 3,
                fontSize: '0.9rem',
                animation: `${fadeInUp} 0.6s ease-out 0.8s both`
              }}
            >
              📧 Un email de confirmation vous sera envoyé
            </Typography>
          </DialogContent>
        </SuccessDialog>
      </MainContainer>
    </Page>
  );
};

export default SubscriptionPlans;