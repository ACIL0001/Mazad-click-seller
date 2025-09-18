import { Box, Stack, Typography, Paper, Chip } from '@mui/material';
import { Auction, BID_STATUS } from '../../../types/Auction';
import { getStatusColor } from '../../../utils/auction';

interface AuctionHeaderProps {
  auction: Auction;
  onAccept: () => void;
  acceptLoading: boolean;
}

export default function AuctionHeader({ auction, onAccept, acceptLoading }: AuctionHeaderProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
      <Typography variant="h4" gutterBottom>
        Détails de l'enchère
      </Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: (theme) => {
                  const color = getStatusColor(auction.status);
                  return theme.palette[color][theme.palette.mode === 'dark' ? 400 : 500];
                },
                boxShadow: (theme) => {
                  const color = getStatusColor(auction.status);
                  return `0 0 8px ${theme.palette[color][theme.palette.mode === 'dark' ? 400 : 500]}`;
                },
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(0.95)',
                    opacity: 0.8,
                  },
                  '70%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'scale(0.95)',
                    opacity: 0.8,
                  },
                },
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
              }}
            >
              Status de l'enchère
            </Typography>
          </Box>
          <Chip
            label={auction.status === BID_STATUS.OPEN ? 'OUVERT' : auction.status}
            color={getStatusColor(auction.status)}
            variant="filled"
            size="small"
            sx={{
              fontWeight: 600,
              borderRadius: 1.5,
              minWidth: 80,
              textAlign: 'center'
            }}
          />
        </Paper>
      </Box>
    </Stack>
  );
} 