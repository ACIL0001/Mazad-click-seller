import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { uploadPaymentProof, getStoredPaymentProof, clearStoredPaymentProof } from '../utils/paymentProofUpload';
import { IdentityAPI } from '../api/identity';

const UploadArea = styled(Box)(({ theme }) => ({
  border: '2px dashed',
  borderColor: theme.palette.divider,
  borderRadius: 12,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

interface PaymentProofUploadProps {
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

export const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  onUploadSuccess,
  onUploadError
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      // Get current user's identity
      const identity = await IdentityAPI.getMy();
      
      if (identity && identity._id) {
        const success = await uploadPaymentProof(identity._id, uploadedFile);
        
        if (success) {
          enqueueSnackbar('Preuve de paiement téléchargée avec succès', { variant: 'success' });
          setUploadedFile(null);
          onUploadSuccess?.();
        } else {
          const errorMsg = 'Échec du téléchargement de la preuve de paiement';
          enqueueSnackbar(errorMsg, { variant: 'error' });
          onUploadError?.(errorMsg);
        }
      } else {
        const errorMsg = 'Aucune identité trouvée. Veuillez d\'abord soumettre vos documents d\'identité.';
        enqueueSnackbar(errorMsg, { variant: 'error' });
        onUploadError?.(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Erreur lors du téléchargement';
      enqueueSnackbar(errorMsg, { variant: 'error' });
      onUploadError?.(errorMsg);
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFile, enqueueSnackbar, onUploadSuccess, onUploadError]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  // Check for stored payment proof on component mount
  React.useEffect(() => {
    const storedProof = getStoredPaymentProof();
    if (storedProof && storedProof.file) {
      setUploadedFile(storedProof.file);
    }
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Justificatif de paiement
      </Typography>
      
      {!uploadedFile ? (
        <UploadArea>
          <input
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            id="payment-proof-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="payment-proof-upload">
            <Typography variant="h6" gutterBottom>
              Cliquez pour télécharger
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ou glissez-déposez votre justificatif de paiement ici
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Formats acceptés: JPG, PNG, PDF (Max: 5MB)
            </Typography>
          </label>
        </UploadArea>
      ) : (
        <Box sx={{ 
          border: '1px solid',
          borderColor: 'success.main',
          borderRadius: 2,
          p: 2,
          backgroundColor: 'rgba(76, 175, 80, 0.1)'
        }}>
          <Typography variant="body1" color="success.dark" gutterBottom>
            Fichier sélectionné: {uploadedFile.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <LoadingButton
              variant="contained"
              color="primary"
              onClick={handleUpload}
              loading={isUploading}
              disabled={isUploading}
            >
              Télécharger
            </LoadingButton>
            <Button
              variant="outlined"
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              Supprimer
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PaymentProofUpload;
