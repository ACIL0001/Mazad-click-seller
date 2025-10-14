import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// material
import {
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  CircularProgress,
  Chip,
  Alert,
  Box,
  Tabs,
  Tab,
  Card,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
// components
import Page from '../../components/Page';
import { useSnackbar } from 'notistack';
import MuiTable from '../../components/Tables/MuiTable';
import { alpha, useTheme } from '@mui/material/styles';
import Breadcrumb from '@/components/Breadcrumbs';
import { OffersAPI } from '@/api/offers';
import { Offer } from '@/types/Offer';
import useAuth from '@/hooks/useAuth';

// Extended Offer interface
interface Bid {
  _id: string;
  title: string;
  currentPrice: number;
  status: 'active' | 'pending' | 'expired' | 'completed';
  endDate: string;
  category?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phone: string;
}

interface ExtendedOffer extends Offer {
  bid: Bid;
  user: User;
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export default function Offers() {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const COLUMNS = [
    { id: 'user', label: t('user'), alignRight: false, searchable: true, sortable: true },
    { id: 'tel', label: t('phone'), alignRight: false, searchable: true, sortable: true },
    { id: 'bidTitle', label: t('navigation.auctions'), alignRight: false, searchable: true, sortable: true },
    { id: 'price', label: t('price'), alignRight: false, searchable: false, sortable: true },
    { id: 'status', label: t('status'), alignRight: false, searchable: false, sortable: true },
    { id: 'createdAt', label: t('date'), alignRight: false, searchable: false, sortable: true },
    { id: 'actions', label: '', alignRight: true, searchable: false, sortable: false }
  ];

  const { enqueueSnackbar } = useSnackbar();
  const { auth, isLogged } = useAuth();
  const [offers, setOffers] = useState<ExtendedOffer[]>([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'received' | 'my'>('received');

  useEffect(() => {
    // Debug auth state
    console.log('🔍 Offers: Auth state', {
      isLogged,
      hasUser: !!auth?.user,
      hasToken: !!auth?.tokens?.accessToken,
      userId: auth?.user?._id
    });

    // Wait for auth to be ready and user to be logged in
    if (isLogged && auth?.user?._id && auth?.tokens?.accessToken) {
      console.log('Offers: Auth ready, fetching offers');
      getOffers();
    } else {
      console.log('Offers: Waiting for auth', { isLogged, hasUser: !!auth?.user, hasToken: !!auth?.tokens?.accessToken });
    }
  }, [isLogged, auth?.user?._id, auth?.tokens?.accessToken]);

  const getOffers = async (forceRefresh = false) => {
    if (!isLogged || !auth?.user?._id || !auth?.tokens?.accessToken) {
      console.warn('Offers: Cannot fetch - auth not ready');
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = { _id: auth.user._id };
      console.log("Fetching offers for user:", data, forceRefresh ? "(force refresh)" : "");
      
      const response = await OffersAPI.getOffers({ data });
      console.log("API Response:", response);
      
      let offersData: ExtendedOffer[] = [];
      
      if (Array.isArray(response)) {
        offersData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        offersData = response.data;
      } else if (response?.offers && Array.isArray(response.offers)) {
        offersData = response.offers;
      } else {
        console.warn("Unexpected response format:", response);
        offersData = [];
      }
      
      setOffers(offersData);
      console.log(`${offersData.length} offers loaded successfully`);
      
      if (offersData.length === 0) {
        enqueueSnackbar('No offers found', { variant: 'info' });
      }
      
    } catch (error: any) {
      console.error("Error fetching offers:", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error loading offers';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    getOffers(true);
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      setLoading(true);
      console.log('Accepting offer:', offerId);
      
      const response = await OffersAPI.acceptOffer(offerId);
      console.log('Offer accepted:', response);
      
      enqueueSnackbar('Offre acceptée avec succès!', { variant: 'success' });
      getOffers(true);
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'acceptation de l\'offre.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      setLoading(true);
      console.log('Rejecting offer:', offerId);
      
      const response = await OffersAPI.rejectOffer(offerId);
      console.log('Offer rejected:', response);
      
      enqueueSnackbar('Offre refusée.', { variant: 'info' });
      getOffers(true);
    } catch (error: any) {
      console.error('Error rejecting offer:', error);
      enqueueSnackbar('Erreur lors du refus de l\'offre.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      setLoading(true);
      await OffersAPI.deleteOffer(offerId);
      enqueueSnackbar('Offre supprimée avec succès', { variant: 'success' });
      getOffers(true);
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      enqueueSnackbar('Erreur lors de la suppression de l\'offre.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selected || selected.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(selected.map((id) => OffersAPI.deleteOffer(id)));
      enqueueSnackbar(`${selected.length} offre(s) supprimée(s)`, { variant: 'success' });
      setSelected([]);
      getOffers(true);
    } catch (error: any) {
      console.error('Error bulk deleting offers:', error);
      enqueueSnackbar('Erreur lors de la suppression multiple.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number') return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getOfferStatusChip = (offer: ExtendedOffer) => {
    const isActive = offer.bid?.status === 'active';
    const isExpired = offer.bid?.endDate && new Date(offer.bid.endDate) < new Date();
    
    if (isExpired) {
      return <Chip label={t('expired')} size="small" color="error" variant="outlined" />;
    }
    if (isActive) {
      return <Chip label={t('active')} size="small" color="success" variant="outlined" />;
    }
    return <Chip label={t('pending')} size="small" color="warning" variant="outlined" />;
  };

  // Filter offers based on current tab
  const getFilteredOffers = () => {
    if (!offers || offers.length === 0) return [];
    
    const currentUserId = auth?.user?._id;
    if (!currentUserId) return [];
    
    if (filterTab === 'received') {
      // Show offers made by other users (received offers)
      return offers.filter(offer => offer.user._id !== currentUserId);
    } else {
      // Show offers made by current user (my offers)
      return offers.filter(offer => offer.user._id === currentUserId);
    }
  };

  const filteredOffers = getFilteredOffers();

  const TableBodyComponent = ({ data = [] }) => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    return (
      <TableBody>
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: ExtendedOffer) => {
          const { _id, user, price, createdAt, bid } = row;

          return (
            <TableRow
              hover
              key={_id}
              tabIndex={-1}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
            >
              <TableCell component="th" scope="row" padding="none" sx={{ pl: 2 }}>
                <Stack direction="column" spacing={0.5}>
                  <Typography variant="subtitle2" noWrap fontWeight={500}>
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username || 'N/A'}
                  </Typography>
                  {user?.email && (
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  )}
                </Stack>
              </TableCell>
              
              <TableCell align="left">
                <Typography variant="body2">{user?.phone || 'N/A'}</Typography>
              </TableCell>
              
              <TableCell align="left">
                <Stack direction="column" spacing={0.5}>
                  <Typography variant="subtitle2" noWrap>{bid?.title || 'N/A'}</Typography>
                  {bid?.category && (
                    <Typography variant="caption" color="text.secondary">{bid.category}</Typography>
                  )}
                </Stack>
              </TableCell>
              
              <TableCell align="left">
                <Typography variant="subtitle2" fontWeight={600}>{formatPrice(price)}</Typography>
              </TableCell>
              
              <TableCell align="left">{getOfferStatusChip(row)}</TableCell>
              
              <TableCell align="left">
                <Typography variant="body2" color="text.secondary">{formatDate(createdAt)}</Typography>
              </TableCell>
              
              <TableCell align="right">
                <Stack direction="row" spacing={1}>
                  {bid?._id && (
                    <Button
                      component={RouterLink}
                      to={`/dashboard/auctions/${bid._id}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    >
                      {t('auctions.viewAuction')}
                    </Button>
                  )}
                  
                  {filterTab === 'received' ? (
                    // Actions for received offers (offers made by others)
                    <>
                      {(row.status || 'PENDING') === 'PENDING' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleAcceptOffer(_id)}
                            disabled={loading}
                          >
                            Accepter
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRejectOffer(_id)}
                            disabled={loading}
                          >
                            Refuser
                          </Button>
                        </>
                      )}
                      
                      {(row.status || 'PENDING') !== 'PENDING' && (
                        <Chip
                          label={(row.status || 'PENDING') === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}
                          color={(row.status || 'PENDING') === 'ACCEPTED' ? 'success' : 'error'}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </>
                  ) : (
                    // Actions for my offers (offers made by current user)
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteOffer(_id)}
                      disabled={loading}
                    >
                      Supprimer
                    </Button>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          );
        })}
        
        {emptyRows > 0 && (
          <TableRow style={{ height: 53 * emptyRows }}>
            <TableCell colSpan={COLUMNS.length} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ mt: 2 }}>{t('offers.loadingOffers')}</Typography>
        </Stack>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh} variant="outlined">
              {t('retry')}
            </Button>
          }
        >
          {error}
        </Alert>
      );
    }

    if (!offers || offers.length === 0) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('offers.noOffersFound')}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t('offers.noOffersDescription')}
          </Typography>
        </Stack>
      );
    }

    if (filteredOffers.length === 0) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {filterTab === 'received' ? 'Aucune offre reçue' : 'Aucune offre faite'}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {filterTab === 'received' 
              ? 'Vous n\'avez reçu aucune offre pour le moment.' 
              : 'Vous n\'avez fait aucune offre pour le moment.'}
          </Typography>
        </Stack>
      );
    }

    return (
      <MuiTable
        data={filteredOffers}
        columns={COLUMNS}
        page={page}
        setPage={setPage}
        order={order}
        setOrder={setOrder}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        filterName={filterName}
        setFilterName={setFilterName}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        TableBody={TableBodyComponent}
        searchFields={['user.firstName', 'user.lastName', 'user.phone', 'bid.title']}
        selected={selected}
        setSelected={setSelected}
      />
    );
  };

  return (
    <Page title={t('navigation.offers')}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box
          sx={{
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            mb: { xs: 3, sm: 4, md: 5 },
            background: theme.palette.mode === 'light'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.02)})`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.primary.main, 0.06)})`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'stretch', sm: 'center' }} 
            justifyContent="space-between" 
            spacing={{ xs: 2, sm: 2 }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
              <Typography variant="h4" sx={{ m: 0 }}>
                {filterTab === 'received' ? 'Offres reçues' : 'Mes offres'}
              </Typography>
              {selected.length > 0 && filterTab === 'my' && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleBulkDelete}
                  disabled={loading}
                  sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                >
                  Supprimer la sélection ({selected.length})
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={handleRefresh}
                disabled={loading}
                startIcon={<RefreshIcon />}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Actualiser
              </Button>
            </Stack>
            
            <Button
              variant="outlined"
              onClick={handleRefresh}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              {loading ? t('refreshing') : t('refresh')}
            </Button>
          </Stack>
        </Box>

        <Stack mb={3}>
          <Breadcrumb />
        </Stack>

        {/* Filter Tabs */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={filterTab}
            onChange={(event, newValue) => {
              setFilterTab(newValue);
              setPage(0); // Reset to first page when switching tabs
              setSelected([]); // Clear selection when switching tabs
            }}
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '16px',
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <Tab 
              label={`Offre reçue (${offers.filter(offer => offer.user._id !== auth?.user?._id).length})`} 
              value="received" 
            />
            <Tab 
              label={`Mon offre (${offers.filter(offer => offer.user._id === auth?.user?._id).length})`} 
              value="my" 
            />
          </Tabs>
        </Card>

        {renderContent()}
      </Container>
    </Page>
  );
}