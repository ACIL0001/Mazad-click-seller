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
  const { isRTL, changeLanguage } = useLanguage();

  const MENU_OPTIONS = [
    {
      label: t('userDropdown.home'),
      icon: 'eva:home-fill',
      linkTo: '/dashboard/app',
    },
    {
      label: t('userDropdown.profile'),
      icon: 'eva:person-fill',
      linkTo: '/dashboard/profile',
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
    // Always reset language to default (French) on logout
    try {
      changeLanguage('fr');
    } catch (e) {
      console.warn('Language reset on logout failed, continuing logout anyway', e);
      localStorage.setItem('language', 'fr');
    }
    clear();
    navigate('/login');
  };

  // Check if switch is active on component mount
  useEffect(() => {
    // In seller mode, switch should ALWAYS be OFF (left) by default
    // The switch position doesn't reflect the current mode, it's always OFF in seller app
    setSwitchToBuyer(false);
  }, []);

  // Handle switch to buyer functionality
  const handleSwitchToBuyer = async () => {
    // In seller mode, switch is always OFF (left position)
    // When clicked, it switches to buyer mode and the switch stays OFF
    try {
      // Set localStorage to indicate switching to buyer
        window.localStorage.setItem('switch', '1');
        
      console.log('🔄 Switching to buyer mode from seller dropdown...');
        
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
        window.localStorage.removeItem('switch');
        
        // Show error message to user
        alert('Failed to switch to buyer mode. Please try again.');
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
      {/* Mobile: clear, labeled account button */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
        <Button
          onClick={handleOpen}
          startIcon={<Iconify icon="mdi:account-circle" />}
          variant="contained"
          color="primary"
          size="medium"
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
            }
          }}
        >
          {t('userDropdown.account') || 'Account'}
        </Button>
      </Box>

      {/* Desktop: Enhanced avatar icon button */}
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          p: 0,
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          display: { xs: 'none', sm: 'inline-flex' },
          '&:hover': {
            transform: 'scale(1.08) rotate(5deg)',
            '& .avatar-ring': {
              opacity: 1,
              transform: 'scale(1.15)',
            }
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
                  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  opacity: 0.15,
                  animation: 'ripple 1.5s ease-out infinite',
                },
                '@keyframes ripple': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 0.15,
                  },
                  '100%': {
                    transform: 'scale(2)',
                    opacity: 0,
                  },
                },
              }
            : {}),
        }}
      >
        {/* Animated ring around avatar */}
        <Box
          className="avatar-ring"
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px solid transparent',
            background: 'linear-gradient(135deg, #1976d2, #42a5f5) border-box',
            mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            opacity: 0,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'rotate 8s linear infinite',
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg) scale(1)' },
              '100%': { transform: 'rotate(360deg) scale(1)' },
            }
          }}
        />
        
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
          badgeContent={
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { 
                    transform: 'scale(1)',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                  },
                  '50%': { 
                    transform: 'scale(1.1)',
                    boxShadow: '0 2px 12px rgba(76, 175, 80, 0.6)',
                  },
                }
              }}
            />
          }
        >
          <Avatar 
            src={(() => {
              const avatar: any = auth.user?.avatar;
              const base = (app.baseURL || '').replace(/\/$/, '');
              if (!avatar) return '';
              // Prefer fullUrl
              const raw = avatar.fullUrl || avatar.url || avatar.path || avatar.filename || '';
              if (!raw) return '';
              if (/^https?:\/\//i.test(raw)) {
                return raw.replace('http://localhost:3000', base);
              }
              // Normalize leading slash
              const path = raw.startsWith('/') ? raw : `/${raw}`;
              // Ensure /static prefix if missing
              const finalPath = path.startsWith('/static/') ? path : `/static${path}`;
              return `${base}${finalPath}`;
            })()} 
            alt={auth.user?.firstName || 'User'}
            sx={{
              width: 44,
              height: 44,
              border: '3px solid white',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
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
          minWidth: 260,
          maxWidth: 300,
          '& .MuiPaper-root': {
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
            background: 'white',
            minWidth: 260,
            maxWidth: 300,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '@keyframes slideIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-10px) scale(0.95)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0) scale(1)',
              },
            }
          },
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0,
            margin: 0,
            fontSize: '14px',
            padding: '10px 16px',
            minHeight: 'auto',
            textAlign: isRTL ? 'right' : 'left',
            fontWeight: 500,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.08)',
              transform: 'translateX(4px)',
            },
          },
        }}
      >
        {/* User Profile Header - Enhanced */}
        <Box 
          sx={{ 
            p: '16px',
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: 'rotateGlow 20s linear infinite',
            },
            '@keyframes rotateGlow': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            position: 'relative',
            zIndex: 1
          }}>
            <Box sx={{ position: 'relative' }}>
          <Avatar 
            src={(() => {
              const avatar: any = auth.user?.avatar;
              const base = (app.baseURL || '').replace(/\/$/, '');
              if (!avatar) return '';
              const raw = avatar.fullUrl || avatar.url || avatar.path || avatar.filename || '';
              if (!raw) return '';
              if (/^https?:\/\//i.test(raw)) {
                return raw.replace('http://localhost:3000', base);
              }
              const path = raw.startsWith('/') ? raw : `/${raw}`;
              const finalPath = path.startsWith('/static/') ? path : `/static${path}`;
              return `${base}${finalPath}`;
            })()} 
                alt={auth.user?.firstName || 'User'}
                sx={{
                  width: 48,
                  height: 48,
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                }}
              >
                {(auth.user?.firstName || 'U')?.charAt(0)}
              </Avatar>
              {/* Online indicator */}
              <Box
            sx={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                  border: '2.5px solid white',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.5)',
                  animation: 'statusPulse 2s ease-in-out infinite',
                  '@keyframes statusPulse': {
                    '0%, 100%': { 
                      opacity: 1,
                      transform: 'scale(1)',
                    },
                    '50%': { 
                      opacity: 0.8,
                      transform: 'scale(1.15)',
                    },
              }
            }}
          />
            </Box>
            
            <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white', 
                  fontWeight: 700,
                  fontSize: '15px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  mb: 0.25
              }}
            >
                {auth.user?.firstName || 'User'} {auth.user?.lastName || ''}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '12px',
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
                {auth.user?.email || 'user@example.com'}
            </Typography>
            </Box>
          </Box>
        </Box>

         {/* App Switcher Section - Enhanced with Working Switch */}
         <Box 
           sx={{ 
             p: '14px',
             borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
             background: 'linear-gradient(to bottom, rgba(25, 118, 210, 0.03), rgba(255, 255, 255, 0))',
             display: 'flex',
             flexDirection: 'column',
             justifyContent: 'center',
             alignItems: 'center',
             gap: '8px',
           }}
         >
          {/* Text above switch */}
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              textAlign: 'center',
              mb: 0.5
            }}
          >
            {t('navigation.switchToBuyer')}
          </Typography>
          <Box
            onClick={handleSwitchToBuyer}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              padding: '10px 14px',
              borderRadius: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: switchToBuyer 
                ? '2px solid #1976d2' 
                : '2px solid rgba(0, 0, 0, 0.08)',
              boxShadow: switchToBuyer 
                ? '0 4px 20px rgba(25, 118, 210, 0.15)' 
                : '0 2px 8px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden',
              gap: 1.5,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: switchToBuyer 
                  ? '0 6px 24px rgba(25, 118, 210, 0.2)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: switchToBuyer 
                  ? '2px solid #42a5f5' 
                  : '2px solid rgba(0, 0, 0, 0.12)',
              },
            }}
          >
             {/* Icon */}
             <Box
               sx={{
                 width: 32,
                 height: 32,
                 borderRadius: '10px',
                 background: switchToBuyer 
                   ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' 
                   : 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 transition: 'all 0.3s ease',
                 boxShadow: switchToBuyer 
                   ? '0 4px 12px rgba(25, 118, 210, 0.3)' 
                   : '0 2px 6px rgba(0, 0, 0, 0.05)',
               }}
             >
               <Iconify 
                 icon={switchToBuyer ? "mdi:cart" : "mdi:store"} 
                 width={18} 
                 height={18}
                 sx={{ 
                   color: switchToBuyer ? 'white' : '#666',
                   transition: 'all 0.3s ease'
                 }}
               />
             </Box>
             
            {/* Current Mode Text */}
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '12px',
                fontWeight: 600,
                color: '#666',
                transition: 'all 0.3s ease',
                minWidth: '50px',
                textAlign: 'center'
              }}
            >
              {t('userDropdown.sellerModeActive')}
            </Typography>

             {/* Animated Toggle Switch - Always OFF in seller mode */}
             <Box
               sx={{
                 position: 'relative',
                 width: '52px',
                 height: '28px',
                 borderRadius: '14px',
                 background: '#e0e0e0', // Always gray (OFF state)
                 transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                 boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.1)',
                 flexShrink: 0,
               }}
             >
               {/* Toggle Circle/Knob - Always on the left */}
               <Box
                 sx={{
                   position: 'absolute',
                   top: '4px',
                   left: '4px', // Always on the left (OFF position)
                   width: '20px',
                   height: '20px',
                   borderRadius: '50%',
                   background: 'white',
                   boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                   transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                 }}
               >
                 {/* Mode indicator icon - Always OFF */}
                 <Box
                   sx={{
                     fontSize: '10px',
                     color: '#999',
                     fontWeight: 'bold',
                     transition: 'all 0.3s ease',
                   }}
                 >
                   ○
                 </Box>
               </Box>
               
               {/* Mode labels for better UX - Always show SELLER */}
               <Box
                 sx={{
                   position: 'absolute',
                   top: '50%',
                   left: '8px',
                   transform: 'translateY(-50%)',
                   fontSize: '8px',
                   color: 'white',
                   opacity: 0.8,
                   fontWeight: 'bold',
                 }}
               >
                 {t('userDropdown.seller')}
               </Box>
               <Box
                 sx={{
                   position: 'absolute',
                   top: '50%',
                   right: '8px',
                   transform: 'translateY(-50%)',
                   fontSize: '8px',
                   color: 'white',
                   opacity: 0,
                   fontWeight: 'bold',
                 }}
               >
                 {t('userDropdown.buyer')}
               </Box>
             </Box>
           </Box>
           
          {/* Text below switch */}
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '12px',
              color: '#666',
              textAlign: 'center',
              mt: 0.5,
              fontWeight: '500'
            }}
          >
            {t('navigation.currentlyInSellerMode')}
          </Typography>
         </Box>

        {/* Menu Options - Enhanced */}
        <Box sx={{ py: 0.5 }}>
          {MENU_OPTIONS.map((option, index) => (
            <MenuItem
              key={option.label}
              component={RouterLink}
              to={option.linkTo}
              onClick={handleClose}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                flexDirection: isRTL ? 'row-reverse' : 'row',
                padding: '10px 16px',
                color: '#333',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateX(4px)',
                  '& .menu-icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                    color: '#1976d2',
                  }
                }
              }}
            >
              <Box 
                className="menu-icon"
                sx={{ 
                  width: 32, 
                  height: 32, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.1))',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: '#1976d2'
                }}
              >
                <Iconify icon={option.icon} width={18} height={18} />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  textAlign: isRTL ? 'right' : 'left',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#333'
                }}
              >
                {option.label}
              </Typography>
            </MenuItem>
          ))}
        </Box>
        
        {/* Divider */}
        <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)', my: 0.5 }} />

        {/* Logout Button - Enhanced */}
          <MenuItem 
            onClick={() => {
              handleClose();
              logout();
            }}
            sx={{ 
                width: '100%',
            textAlign: 'left',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            color: '#dc3545',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(220, 53, 69, 0.08)',
              transform: 'translateX(4px)',
              '& .logout-icon': {
                transform: 'translateX(4px) scale(1.1)',
                color: '#c82333',
              }
            }
            }}
          >
            <Box 
            className="logout-icon"
              sx={{ 
                width: 32, 
                height: 32, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
              borderRadius: '10px',
              background: 'rgba(220, 53, 69, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              color: '#dc3545'
            }}
          >
            <svg width={18} height={18} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.6667 11.3333L14 8L10.6667 4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </Box>
          <Typography variant="body2" sx={{ 
            fontWeight: 600,
            fontSize: '13px',
            color: '#dc3545'
          }}>
              {t('userDropdown.logout')}
            </Typography>
          </MenuItem>
      </MenuPopover>
    </>
  );
}