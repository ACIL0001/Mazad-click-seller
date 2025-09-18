import React, { useState, useEffect } from 'react';
import * as PropTypes from 'prop-types';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { 
  Card, 
  Typography, 
  Box, 
  IconButton,
  Tooltip,
  Fade,
  Grow
} from '@mui/material';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/Iconify';

// ----------------------------------------------------------------------

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  backdropFilter: 'blur(20px)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
    '&::before': {
      opacity: 1,
    },
    '& .icon-container': {
      transform: 'scale(1.1) rotate(5deg)',
    },
    '& .stat-number': {
      transform: 'scale(1.05)',
    },
  },
}));

const IconContainer = styled(Box)(({ theme, color }) => ({
  width: { xs: 60, sm: 70, md: 75, lg: 80, xl: 85 },
  height: { xs: 60, sm: 70, md: 75, lg: 80, xl: 85 },
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette[color || 'primary'].main, 0.1)} 0%, ${alpha(theme.palette[color || 'primary'].light, 0.05)} 100%)`,
  border: `2px solid ${alpha(theme.palette[color || 'primary'].main, 0.1)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: '50%',
    background: `conic-gradient(from 0deg, ${theme.palette[color || 'primary'].main}, ${theme.palette[color || 'primary'].light}, ${theme.palette[color || 'primary'].main})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
  },
  '&:hover::before': {
    opacity: 0.3,
    animation: 'rotate 2s linear infinite',
  },
  '@keyframes rotate': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
}));

const StatsNumber = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.3rem', lg: '2.5rem', xl: '2.7rem' },
  lineHeight: 1,
  background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  transition: 'all 0.3s ease',
}));

// ----------------------------------------------------------------------

ModernAppWidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  total: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  sx: PropTypes.object,
  onClick: PropTypes.func,
  delay: PropTypes.number,
};

export default function ModernAppWidgetSummary({ 
  title, 
  total, 
  icon, 
  color = 'primary', 
  trend = 'neutral',
  trendValue,
  sx = {}, 
  onClick,
  delay = 0,
  ...other 
}) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'eva:trending-up-fill';
      case 'down':
        return 'eva:trending-down-fill';
      default:
        return 'eva:minus-fill';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Grow in={mounted} timeout={600 + delay * 100}>
      <StyledCard
        sx={{
          py: { xs: 3, sm: 3.5, md: 3.5, lg: 4, xl: 4.5 },
          px: { xs: 2, sm: 2.5, md: 2.5, lg: 3, xl: 3.5 },
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          ...sx,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        {...other}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette[color].main, 0.1)} 0%, transparent 70%)`,
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'scale(1.5)' : 'scale(1)',
            transition: 'all 0.4s ease',
          }}
        />

        {/* Icon Container */}
        <IconContainer className="icon-container" color={color}>
          <Iconify 
            icon={icon} 
            width={{ xs: 28, sm: 32, md: 36, lg: 40, xl: 44 }} 
            height={{ xs: 28, sm: 32, md: 36, lg: 40, xl: 44 }} 
            sx={{ 
              color: theme.palette[color].main,
              filter: `drop-shadow(0 4px 8px ${alpha(theme.palette[color].main, 0.3)})`,
            }} 
          />
        </IconContainer>

        {/* Stats Number with Animation */}
        <Fade in={mounted} timeout={1000}>
          <StatsNumber className="stat-number" variant="h3">
            {fShortenNumber(total)}
          </StatsNumber>
        </Fade>

        {/* Title */}
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mt: 1,
            mb: 1,
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.95rem',
            textTransform: 'capitalize',
          }}
        >
          {title}
        </Typography>

        {/* Trend Indicator */}
        {trendValue && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mt: 1,
              opacity: hovered ? 1 : 0.7,
              transition: 'opacity 0.3s ease',
            }}
          >
            <Iconify 
              icon={getTrendIcon()} 
              width={16} 
              height={16} 
              sx={{ 
                color: getTrendColor(),
                mr: 0.5,
              }} 
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: getTrendColor(),
                fontWeight: 600,
              }}
            >
              {trendValue}
            </Typography>
          </Box>
        )}

        {/* Hover Effect Particles */}
        {hovered && (
          <>
            {[...Array(6)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: theme.palette[color].main,
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animation: `float${index} 2s infinite ease-in-out`,
                  animationDelay: `${index * 0.2}s`,
                  opacity: 0.6,
                  '@keyframes float0': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                  },
                  '@keyframes float1': {
                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
                    '50%': { transform: 'translateY(-8px) translateX(5px)' },
                  },
                  '@keyframes float2': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                  },
                  '@keyframes float3': {
                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
                    '50%': { transform: 'translateY(-6px) translateX(-5px)' },
                  },
                  '@keyframes float4': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-14px)' },
                  },
                  '@keyframes float5': {
                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
                    '50%': { transform: 'translateY(-9px) translateX(3px)' },
                  },
                }}
              />
            ))}
          </>
        )}
      </StyledCard>
    </Grow>
  );
}
