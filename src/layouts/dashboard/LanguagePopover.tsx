import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
// material
import { alpha, useTheme } from '@mui/material/styles';
import { Box, MenuItem, Stack, IconButton, Typography } from '@mui/material';
// components
import MenuPopover from '../../components/MenuPopover';
import { useLanguage } from '../../contexts/LanguageContext';

// ----------------------------------------------------------------------

export default function LanguagePopover() {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages, isRTL } = useLanguage();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLanguageChange = (language: string) => {
    changeLanguage(language);
    handleClose();
  };

  const currentLang = availableLanguages.find((lang) => lang.value === currentLanguage) || availableLanguages[0];

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 1,
          width: 40,
          height: 40,
          borderRadius: 1,
          transition: 'all 0.2s ease-in-out',
          border: '1px solid',
          borderColor: 'divider',
          ...(open && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity),
            transform: 'scale(1.05)',
            borderColor: 'primary.main',
          }),
          '&:hover': {
            transform: 'scale(1.05)',
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
            borderColor: 'primary.main',
          },
        }}
      >
        <Typography variant="body2" sx={{ 
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'text.primary'
        }}>
          <span style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
            {currentLanguage === 'ar' ? 'AR' : currentLanguage === 'en' ? 'EN' : 'FR'}
          </span>
        </Typography>
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{
          mt: 1.5,
          ml: isRTL ? 0 : 0.75,
          mr: isRTL ? 0.75 : 0,
          width: 120,
          '& .MuiMenuItem-root': { 
            px: 2, 
            py: 1.5,
            typography: 'body2', 
            borderRadius: 1,
            mb: 0.5,
            transition: 'all 0.2s ease-in-out',
            textAlign: isRTL ? 'right' : 'left',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
              transform: isRTL ? 'translateX(-4px)' : 'translateX(4px)',
            },
          },
        }}
      >
        <Stack spacing={0.5}>
          {availableLanguages.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === currentLanguage}
              onClick={() => handleLanguageChange(option.value)}
              sx={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                ...(option.value === currentLanguage && {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
                  color: 'primary.main',
                  fontWeight: 'fontWeightMedium',
                }),
              }}
            >
              <Typography variant="body2" sx={{ 
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'text.primary',
                textAlign: isRTL ? 'right' : 'left'
              }}>
                <span style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
                  {option.value === 'ar' ? 'AR' : option.value === 'en' ? 'EN' : 'FR'}
                </span>
              </Typography>
            </MenuItem>
          ))}
        </Stack>
      </MenuPopover>
    </>
  );
}
