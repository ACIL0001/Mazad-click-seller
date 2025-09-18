import React, { useState } from 'react';
import { Box, Button, Typography, Stack, Chip, Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation';
import Iconify from './Iconify';

interface LanguageSwitcherProps {
  variant?: 'buttons' | 'chips' | 'dropdown' | 'icon';
  showFlags?: boolean;
  showLabels?: boolean;
  showDirection?: boolean;
  size?: 'small' | 'medium' | 'large';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  sx?: any;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showFlags = true,
  showLabels = true,
  showDirection = false,
  size = 'medium',
  position = 'bottom',
  className,
  sx,
}) => {
  const { currentLanguage, changeLanguage, isRTL, direction, availableLanguages } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLanguageChange = (language: string) => {
    changeLanguage(language);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const currentLang = availableLanguages.find(lang => lang.value === currentLanguage) || availableLanguages[0];

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: '0.875rem', padding: '4px 8px' };
      case 'large':
        return { fontSize: '1.25rem', padding: '12px 16px' };
      default:
        return { fontSize: '1rem', padding: '8px 12px' };
    }
  };

  const renderLanguageButton = (lang: any) => (
    <Button
      key={lang.value}
      variant={currentLanguage === lang.value ? 'contained' : 'outlined'}
      onClick={() => handleLanguageChange(lang.value)}
      sx={{
        minWidth: 'auto',
        px: 2,
        py: 1,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2,
        },
        ...(currentLanguage === lang.value && {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }),
        ...getSizeStyles(),
        ...sx,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {showFlags && (
          <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
            {lang.flag}
          </Typography>
        )}
        {showLabels && (
          <Typography variant="body2" sx={{ fontWeight: currentLanguage === lang.value ? 'bold' : 'normal' }}>
            {lang.label}
          </Typography>
        )}
        {showDirection && (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {lang.direction.toUpperCase()}
          </Typography>
        )}
      </Stack>
    </Button>
  );

  const renderLanguageChip = (lang: any) => (
    <Chip
      key={lang.value}
      label={
        <Stack direction="row" spacing={0.5} alignItems="center">
          {showFlags && (
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
              {lang.flag}
            </Typography>
          )}
          {showLabels && (
            <Typography variant="body2">
              {lang.label}
            </Typography>
          )}
          {showDirection && (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {lang.direction.toUpperCase()}
            </Typography>
          )}
        </Stack>
      }
      onClick={() => handleLanguageChange(lang.value)}
      color={currentLanguage === lang.value ? 'primary' : 'default'}
      variant={currentLanguage === lang.value ? 'filled' : 'outlined'}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
        },
        ...getSizeStyles(),
        ...sx,
      }}
    />
  );

  const renderIconButton = () => (
    <Tooltip title={`${currentLang.label} (${currentLang.direction.toUpperCase()})`}>
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          ...sx,
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
          {currentLang.flag}
        </Typography>
      </IconButton>
    </Tooltip>
  );

  const renderDropdown = () => (
    <>
      <Button
        variant="outlined"
        onClick={handleMenuOpen}
        endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          ...getSizeStyles(),
          ...sx,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {showFlags && (
            <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
              {currentLang.flag}
            </Typography>
          )}
          {showLabels && (
            <Typography variant="body2">
              {currentLang.label}
            </Typography>
          )}
        </Stack>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: position === 'top' ? 'top' : 'bottom',
          horizontal: position === 'left' ? 'left' : position === 'right' ? 'right' : 'center',
        }}
        transformOrigin={{
          vertical: position === 'top' ? 'bottom' : 'top',
          horizontal: position === 'left' ? 'left' : position === 'right' ? 'right' : 'center',
        }}
        sx={{
          '& .MuiMenuItem-root': {
            px: 2,
            py: 1.5,
            typography: 'body2',
            borderRadius: 1,
            mb: 0.5,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateX(4px)',
            },
          },
        }}
      >
        {availableLanguages.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentLanguage}
            onClick={() => handleLanguageChange(option.value)}
            sx={{
              ...(option.value === currentLanguage && {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 'fontWeightMedium',
              }),
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              {showFlags && (
                <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                  {option.flag}
                </Typography>
              )}
              <Stack>
                {showLabels && (
                  <Typography variant="body2">
                    {option.label}
                  </Typography>
                )}
                {showDirection && (
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {option.direction.toUpperCase()}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  const renderContent = () => {
    switch (variant) {
      case 'buttons':
        return (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {availableLanguages.map(renderLanguageButton)}
          </Stack>
        );
      case 'chips':
        return (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {availableLanguages.map(renderLanguageChip)}
          </Stack>
        );
      case 'icon':
        return renderIconButton();
      case 'dropdown':
      default:
        return renderDropdown();
    }
  };

  return (
    <Box className={className} sx={sx}>
      {renderContent()}
    </Box>
  );
}; 