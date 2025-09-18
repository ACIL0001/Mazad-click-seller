import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Fade,
  Zoom,
  Paper,
  IconButton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Iconify from '../../../components/Iconify';
import useResponsive from '../../../hooks/useResponsive';

// ----------------------------------------------------------------------

const StyledContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
    ${alpha(theme.palette.background.default, 0.9)} 100%)`,
  backdropFilter: 'blur(20px)',
  padding: theme.spacing(3),
}));

const UpgradeCard = styled(Paper)(({ theme }) => ({
  maxWidth: 500,
  width: '100%',
  padding: theme.spacing(4),
  borderRadius: 24,
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#f8fafc', 0.9)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s infinite',
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
}));

const FloatingIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },
}));

const PremiumBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderRadius: 20,
  background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
  color: theme.palette.warning.contrastText,
  fontWeight: 700,
  fontSize: '0.8rem',
  marginBottom: theme.spacing(2),
  boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.4)}`,
}));

const FeatureList = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(1),
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.05),
    transform: 'translateX(8px)',
  },
}));

// ----------------------------------------------------------------------

export default function ModernUpgradePrompt() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useResponsive('down', 'sm');
  
  const [mounted, setMounted] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: 'mdi:chart-line',
      title: t('upgrade.features.analytics'),
      description: t('upgrade.features.analyticsDesc'),
    },
    {
      icon: 'mdi:shield-check',
      title: t('upgrade.features.security'),
      description: t('upgrade.features.securityDesc'),
    },
    {
      icon: 'mdi:lightning-bolt',
      title: t('upgrade.features.performance'),
      description: t('upgrade.features.performanceDesc'),
    },
    {
      icon: 'mdi:headset',
      title: t('upgrade.features.support'),
      description: t('upgrade.features.supportDesc'),
    },
  ];

  const handleUpgrade = () => {
    navigate('/dashboard/account-upgrade');
  };

  return (
    <StyledContainer>
      {/* Floating Background Icons */}
      <FloatingIcon
        sx={{
          top: '10%',
          left: '10%',
          width: 60,
          height: 60,
          animationDelay: '0s',
          opacity: 0.1,
        }}
      >
        <Iconify icon="mdi:star" width={30} height={30} />
      </FloatingIcon>
      
      <FloatingIcon
        sx={{
          top: '20%',
          right: '15%',
          width: 40,
          height: 40,
          animationDelay: '1s',
          opacity: 0.1,
        }}
      >
        <Iconify icon="mdi:diamond" width={20} height={20} />
      </FloatingIcon>
      
      <FloatingIcon
        sx={{
          bottom: '25%',
          left: '20%',
          width: 50,
          height: 50,
          animationDelay: '2s',
          opacity: 0.1,
        }}
      >
        <Iconify icon="mdi:crown" width={25} height={25} />
      </FloatingIcon>

      <Zoom in={mounted} timeout={600}>
        <UpgradeCard elevation={0}>
          {/* Premium Badge */}
          <Fade in={mounted} timeout={1000}>
            <PremiumBadge>
              <Iconify icon="mdi:crown" width={16} height={16} sx={{ mr: 1 }} />
              PROFESSIONAL PLAN
            </PremiumBadge>
          </Fade>

          {/* Main Icon */}
          <Fade in={mounted} timeout={1200}>
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -5,
                    left: -5,
                    right: -5,
                    bottom: -5,
                    borderRadius: '50%',
                    background: `conic-gradient(from 0deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                    opacity: 0.3,
                    animation: 'rotate 4s linear infinite',
                    zIndex: -1,
                  },
                  '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              >
                <Iconify 
                  icon="mdi:lock" 
                  width={60} 
                  height={60} 
                  sx={{ 
                    color: theme.palette.primary.main,
                    filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.3)})`,
                  }} 
                />
              </Box>
            </Box>
          </Fade>

          {/* Title */}
          <Fade in={mounted} timeout={1400}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                mb: 2,
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('dashboard.upgradeRequired') || 'Upgrade Required'}
            </Typography>
          </Fade>

          {/* Description */}
          <Fade in={mounted} timeout={1600}>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              {t('dashboard.upgradeDescription') || 'Unlock advanced analytics and premium features with a Professional account.'}
            </Typography>
          </Fade>

          {/* Animated Feature Showcase */}
          <Fade in={mounted} timeout={1800}>
            <Box
              sx={{
                mb: 4,
                p: 2,
                borderRadius: 2,
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                minHeight: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify 
                        icon={features[currentFeature].icon} 
                        width={20} 
                        height={20} 
                        sx={{ color: 'white' }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {features[currentFeature].title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {features[currentFeature].description}
                      </Typography>
                    </Box>
                  </Stack>
                </motion.div>
              </AnimatePresence>
            </Box>
          </Fade>

          {/* CTA Button */}
          <Fade in={mounted} timeout={2000}>
            <Button
              variant="contained"
              size="large"
              onClick={handleUpgrade}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
              }}
              startIcon={<Iconify icon="mdi:rocket-launch" width={24} height={24} />}
            >
              {t('dashboard.upgradeNow') || 'Upgrade to Professional'}
            </Button>
          </Fade>

          {/* Secondary Action */}
          <Fade in={mounted} timeout={2200}>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 2,
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
              onClick={() => navigate('/dashboard/account')}
            >
              {t('dashboard.learnMore') || 'Learn more about Professional features'}
            </Typography>
          </Fade>
        </UpgradeCard>
      </Zoom>
    </StyledContainer>
  );
}
