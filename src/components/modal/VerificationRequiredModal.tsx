import React from 'react';
import { Dialog, DialogContent, DialogTitle, Button, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Iconify from '../../components/Iconify';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    padding: theme.spacing(2),
    maxWidth: 450
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(2)
}));

interface VerificationRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

const VerificationRequiredModal: React.FC<VerificationRequiredModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  
  return (
    <StyledDialog open={open} onClose={onClose} aria-labelledby="verification-required-title">
      <DialogTitle id="verification-required-title" sx={{ textAlign: 'center', pb: 0 }}>
        {t('auth.verificationRequired')}
      </DialogTitle>
      
      <DialogContent>
        <IconWrapper>
          <Box 
            sx={{
              backgroundColor: (theme) => theme.palette.warning.light, // Corrected from 'lighter' to 'light'
              borderRadius: '50%',
              width: 70,
              height: 70,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Iconify 
              icon="ic:baseline-lock-clock" 
              width={40} 
              height={40} 
              style={{ color: (theme) => theme.palette.warning.main }}
            />
          </Box>
        </IconWrapper>
        
        <Typography variant="body1" align="center" paragraph>
          {t('auth.accountPendingVerification')}
        </Typography>
        
        <Typography variant="body2" align="center" color="text.secondary" paragraph>
          {t('auth.waitForAdminVerification')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={onClose} 
            fullWidth
            sx={{ 
              borderRadius: 2,
              py: 1
            }}
          >
            {t('common.understood')}
          </Button>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default VerificationRequiredModal;