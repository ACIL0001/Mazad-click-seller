import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Container,
  Grid,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import Breadcrumb from '@/components/Breadcrumbs';
import { TendersAPI } from '@/api/tenders';
import { OffersAPI } from '@/api/offers';
import { Tender, TenderBid, TENDER_STATUS } from '@/types/Tender';
import useAuth from '@/hooks/useAuth';

export default function TenderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { auth } = useAuth();

  const [tender, setTender] = useState<Tender | null>(null);
  const [tenderBids, setTenderBids] = useState<TenderBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTenderDetails();
      fetchTenderBids();
    }
  }, [id]);

  const fetchTenderDetails = async () => {
    try {
      const response = await TendersAPI.getTenderById(id!);
      setTender(response);
    } catch (error) {
      console.error('Error fetching tender details:', error);
      enqueueSnackbar('Erreur lors du chargement des détails', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTenderBids = async () => {
    try {
      const response = await TendersAPI.getTenderBids(id!);
      setTenderBids(response);
    } catch (error) {
      console.error('Error fetching tender bids:', error);
      enqueueSnackbar('Erreur lors du chargement des offres', { variant: 'error' });
    }
  };

  const handleDeleteOffer = async (bidId: string) => {
    try {
      setLoading(true);
      console.log('Deleting tender bid:', bidId);
      
      const response = await OffersAPI.deleteOffer(bidId);
      console.log('Tender bid deleted:', response);
      
      enqueueSnackbar('Offre supprimée avec succès!', { variant: 'success' });
      
      // Refresh the data
      fetchTenderBids();
    } catch (error) {
      console.error('Error deleting tender bid:', error);
      enqueueSnackbar('Erreur lors de la suppression de l\'offre.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllOffers = async () => {
    if (tenderBids.length === 0) return;
    
    try {
      setLoading(true);
      console.log('Deleting all tender bids');
      
      // Delete all offers in parallel
      const deletePromises = tenderBids.map(bid => OffersAPI.deleteOffer(bid._id));
      await Promise.all(deletePromises);
      
      enqueueSnackbar(`${tenderBids.length} offres supprimées avec succès!`, { variant: 'success' });
      
      // Refresh the data
      fetchTenderBids();
    } catch (error) {
      console.error('Error deleting all tender bids:', error);
      enqueueSnackbar('Erreur lors de la suppression des offres.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TENDER_STATUS) => {
    switch (status) {
      case TENDER_STATUS.OPEN:
        return 'success';
      case TENDER_STATUS.AWARDED:
        return 'info';
      case TENDER_STATUS.CLOSED:
        return 'error';
      case TENDER_STATUS.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: TENDER_STATUS) => {
    switch (status) {
      case TENDER_STATUS.OPEN:
        return 'Ouvert';
      case TENDER_STATUS.AWARDED:
        return 'Attribué';
      case TENDER_STATUS.CLOSED:
        return 'Fermé';
      case TENDER_STATUS.ARCHIVED:
        return 'Archivé';
      default:
        return status;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTimeRemaining = () => {
    if (!tender) return null;
    const now = new Date().getTime();
    const endTime = new Date(tender.endingAt).getTime();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) return 'Terminé';

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}j ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const calculateProgress = () => {
    if (!tender) return 0;
    const start = new Date(tender.startingAt).getTime();
    const end = new Date(tender.endingAt).getTime();
    const now = new Date().getTime();
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (loading) {
    return (
      <Page title="Détails de l'appel d'offres">
        <Container maxWidth="xl">
          <Box sx={{ py: 4 }}>
            <LinearProgress />
          </Box>
        </Container>
      </Page>
    );
  }

  if (!tender) {
    return (
      <Page title="Appel d'offres non trouvé">
        <Container maxWidth="xl">
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Appel d'offres non trouvé
            </Typography>
            <Button onClick={() => navigate('/dashboard/tenders')} sx={{ mt: 2 }}>
              Retour à la liste
            </Button>
          </Box>
        </Container>
      </Page>
    );
  }

  const timeRemaining = calculateTimeRemaining();
  const progress = calculateProgress();

  return (
    <Page title={tender.title}>
      <Container maxWidth="xl">
        <Stack mb={3}>
          <Breadcrumb />
        </Stack>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Header Card */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    {tender.title}
                  </Typography>
                  <Stack direction="row" spacing={1} mb={2}>
                    <Chip
                      label={getStatusLabel(tender.status)}
                      color={getStatusColor(tender.status)}
                      variant="outlined"
                    />
                    <Chip
                      label={tender.tenderType === 'PRODUCT' ? 'Produit' : 'Service'}
                      variant="outlined"
                    />
                    <Chip
                      label={tender.auctionType === 'CLASSIC' ? 'Classique' : 'Express'}
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:edit-fill" />}
                  onClick={() => navigate(`/dashboard/tenders/${tender._id}/edit`)}
                  disabled={tender.status !== TENDER_STATUS.OPEN}
                >
                  Modifier
                </Button>
              </Stack>

              {/* Progress Bar */}
              {tender.status === TENDER_STATUS.OPEN && (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Temps restant: {timeRemaining}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {progress.toFixed(0)}% écoulé
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}

              <Typography variant="body1" paragraph>
                {tender.description}
              </Typography>
            </Card>

            {/* Details Card */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Détails de l'appel d'offres
              </Typography>
              
              <Grid container spacing={2}>
                {tender.quantity && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Quantité
                    </Typography>
                    <Typography variant="body1">
                      {tender.quantity}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date de début
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(tender.startingAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date de fin
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(tender.endingAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Localisation
                  </Typography>
                  <Typography variant="body1">
                    {tender.location}, {tender.wilaya}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            {/* Bids Table */}
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6">
                  Offres reçues ({tenderBids.length})
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  {tender.status === TENDER_STATUS.OPEN && (
                    <Typography variant="body2" color="text.secondary">
                      Les offres sont classées par prix croissant
                    </Typography>
                  )}
                  {tenderBids.length > 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Iconify icon="eva:trash-2-outline" />}
                      onClick={handleDeleteAllOffers}
                      disabled={loading}
                    >
                      Supprimer toutes
                    </Button>
                  )}
                </Stack>
              </Stack>

              {tenderBids.length === 0 ? (
                <Alert severity="info">
                  Aucune offre reçue pour le moment
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Prestataire</TableCell>
                        <TableCell align="right">Montant proposé</TableCell>
                        <TableCell align="right">Délai de livraison</TableCell>
                        <TableCell align="center">Date</TableCell>
                        <TableCell align="center">Statut</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tenderBids
                        .sort((a, b) => a.bidAmount - b.bidAmount)
                        .map((bid, index) => (
                        <TableRow key={bid._id} hover>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar sx={{ width: 40, height: 40 }}>
                                {bid.bidder?.firstName?.charAt(0) || '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">
                                  {bid.bidder?.firstName} {bid.bidder?.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {bid.bidder?.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="h6" 
                              color={index === 0 ? 'success.main' : 'text.primary'}
                            >
                              {bid.bidAmount.toLocaleString()} DA
                            </Typography>
                            {index === 0 && (
                              <Chip label="Meilleure offre" color="success" size="small" />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {bid.deliveryTime ? `${bid.deliveryTime} jours` : '-'}
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {formatDate(bid.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={bid.status === 'pending' ? 'En attente' : bid.status}
                              color={bid.status === 'pending' ? 'warning' : 'success'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Button size="small" variant="outlined">
                                Voir détails
                              </Button>
                              {tender.status === TENDER_STATUS.OPEN && (
                                <Button 
                                  size="small" 
                                  variant="contained" 
                                  color="success"
                                  disabled={tender.awardedTo === bid.bidder._id}
                                >
                                  Attribuer
                                </Button>
                              )}
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteOffer(bid._id)}
                                disabled={loading}
                                startIcon={<Iconify icon="eva:trash-2-outline" />}
                              >
                                Supprimer
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Statistics Card */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nombre d'offres
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {tenderBids.length}
                  </Typography>
                </Box>

                {tender.category && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Catégorie
                    </Typography>
                    <Typography variant="body1">
                      {tender.category.name}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Action Cards */}
            {tender.status === TENDER_STATUS.OPEN && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Actions rapides
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Iconify icon="eva:share-fill" />}
                  >
                    Partager l'appel d'offres
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Iconify icon="eva:download-fill" />}
                  >
                    Exporter les offres
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<Iconify icon="eva:close-fill" />}
                  >
                    Fermer l'appel d'offres
                  </Button>
                </Stack>
              </Card>
            )}

            {/* Contact Info */}
            {tender.owner && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Informations de contact
                </Typography>
                
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {auth.user?.firstName?.charAt(0) || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {auth.user?.firstName} {auth.user?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Créateur de l'appel d'offres
                    </Typography>
                  </Box>
                </Stack>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Iconify icon="eva:message-circle-fill" />}
                >
                  Contacter les prestataires
                </Button>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
