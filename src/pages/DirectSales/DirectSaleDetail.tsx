import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Page from '../../components/Page';
import Label from '../../components/Label';
import Breadcrumb from '@/components/Breadcrumbs';
import Iconify from '@/components/Iconify';
import { DirectSaleAPI } from '@/api/direct-sale';
import { useSnackbar } from 'notistack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

interface DirectSale {
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  status: 'ACTIVE' | 'SOLD_OUT' | 'INACTIVE';
  owner?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    avatar?: { url: string };
  };
  productCategory?: {
    _id: string;
    name: string;
  };
  productSubCategory?: {
    _id: string;
    name: string;
  };
  wilaya: string;
  location: string;
  thumbs?: Array<{ url: string; _id: string; filename?: string }>;
  videos?: Array<{ url: string; _id: string; filename?: string }>;
  isPro?: boolean;
  hidden?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Purchase {
  _id: string;
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    username?: string;
    email: string;
    phone?: string;
    avatar?: { url: string };
  };
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

export default function DirectSaleDetail() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [directSale, setDirectSale] = useState<DirectSale | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDirectSale();
      fetchPurchases();
    }
  }, [id]);

  const fetchDirectSale = async () => {
    try {
      setLoading(true);
      const data = await DirectSaleAPI.getDirectSaleById(id!);
      setDirectSale(data);
    } catch (error: any) {
      console.error('Error fetching direct sale:', error);
      enqueueSnackbar('Erreur lors du chargement de la vente directe', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    setPurchasesLoading(true);
    try {
      const response = await DirectSaleAPI.getPurchasesByDirectSale(id!);
      let purchasesData: Purchase[] = [];
      
      if (response) {
        if (Array.isArray(response.data)) {
          purchasesData = response.data;
        } else if (Array.isArray(response)) {
          purchasesData = response;
        } else {
          purchasesData = [];
        }
      }
      
      setPurchases(purchasesData);
    } catch (error: any) {
      console.error('Error fetching purchases:', error);
      enqueueSnackbar('Erreur lors du chargement des commandes', { variant: 'error' });
      setPurchases([]);
    } finally {
      setPurchasesLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalRevenue = () => {
    return purchases
      .filter(p => p.status === 'CONFIRMED')
      .reduce((sum, p) => sum + p.totalPrice, 0);
  };

  const getTotalQuantitySold = () => {
    return purchases
      .filter(p => p.status === 'CONFIRMED')
      .reduce((sum, p) => sum + p.quantity, 0);
  };

  const getAveragePurchaseValue = () => {
    const confirmedPurchases = purchases.filter(p => p.status === 'CONFIRMED');
    if (confirmedPurchases.length === 0) return 0;
    return getTotalRevenue() / confirmedPurchases.length;
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'SOLD_OUT':
        return 'warning';
      case 'INACTIVE':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'SOLD_OUT':
        return 'Épuisé';
      case 'INACTIVE':
        return 'Inactif';
      default:
        return status;
    }
  };

  const getPurchaseStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'REFUNDED':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Page title="Détails de la vente directe">
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    );
  }

  if (!directSale) {
    return (
      <Page title="Vente directe introuvable">
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Typography variant="h6">Vente directe introuvable</Typography>
          </Box>
        </Container>
      </Page>
    );
  }

  const totalRevenue = getTotalRevenue();
  const totalQuantitySold = getTotalQuantitySold();
  const averagePurchaseValue = getAveragePurchaseValue();
  const availableQuantity = directSale.quantity === 0 ? 'Illimité' : directSale.quantity - totalQuantitySold;

  return (
    <Page title={`Détails - ${directSale.title}`}>
      <Container maxWidth="xl">
        <Breadcrumb links={[
          { name: 'Ventes Directes', href: '/dashboard/direct-sales' },
          { name: directSale.title }
        ]} />

        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Détails de la vente
          </Typography>
          <Chip
            label={getStatusLabel(directSale.status)}
            color={getStatusColor(directSale.status) as any}
            variant="filled"
            size="medium"
          />
        </Stack>

        <Grid container spacing={3}>
          {/* Main Direct Sale Info */}
          <Grid item xs={12} md={8}>
            {/* Images Section */}
            {directSale.thumbs && directSale.thumbs.length > 0 && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Images
                </Typography>
                <Grid container spacing={2}>
                  {directSale.thumbs.map((thumb, index) => (
                    <Grid item xs={12} sm={6} md={4} key={thumb._id || index}>
                      <Box
                        component="img"
                        src={getImageUrl(thumb.url)}
                        alt={`${directSale.title} - Image ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                        onClick={() => window.open(getImageUrl(thumb.url), '_blank')}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            )}

            {/* Product Details */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                {directSale.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {directSale.description}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Prix
                  </Typography>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                    {directSale.price.toLocaleString()} DA
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Quantité disponible
                  </Typography>
                  <Typography variant="h6">
                    {availableQuantity}
                    {directSale.quantity !== 0 && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        sur {directSale.quantity}
                      </Typography>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            {/* Seller Information */}
            {directSale.owner && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Informations du vendeur
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar 
                    src={directSale.owner.avatar?.url ? getImageUrl(directSale.owner.avatar.url) : undefined}
                    sx={{ width: 56, height: 56 }}
                  >
                    {(directSale.owner.firstName || directSale.owner.username || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {directSale.owner.firstName && directSale.owner.lastName 
                        ? `${directSale.owner.firstName} ${directSale.owner.lastName}`
                        : directSale.owner.username || 'Utilisateur'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {directSale.owner.email}
                    </Typography>
                    {directSale.owner.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {directSale.owner.phone}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Purchase Statistics */}
            {purchases.length > 0 && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon /> Statistiques des ventes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'success.lighter',
                        border: '1px solid',
                        borderColor: 'success.light',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Revenu total
                      </Typography>
                      <Typography variant="h5" color="success.dark" fontWeight={700}>
                        {totalRevenue.toLocaleString()} DA
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'info.lighter',
                        border: '1px solid',
                        borderColor: 'info.light',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Quantité vendue
                      </Typography>
                      <Typography variant="h5" color="info.dark" fontWeight={700}>
                        {totalQuantitySold}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'primary.lighter',
                        border: '1px solid',
                        borderColor: 'primary.light',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Panier moyen
                      </Typography>
                      <Typography variant="h5" color="primary.dark" fontWeight={700}>
                        {averagePurchaseValue.toFixed(0)} DA
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Card>
            )}

            {/* Purchases Table */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon /> Commandes ({purchases.length})
              </Typography>
              {purchasesLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60px">
                  <CircularProgress size={24} />
                </Box>
              ) : purchases.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.neutral' }}>
                        <TableCell>Acheteur</TableCell>
                        <TableCell align="right">Quantité</TableCell>
                        <TableCell align="right">Prix total</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow
                          key={purchase._id}
                          sx={{
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: purchase.status === 'CONFIRMED' ? 'success.lighter' : 'inherit'
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar 
                                src={purchase.buyer.avatar?.url ? getImageUrl(purchase.buyer.avatar.url) : undefined}
                                alt={purchase.buyer.firstName}
                              >
                                {purchase.buyer.firstName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {purchase.buyer.firstName} {purchase.buyer.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {purchase.buyer.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              {purchase.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
                              label={`${purchase.totalPrice.toLocaleString()} DA`}
                              color={purchase.status === 'CONFIRMED' ? 'success' : 'default'}
                              variant={purchase.status === 'CONFIRMED' ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={purchase.status === 'CONFIRMED' ? 'Confirmé' : 
                                     purchase.status === 'PENDING' ? 'En attente' :
                                     purchase.status === 'CANCELLED' ? 'Annulé' : 'Remboursé'}
                              size="small"
                              color={getPurchaseStatusColor(purchase.status) as any}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(purchase.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'background.neutral',
                    borderRadius: 2
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Aucune commande pour le moment
                  </Typography>
                </Paper>
              )}
            </Card>
          </Grid>

          {/* Sidebar Information */}
          <Grid item xs={12} md={4}>
            {/* Category Information */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Catégories
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Catégorie principale
                  </Typography>
                  <Label variant="ghost" color="primary">
                    {directSale.productCategory?.name || 'Non spécifiée'}
                  </Label>
                </Box>
                {directSale.productSubCategory && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Sous-catégorie
                    </Typography>
                    <Label variant="ghost" color="secondary">
                      {directSale.productSubCategory.name}
                    </Label>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type de vendeur
                  </Typography>
                  <Label variant="ghost" color={directSale.isPro ? 'warning' : 'success'}>
                    {directSale.isPro ? 'Professionnel' : 'Particulier'}
                  </Label>
                </Box>
              </Stack>
            </Card>

            {/* Location Information */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Localisation
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Wilaya
                  </Typography>
                  <Typography variant="body1">{directSale.wilaya || 'Non spécifiée'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Adresse
                  </Typography>
                  <Typography variant="body1">{directSale.location || 'Non spécifiée'}</Typography>
                </Box>
              </Stack>
            </Card>

            {/* Timeline */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Chronologie
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Créé le
                  </Typography>
                  <Typography variant="body1">{formatDate(directSale.createdAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Modifié le
                  </Typography>
                  <Typography variant="body1">{formatDate(directSale.updatedAt)}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}