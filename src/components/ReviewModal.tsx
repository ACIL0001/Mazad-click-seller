import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Rating,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Iconify from './Iconify';

// Styled components for better visual appeal
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxWidth: 500,
    width: '100%',
    margin: 16,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  minWidth: 120,
  '&.like-button': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  },
  '&.dislike-button': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));

const UserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  borderRadius: 12,
  marginBottom: theme.spacing(2),
}));

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  buyerInfo: {
    id: string;
    name: string;
    phone?: string;
    avatar?: string;
  };
  auctionInfo: {
    title: string;
    price: number;
  };
  onSubmitReview: (reviewData: {
    userId: string;
    type: 'like' | 'dislike';
    comment: string;
  }) => Promise<void>;
}

export default function ReviewModal({
  open,
  onClose,
  buyerInfo,
  auctionInfo,
  onSubmitReview,
}: ReviewModalProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<'like' | 'dislike' | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedType) {
      setError(t('review.selectTypeError'));
      return;
    }

    if (!comment.trim()) {
      setError(t('review.commentRequiredError'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await onSubmitReview({
        userId: buyerInfo.id,
        type: selectedType,
        comment: comment.trim(),
      });

      // Reset form and close modal on success
      setSelectedType(null);
      setComment('');
      onClose();
    } catch (err: any) {
      setError(err.message || t('review.submitError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedType(null);
      setComment('');
      setError(null);
      onClose();
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600}>
            {t('review.title')}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Auction Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('review.auctionSold')}
          </Typography>
          <Typography variant="h6" fontWeight={500}>
            {auctionInfo.title}
          </Typography>
          <Chip 
            label={`${auctionInfo.price} DA`}
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Buyer Info */}
        <UserInfo>
          <Avatar 
            src={buyerInfo.avatar} 
            sx={{ width: 56, height: 56 }}
          >
            {buyerInfo.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={500}>
              {buyerInfo.name}
            </Typography>
            {buyerInfo.phone && (
              <Typography variant="body2" color="text.secondary">
                {t('auctions.phone')}: {buyerInfo.phone}
              </Typography>
            )}
          </Box>
        </UserInfo>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('review.description')}
        </Typography>

        {/* Action Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            {t('review.rateTransaction')}
          </Typography>
          <Box display="flex" gap={2} mt={2}>
            <ActionButton
              className="like-button"
              variant={selectedType === 'like' ? 'contained' : 'outlined'}
              onClick={() => setSelectedType('like')}
              startIcon={<Iconify icon="eva:heart-fill" />}
              disabled={loading}
            >
              {t('review.like')}
            </ActionButton>
            <ActionButton
              className="dislike-button"
              variant={selectedType === 'dislike' ? 'contained' : 'outlined'}
              onClick={() => setSelectedType('dislike')}
              startIcon={<Iconify icon="eva:heart-outline" />}
              disabled={loading}
            >
              {t('review.dislike')}
            </ActionButton>
          </Box>
        </Box>

        {/* Comment Field */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t('review.commentLabel')}
          placeholder={t('review.commentPlaceholder')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !selectedType || !comment.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="eva:checkmark-fill" />}
        >
          {loading ? t('review.submitting') : t('review.submit')}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
} 