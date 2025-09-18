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
} from '@mui/material';
// components
import Page from '../../components/Page';
import { useSnackbar } from 'notistack';
import MuiTable from '../../components/Tables/MuiTable';
import { useTheme } from '@mui/material/styles';
import Breadcrumb from '@/components/Breadcrumbs';
import { OffersAPI } from '@/api/offers';
import { Offer } from '@/types/Offer';
import useAuth from '@/hooks/useAuth';

// ----------------------------------------------------------------------

// Extended Offer interface with a more complete bid type definition
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
}

export default function Offers() {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const COLUMNS = [
    { id: 'user', label: t('common.user'), alignRight: false, searchable: true, sortable: true },
    { id: 'tel', label: t('common.phone'), alignRight: false, searchable: true, sortable: true },
    { id: 'bidTitle', label: t('navigation.auctions'), alignRight: false, searchable: true, sortable: true },
    { id: 'price', label: t('common.price'), alignRight: false, searchable: false, sortable: true },
    { id: 'status', label: t('common.status'), alignRight: false, searchable: false, sortable: true },
    { id: 'createdAt', label: t('common.date'), alignRight: false, searchable: false, sortable: true },
    { id: 'actions', label: '', alignRight: true, searchable: false, sortable: false }
  ];

  const { enqueueSnackbar } = useSnackbar();
  const { auth } = useAuth();
  const [offers, setOffers] = useState<ExtendedOffer[]>([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth?.user?._id) {
      getOffers();
    }
  }, [auth?.user?._id]);

  const getOffers = async () => {
    if (!auth?.user?._id) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = { _id: auth.user._id };
      console.log("Fetching offers for user:", data);
      
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
      
    } catch (error) {
      console.error("Error fetching offers:", error);
      const errorMessage = error?.response?.data?.message || 'Error loading offers';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
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
      return (
        <Chip 
          label={t('common.expired')} 
          size="small" 
          color="error" 
          variant="outlined"
        />
      );
    }
    
    if (isActive) {
      return (
        <Chip 
          label={t('common.active')} 
          size="small" 
          color="success" 
          variant="outlined"
        />
      );
    }
    
    return (
      <Chip 
        label={t('common.pending')} 
        size="small" 
        color="warning" 
        variant="outlined"
      />
    );
  };

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
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <TableCell component="th" scope="row" padding="none" sx={{ pl: 2 }}>
                <Stack direction="column" spacing={0.5}>
                  <Typography variant="subtitle2" noWrap fontWeight={500}>
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username || 'N/A'
                    }
                  </Typography>
                  {user?.email && (
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              
              <TableCell align="left">
                <Typography variant="body2">
                  {user?.phone || 'N/A'}
                </Typography>
              </TableCell>
              
              <TableCell align="left">
                <Stack direction="column" spacing={0.5}>
                  <Typography variant="subtitle2" noWrap>
                    {bid?.title || 'N/A'}
                  </Typography>
                  {bid?.category && (
                    <Typography variant="caption" color="text.secondary">
                      {bid.category}
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              
              <TableCell align="left">
                <Typography variant="subtitle2" fontWeight={600}>
                  {formatPrice(price)}
                </Typography>
              </TableCell>
              
              <TableCell align="left">
                {getOfferStatusChip(row)}
              </TableCell>
              
              <TableCell align="left">
                <Typography variant="body2" color="text.secondary">
                  {formatDate(createdAt)}
                </Typography>
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
          <Typography variant="body1" sx={{ mt: 2 }}>
            {t('offers.loadingOffers')}
          </Typography>
        </Stack>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={getOffers}
              variant="outlined"
            >
              {t('common.retry')}
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

    return (
      <MuiTable
        data={offers}
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
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            {t('offers.myOffers')}
          </Typography>
          
          <Button
            variant="outlined"
            onClick={getOffers}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading ? t('common.refreshing') : t('common.refresh')}
          </Button>
        </Stack>

        <Stack mb={3}>
          <Breadcrumb />
        </Stack>
        {renderContent()}
      </Container>
    </Page>
  );
}
