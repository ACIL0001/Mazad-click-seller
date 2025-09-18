import { useState, useEffect } from 'react';
import { Auction } from '../types/Auction';
import { AuctionsAPI } from '@/api/auctions';
import { useSnackbar } from 'notistack';

export const useAuctionDetails = (auctionId: string | undefined) => {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchAuctionDetails = async () => {
    if (!auctionId) return;
    
    setLoading(true);
    try {
      const response = await AuctionsAPI.getAuctionById(auctionId);
      setAuction(response);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      enqueueSnackbar('Erreur lors du chargement des détails de l\'enchère', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionDetails();
  }, [auctionId]);

  return {
    auction,
    loading,
    error,
    refetch: fetchAuctionDetails
  };
}; 