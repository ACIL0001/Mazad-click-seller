import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// material
import {
  Box,
  Card,
  Grid,
  Stack,
  Avatar,
  Button,
  Container,
  Typography,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import { useSnackbar } from 'notistack';
// types
import { Auction, AUCTION_TYPE, BID_STATUS } from '../../types/Auction';
import User from '../../types/User';
import { AuctionsAPI } from '@/api/auctions';
import { OffersAPI } from '@/api/offers';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';
import useAuth from '@/hooks/useAuth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Slide from '@mui/material/Slide';
import { useCreateSocket } from '@/contexts/SocketContext';
import { ChatAPI } from '@/api/Chat';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Update the Auction type definition to include user property if it's missing in the type definition
interface AuctionWithUser extends Auction {
  user?: User;
  winner?: User;
}

interface Participant {
  name: string;
  avatar: string;
  bidAmount: number;
  bidDate: Date | string;
  user: User;
}

export default function AuctionDetail() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [auction, setAuction] = useState<AuctionWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const navigate = useNavigate();
  const { notificationSocket } = useCreateSocket();
  const { auth } = useAuth();

  console.log('Auth data:', auth);

  const getAuctionDetails = useCallback(async (auctionId: string) => {
    try {
      setLoading(true);
      console.log('Fetching auction details for ID:', auctionId);
      const response = await AuctionsAPI.getAuctionById(auctionId);
      console.log("Auction details response:", response);
      
      if (response) {
        console.log("response auction details:", response);
        setAuction(response);
      } else {
        console.warn('No auction data received');
        enqueueSnackbar('No auction data received', { variant: 'warning' });
      }
    } catch (error: any) {
      console.error('Error fetching auction details:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error loading auction details';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const getAuctionParticipants = useCallback(async (auctionId: string) => {
    setParticipantsLoading(true);
    try {
      console.log('Fetching participants for auction ID:', auctionId);
      const offers = await OffersAPI.getOffersByBidId(auctionId);

      console.log('Offers response:', offers);
      
      if (Array.isArray(offers)) {
        const formattedParticipants = offers
          .map((offer: any) => ({
            name: offer.user?.firstName && offer.user?.lastName 
              ? `${offer.user.firstName} ${offer.user.lastName}` 
              : offer.user?.email || t('unknownUser') || 'Unknown User',
            avatar: offer.user?.avatar?.path || '',
            bidAmount: offer.price || 0,
            bidDate: offer.createdAt || new Date(),
            user: offer.user as User
          }))
          .sort((a, b) => new Date(b.bidDate).getTime() - new Date(a.bidDate).getTime());
        
        console.log('Formatted participants:', formattedParticipants);
        setParticipants(formattedParticipants);
      } else {
        console.warn('Offers response is not an array:', offers);
        setParticipants([]);
      }
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error loading participants';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  }, [enqueueSnackbar, t]);

  useEffect(() => {
    if (id) {
      getAuctionDetails(id);
      getAuctionParticipants(id);
    }
  }, [id, getAuctionDetails, getAuctionParticipants]);

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    
    // Get current language from i18n and provide a safe fallback
    const currentLanguage = i18n.language || 'en';
    
    // Map language codes to valid locales
    const localeMap: { [key: string]: string } = {
      'en': 'en-US',
      'fr': 'fr-FR',
      'ar': 'ar-DZ',
      'es': 'es-ES',
      'de': 'de-DE',
    };
    
    const locale = localeMap[currentLanguage] || 'en-US';
    
    try {
      return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      // Fallback if there's still an issue with the locale
      console.warn(`Date formatting error with locale ${locale}, using default format`);
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getStatusColor = (status: BID_STATUS) => {
    switch (status) {
      case BID_STATUS.OPEN:
        return 'info';
      case BID_STATUS.ON_AUCTION:
        return 'success';
      case BID_STATUS.CLOSED:
        return 'error';
      case BID_STATUS.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  const CreateChat = async () => {
    if (!participants.length || !participants[0] || !participants[0].user) {
      enqueueSnackbar(t('errors.noValidParticipant') || 'No valid participant found', { variant: 'error' });
      return;
    }

    if (!auth.user) {
      enqueueSnackbar('User not authenticated', { variant: 'error' });
      return;
    }

    setChatLoading(true);
    
    const data = {
      createdAt: new Date(),
      users: [auth.user, participants[0].user]
    };

    console.log('Creating chat with data:', data);
  
    try {
      const res = await ChatAPI.createChat(data);
      console.log('Chat creation response:', res);
  
      if (res._id) {
        navigate(`/dashboard/chat`, { state: { chat: res } });
      } else {
        enqueueSnackbar('Failed to create chat - no chat ID returned', { variant: 'error' });
      }
    } catch (err: any) {
      console.error('Error creating chat:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create chat';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setChatLoading(false);
    }
  };

  // WinnerBanner component
  const WinnerBanner = ({ winner }: { winner: User }) => (
    <Slide in direction="down" timeout={600}>
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
          color: '#fff',
          boxShadow: '0 8px 32px 0 rgba(34, 197, 94, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <EmojiEventsIcon sx={{ fontSize: 40, color: '#fff', mr: 2, animation: 'trophy-bounce 1.2s infinite alternate' }} />
        <Avatar
          src={winner?.avatar?.path || ''}
          alt={winner?.firstName || 'Winner'}
          sx={{ width: 56, height: 56, border: '2px solid #fff', boxShadow: 2 }}
        >
          {winner?.firstName?.charAt(0) || 'W'}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            {t('winnerBanner') || 'Winner'}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            <b>{winner?.firstName || ''} {winner?.lastName || ''}</b>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 400, opacity: 0.9 }}>
            <b>{t('phone') || 'Phone'}: {winner?.phone || 'N/A'}</b>
          </Typography>
        </Box>
        <style>{`
          @keyframes trophy-bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-8px); }
          }
        `}</style>
      </Paper>
    </Slide>
  );

  if (loading) {
    return (
      <Page title={t('details') || 'Auction Details'}>
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    );
  }

  if (!auction) {
    return (
      <Page title={t('details') || 'Auction Details'}>
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Typography variant="h6">{t('notFound') || 'Auction not found'}</Typography>
          </Box>
        </Container>
      </Page>
    );
  }

  console.log('Notification socket data:', notificationSocket);

  return (
    <Page title={`${t('details') || 'Auction Details'} - ${auction.title}`}>
      <Container>
        {/* Winner Banner */}
        {auction.winner && (
          <WinnerBanner winner={auction.winner} />
        )}
        
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {t('details') || 'Auction Details'}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {auction.status === BID_STATUS.OPEN && participants.length > 0 && (
              <Button
                variant="contained"
                startIcon={<ChatIcon />}
                onClick={CreateChat}
                disabled={chatLoading}
                sx={{
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px 0 rgba(34, 197, 94, 0.15)',
                  px: 3,
                  py: 1.2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
                  },
                }}
                size="large"
              >
                {chatLoading ? <CircularProgress size={22} color="inherit" /> : t('startChat') || 'Start Chat'}
              </Button>
            )}

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
                      return theme.palette[color]?.[theme.palette.mode === 'dark' ? 400 : 500] || theme.palette.primary[500];
                    },
                    boxShadow: (theme) => {
                      const color = getStatusColor(auction.status);
                      return `0 0 8px ${theme.palette[color]?.[theme.palette.mode === 'dark' ? 400 : 500] || theme.palette.primary[500]}`;
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
                  {t('statusLabel') || 'Status'}
                </Typography>
              </Box>
                              <Chip
                label={auction.status === BID_STATUS.OPEN 
                  ? 'Open' 
                  : auction.status === BID_STATUS.ON_AUCTION ? 'On Auction' 
                  : auction.status === BID_STATUS.CLOSED ? 'Closed'
                  : auction.status === BID_STATUS.ARCHIVED ? 'Archived'
                  : auction.status}
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

        <Grid container spacing={3}>
          {/* Main Auction Info */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2, mb: 3, minHeight: '200px', maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {auction.title}
              </Typography>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('description') || 'Description'}
                  </Typography>
                  <Typography variant="body1" sx={{ maxHeight: '80px', overflow: 'auto' }}>
                    {auction.description}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('initialPrice') || 'Initial Price'}
                    </Typography>
                    <Typography variant="h6">
                      {(auction.startingPrice || 0).toFixed(2)} DA
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('currentPrice') || 'Current Price'}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {(auction.currentPrice || auction.startingPrice || 0).toFixed(2)} DA
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Card>

            {/* Participants Section */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('participants') || 'Participants'}
              </Typography>
              {participantsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60px">
                  <CircularProgress size={24} />
                </Box>
              ) : participants && participants.length > 0 ? (
                <Stack spacing={2}>
                  {participants.map((participant, index) => (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': { 
                          bgcolor: 'background.neutral',
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        }
                      }}
                      onClick={() => {
                        if (participant.user?._id) {
                          // Open user profile in a new tab
                          window.open(`http://localhost:3001/users/${participant.user._id}`, '_blank');
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar src={participant.avatar} alt={participant.name}>
                          {participant.name.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {participant.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Bid: {participant.bidAmount?.toFixed(2) || '0.00'} DA
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(participant.bidDate)}
                          </Typography>
                          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5} sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="primary.main" sx={{ fontSize: '0.75rem' }}>
                              View profile
                            </Typography>
                            <OpenInNewIcon sx={{ fontSize: '0.875rem', color: 'primary.main' }} />
                          </Box>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  {t('noParticipants') || 'No participants yet'}
                </Typography>
              )}
            </Card>
          </Grid>

          {/* Sidebar Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, mb: 3, minHeight: '200px', maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('information') || 'Information'}
              </Typography>
              <Stack spacing={2} sx={{ flex: 1, justifyContent: 'space-around' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('type') || 'Type'}
                  </Typography>
                  <Label variant="ghost" color="default">
                    {auction.bidType === 'PRODUCT' 
                      ? t('typeProduct') || 'Product' 
                      : t('typeService') || 'Service'}
                  </Label>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('mode') || 'Mode'}
                  </Typography>
                  <Label
                    variant="ghost"
                    color={auction.auctionType === AUCTION_TYPE.EXPRESS ? 'warning' : 'default'}
                  >
                    {auction.auctionType === AUCTION_TYPE.EXPRESS
                      ? `${t('modeExpress') || 'Express'} (MEZROUB)`
                      : auction.auctionType === AUCTION_TYPE.AUTO_SUB_BID
                      ? t('modeAutomatic') || 'Automatic'
                      : t('modeClassic') || 'Classic'}
                  </Label>
                </Box>
              </Stack>
            </Card>

            {/* Auction Timeline */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('timeline') || 'Timeline'}
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('startDate') || 'Start Date'}
                  </Typography>
                  <Typography variant="body1">{formatDate(auction.startingAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('endDate') || 'End Date'}
                  </Typography>
                  <Typography variant="body1">{formatDate(auction.endingAt)}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}