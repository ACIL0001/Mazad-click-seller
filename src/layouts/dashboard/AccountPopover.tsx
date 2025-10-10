import { useRef, useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// @mui
import { alpha } from '@mui/material/styles';
import { 
  Box, 
  Divider, 
  Typography, 
  Stack, 
  MenuItem, 
  Avatar, 
  IconButton, 
  Switch, 
  FormControlLabel,
  Chip,
  Badge,
  Button
} from '@mui/material';
// components
import MenuPopover from '../../components/MenuPopover';
import Iconify from '../../components/Iconify';
// ----------------------------------------------------------------------
import useAuth from '@/hooks/useAuth';
import { ACCOUNT_TYPE } from '@/types/User';
import { useLanguage } from '@/contexts/LanguageContext';
import app from '@/config';

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const { t } = useTranslation();
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const { auth, clear } = useAuth();
  const { isRTL } = useLanguage();

  const MENU_OPTIONS = [
    {
      label: t('userDropdown.home'),
      icon: '🏠',
      linkTo: '/dashboard/app',
    },
  ];

  const [open, setOpen] = useState(null);
  const [switchToBuyer, setSwitchToBuyer] = useState(false);
  const windowRef = useRef(null);

  const handleOpen = (event: any) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const logout = () => {
    clear();
    navigate('/login');
  };

  // Check if switch is active on component mount
  useEffect(() => {
    if (window.localStorage.getItem('switch')) {
      if (window.localStorage.getItem('switch') === '1') {
        setSwitchToBuyer(true);
      }
    }
  }, []);

  // Handle switch to buyer functionality
  const handleSwitchToBuyer = async () => {
    if (switchToBuyer) {
      setSwitchToBuyer(false);
      if (windowRef.current) {
        windowRef.current.close();
      }
      window.localStorage.removeItem('switch');
    } else {
      try {
        setSwitchToBuyer(true);
        window.localStorage.setItem('switch', '1');
        
        console.log('🔄 Switching to buyer mode from dropdown...');
        
        // Store buyer switch data for the loading page
        const buyerSwitchData = {
          accessToken: auth.tokens.accessToken,
          refreshToken: auth.tokens.refreshToken,
          timestamp: Date.now()
        };
        sessionStorage.setItem('buyerSwitchData', JSON.stringify(buyerSwitchData));
        
        // Navigate to loading page instead of direct redirect
        navigate('/switching-to-buyer');
        
      } catch (error) {
        console.error('❌ Error switching to buyer mode:', error);
        setSwitchToBuyer(false);
        window.localStorage.removeItem('switch');
        
        // Show error message to user
        alert('Failed to switch to buyer mode. Please try again.');
      }
    }
  };

  // Monitor if buyer window is closed
  useEffect(() => {
    const checkWindowClosed = setInterval(() => {
      if (windowRef.current && windowRef.current.closed) {
        setSwitchToBuyer(false);
        window.localStorage.removeItem('switch');
      }
    }, 2000);

    return () => clearInterval(checkWindowClosed);
  }, []);

  return (
    <>
      {/* Mobile: clear, labeled account button; Desktop: avatar icon button */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
        <Button
          onClick={handleOpen}
          startIcon={<Iconify icon="mdi:account-circle" />}
          variant="contained"
          color="primary"
          size="medium"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700
          }}
        >
          {t('userDropdown.account') || 'Account'}
        </Button>
      </Box>

      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          p: 0,
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: { xs: 'none', sm: 'inline-flex' },
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          },
          ...(open
            ? {
                '&:before': {
                  zIndex: 1,
                  content: "''",
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  position: 'absolute',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  animation: 'pulse 2s infinite',
                },
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                    opacity: 0.7,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }
            : {}),
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
          badgeContent={
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              }}
            />
          }
        >
          <Avatar 
            src={auth.user?.avatar?.path!} 
            alt={auth.user?.firstName || 'User'}
            sx={{
              width: 40,
              height: 40,
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            {(auth.user?.firstName || 'U')?.charAt(0)}
          </Avatar>
        </Badge>
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: isRTL ? 0 : 0.75,
          mr: isRTL ? 0.75 : 0,
          minWidth: 320,
          maxWidth: 360,
          '& .MuiPaper-root': {
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(25px)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.8))',
            minWidth: 320,
            maxWidth: 360,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent)',
            },
          },
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: '16px',
            margin: '6px 12px',
            fontSize: '0.95rem',
            padding: '14px 18px',
            minHeight: 48,
            textAlign: isRTL ? 'right' : 'left',
            fontWeight: 500,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
              transition: 'left 0.6s ease',
            },
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.08))',
              transform: 'translateX(6px) scale(1.02)',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)',
              '&::before': {
                left: '100%',
              },
            },
          },
        }}
      >
        {/* User Profile Section */}
        <Box 
          sx={{ 
            p: 2.5, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px 20px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            minHeight: 80,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Avatar 
            src={auth.user?.avatar?.path!} 
            alt="photoURL"
            sx={{
              width: 52,
              height: 52,
              border: '4px solid rgba(255,255,255,0.5)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              }
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white', 
                fontWeight: 800,
                fontSize: '1.2rem',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.02em',
              }}
            >
              {auth.user?.firstName} {auth.user?.lastName}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 500,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                maxWidth: '100%',
                mt: 0.5,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {auth.user?.email}
            </Typography>
            <Chip 
              label={auth.user?.type === ACCOUNT_TYPE.PROFESSIONAL ? t('userDropdown.sellerType') : t('userDropdown.buyerType')}
              size="small"
              sx={{ 
                mt: 1.5, 
                height: 28, 
                fontSize: '0.8rem', 
                background: 'rgba(255,255,255,0.25)', 
                color: 'white', 
                fontWeight: 700,
                borderColor: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '& .MuiChip-label': { px: 2, py: 0.5 },
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.35)',
                  transform: 'scale(1.05)',
                }
              }} 
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

        {/* Menu Options */}
        <Box p={1.5}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem
              key={option.label}
              component={RouterLink}
              to={option.linkTo}
              onClick={handleClose}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2.5, 
                flexDirection: isRTL ? 'row-reverse' : 'row',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '16px',
                margin: '6px 12px',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateX(6px) scale(1.02)',
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)',
                }
              }}
            >
              <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.4rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.2)',
                  }
                }}
              >
                {option.icon}
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  textAlign: isRTL ? 'right' : 'left',
                  fontWeight: 600,
                  fontSize: '1rem',
                  letterSpacing: '0.01em',
                }}
              >
                {option.label}
              </Typography>
            </MenuItem>
          ))}
        </Box>
        
        {/* Switch to Buyer/Seller Mode */}
        <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)', my: 0.5 }} />
        
        <Box p={2}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05))',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
              }
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={switchToBuyer}
                  onChange={handleSwitchToBuyer}
                  color="primary"
                  size="medium"
                  sx={{
                    '& .MuiSwitch-thumb': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      width: 20,
                      height: 20,
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(99, 102, 241, 0.3)',
                      borderRadius: 12,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#6366f1',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#6366f1',
                      },
                    },
                  }}
                />
              }
              label={
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.01em' }}>
                  {switchToBuyer ? t('userDropdown.sellerModeActive') : t('userDropdown.switchToBuyer')}
                </Typography>
              }
              sx={{ 
                mb: 1.5, 
                '& .MuiFormControlLabel-label': { 
                  fontSize: '1rem', 
                  color: (theme) => theme.palette.text.primary 
                } 
              }}
            />
            <Typography variant="body2" sx={{ 
              display: 'block', 
              color: 'text.secondary', 
              fontSize: '0.9rem',
              lineHeight: 1.5,
              fontWeight: 500,
            }}>
              {switchToBuyer 
                ? t('userDropdown.buyerModeDescription') 
                : t('userDropdown.currentlyInSellerMode')}
            </Typography>
          </Box>
        </Box>

        {/* Logout Button */}
        <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)', my: 0.5 }} />
        
        <Box p={1.5}>
          <MenuItem 
            onClick={() => {
              handleClose();
              logout();
            }}
            sx={{ 
              m: '6px 12px', 
              py: 2, 
              px: 2.5,
              borderRadius: '16px',
              color: '#d32f2f',
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.08), rgba(244, 67, 54, 0.05))',
              border: '1px solid rgba(211, 47, 47, 0.15)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(211, 47, 47, 0.1), transparent)',
                transition: 'left 0.6s ease',
              },
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.12)',
                transform: 'translateX(6px) scale(1.02)',
                boxShadow: '0 8px 25px rgba(211, 47, 47, 0.25)',
                '&::before': {
                  left: '100%',
                },
              },
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
            }}
          >
            <Box 
              sx={{ 
                width: 36, 
                height: 36, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.4rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.15), rgba(244, 67, 54, 0.1))',
                border: '1px solid rgba(211, 47, 47, 0.2)',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 20px rgba(211, 47, 47, 0.2)',
                }
              }}
            >
              👋
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.01em' }}>
              {t('userDropdown.logout')}
            </Typography>
          </MenuItem>
        </Box>
      </MenuPopover>
    </>
  );
}
