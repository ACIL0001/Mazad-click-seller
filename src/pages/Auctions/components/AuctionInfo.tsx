import { Card, Typography, Stack, Box, Grid } from '@mui/material';
import { Auction } from '../../../types/Auction';

interface AuctionInfoProps {
  auction: Auction;
  currentPrice: number;
}

export default function AuctionInfo({ auction, currentPrice }: AuctionInfoProps) {
  return (
    <Card sx={{ p: 2, mb: 3, minHeight: '200px', maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {auction.title}
      </Typography>
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1" sx={{ maxHeight: '80px', overflow: 'auto' }}>
            {auction.description}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Prix initial
            </Typography>
            <Typography variant="h6">
              {auction.startingPrice.toFixed(2)} DA
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Prix actuel
            </Typography>
            <Typography variant="h6" color="primary.main">
              {currentPrice.toFixed(2)} DA
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </Card>
  );
} 