import { useState, useEffect } from 'react';
import { Participant } from '../types/Participant';
import { OffersAPI } from '@/api/offers';
import { useSnackbar } from 'notistack';

interface FormattedParticipant {
  name: string;
  avatar: string;
  bidAmount: number;
  bidDate: string;
  user: any;
}

export const useParticipants = (auctionId: string | undefined) => {
  const [participants, setParticipants] = useState<FormattedParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchParticipants = async () => {
    if (!auctionId) return;

    setLoading(true);
    try {
      const offers = await OffersAPI.getOffersByBidId(auctionId);
      
      if (Array.isArray(offers)) {
        const formattedParticipants: FormattedParticipant[] = offers
          .map((offer: any) => ({
            name: offer.user?.firstName && offer.user?.lastName 
              ? `${offer.user.firstName} ${offer.user.lastName}` 
              : offer.user?.email || 'Utilisateur inconnu',
            avatar: offer.user?.avatar?.path || '',
            bidAmount: offer.price,
            bidDate: offer.createdAt,
            user: offer.user
          }))
          .sort((a, b) => new Date(b.bidDate).getTime() - new Date(a.bidDate).getTime());

        setParticipants(formattedParticipants);
        setError(null);
      } else {
        setParticipants([]);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      enqueueSnackbar('Erreur lors du chargement des participants', { variant: 'error' });
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [auctionId]);

  return {
    participants,
    loading,
    error,
    refetch: fetchParticipants
  };
}; 