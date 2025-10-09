import * as PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
// material
import { styled, alpha } from '@mui/material/styles';
import { 
  Box, 
  Link, 
  Button, 
  Drawer, 
  Typography, 
  Avatar, 
  Stack, 
  Fade,
  Slide,
  Chip
} from '@mui/material';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
// mock
import account from '../../_mock/account';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import Logo from '../../components/Logo';
import Scrollbar from '../../components/Scrollbar';
import NavSection from '../../components/NavSection';
import Iconify from '../../components/Iconify';
//
import useNavConfig from './NavConfig';
import app from '../../config';
import useAuth from '@/hooks/useAuth';
import AccountPopover from './AccountPopover';
// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_MOBILE = 320;
const DRAWER_WIDTH_DESKTOP = 300;

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    width: DRAWER_WIDTH,
  },
  [theme.breakpoints.up('xl')]: {
    width: DRAWER_WIDTH_DESKTOP,
  },
}));

const AccountStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    transition: 'left 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
    '&::before': {
      left: '100%',
    },
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  '& .MuiChip-label': {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

// ----------------------------------------------------------------------

DashboardSidebar.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
};

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar }: any) {
  const { pathname } = useLocation();
  const { auth, isLogged } = useAuth();
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const navConfig = useNavConfig();
  const [mounted, setMounted] = useState(false);

  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Get user account type for display
  const getUserAccountType = () => {
    if (auth?.user?.type === 'PROFESSIONAL') {
      return { label: 'PRO', color: 'success' };
    }
    return { label: 'BASIC', color: 'default' };
  };

  const accountType = getUserAccountType();

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { 
          height: 1, 
          display: 'flex', 
          flexDirection: 'column',
          background: `linear-gradient(180deg, ${alpha('#f8fafc', 0.8)} 0%, ${alpha('#f1f5f9', 0.6)} 100%)`,
        },
      }}
    >
      {/* Logo Section with Animation */}
      <Fade in={mounted} timeout={800}>
        <Box sx={{ 
          px: 2.5, 
          py: 3, 
          display: 'inline-flex',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          }
        }}>
          <Logo />
        </Box>
      </Fade>

      {/* Account Section with Enhanced Styling */}
      <Slide direction="right" in={mounted} timeout={1000}>
        <Box sx={{ mb: 5, mx: 2.5 }}>
          <Link underline="none" component={RouterLink} to="#">
            <AccountStyle className="account-style">
              <Box sx={{ position: 'relative' }}>
                {isLogged && !!auth.user?.avatar ? (
                  <Avatar 
                    src={app.route + auth.user?.avatar.filename} 
                    alt="photoURL"
                    sx={{
                      width: 48,
                      height: 48,
                      border: (theme) => `3px solid ${theme.palette.primary.main}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: (theme) => `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      border: (theme) => `3px solid ${theme.palette.primary.light}`,
                    }}
                  >
                    {auth?.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                )}
                {/* Online Status Indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    backgroundColor: '#4CAF50',
                    borderRadius: '50%',
                    border: '2px solid white',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)', opacity: 1 },
                      '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                      '100%': { transform: 'scale(1)', opacity: 1 },
                    },
                  }}
                />
              </Box>
              <Box sx={{ 
                ml: isRTL ? 0 : { xs: 1.5, sm: 2 }, 
                mr: isRTL ? { xs: 1.5, sm: 2 } : 0, 
                flexGrow: 1 
              }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}>
                    {auth?.user ? `${auth.user.firstName} ${auth.user.lastName}` : t('common.seller')}
                  </Typography>
                  <StyledChip 
                    label={accountType.label} 
                    size="small"
                    color={accountType.color as any}
                    sx={{
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      height: { xs: 20, sm: 24 }
                    }}
                  />
                </Stack>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: { xs: '120px', sm: '140px' }
                  }}
                >
                  {auth?.user?.email || t('common.notLoggedIn')}
                </Typography>
              </Box>
            </AccountStyle>
          </Link>
          {/* Mobile account button to open user menu inside the sidebar */}
          <Box sx={{ mt: 1.5, display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', width: '100%' }}>
            <AccountPopover />
          </Box>
        </Box>
      </Slide>

      {/* Navigation Section */}
      <Slide direction="up" in={mounted} timeout={1200}>
        <Box sx={{ flexGrow: 1 }}>
          <NavSection navConfig={navConfig} />
        </Box>
      </Slide>

      {/* Footer Section with Modern Design */}
      <Fade in={mounted} timeout={1500}>
        <Box sx={{ px: 2.5, pb: 3, mt: 2 }}>
          <Stack 
            alignItems="center" 
            spacing={2} 
            sx={{ 
              pt: 3, 
              pb: 2,
              borderRadius: 3, 
              position: 'relative',
              background: `linear-gradient(135deg, ${alpha('#6366f1', 0.1)} 0%, ${alpha('#8b5cf6', 0.1)} 100%)`,
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, ${alpha('#6366f1', 0.8)}, ${alpha('#8b5cf6', 0.8)})`,
              }
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography gutterBottom variant="subtitle1" sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {app.name} Dashboard
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary',
                opacity: 0.8
              }}>
                {t('common.manageBusiness')}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>
    </Scrollbar>
  );

  return (
    <RootStyle>
      {!isDesktop && (
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          anchor={isRTL ? 'right' : 'left'}
          PaperProps={{
            sx: { 
              width: { xs: DRAWER_WIDTH_MOBILE, sm: DRAWER_WIDTH },
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)`,
              backdropFilter: 'blur(20px)',
              borderRadius: { xs: 0, sm: isRTL ? '20px 0 0 20px' : '0 20px 20px 0' },
              border: 'none',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            },
          }}
          ModalProps={{
            BackdropProps: {
              sx: {
                backgroundColor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(5px)',
              }
            }
          }}
        >
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          anchor={isRTL ? 'right' : 'left'}
          PaperProps={{
            sx: {
              width: { lg: DRAWER_WIDTH, xl: DRAWER_WIDTH_DESKTOP },
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)`,
              backdropFilter: 'blur(20px)',
              borderRightStyle: isRTL ? 'none' : 'solid',
              borderLeftStyle: isRTL ? 'solid' : 'none',
              borderWidth: '1px',
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
              overflow: 'visible',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: isRTL ? 'auto' : 0,
                left: isRTL ? 0 : 'auto',
                width: '1px',
                height: '100%',
                background: `linear-gradient(180deg, transparent 0%, ${alpha('#6366f1', 0.3)} 50%, transparent 100%)`,
              }
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
}
