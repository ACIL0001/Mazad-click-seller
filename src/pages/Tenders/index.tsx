import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { translateBackendData } from '../../utils/translateBackendData';
// material
import {
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  Chip,
} from '@mui/material';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import { useSnackbar } from 'notistack';
import ResponsiveTable from '../../components/Tables/ResponsiveTable';
import { useTheme } from '@mui/material/styles';
// types
import { Tender, TENDER_AUCTION_TYPE, TENDER_STATUS } from '../../types/Tender';
import Breadcrumb from '@/components/Breadcrumbs';
import { TendersAPI } from '@/api/tenders';

// ----------------------------------------------------------------------

export default function Tenders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const COLUMNS = [
    { id: 'title', label: t('title'), alignRight: false, searchable: true, sortable: true },
    { id: 'tenderType', label: t('type'), alignRight: false, searchable: false },
    { id: 'auctionType', label: t('mode'), alignRight: false, searchable: false },
    { id: 'maxBudget', label: 'Budget Max', alignRight: false, searchable: false, sortable: true },
    { id: 'currentLowestBid', label: 'Offre Actuelle', alignRight: false, searchable: false, sortable: true },
    { id: 'endingAt', label: t('endsAt'), alignRight: false, searchable: false, sortable: true },
    { id: 'status', label: t('status'), alignRight: false, searchable: false },
    { id: 'actions', label: '', alignRight: true, searchable: false }
  ];
  const { enqueueSnackbar } = useSnackbar();
  
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('endingAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    get()
    let y = setInterval(() => {
      get();
    }, 5000);
    return () => {
      clearInterval(y);
     }
  }, []);

  const get = () => {
    setLoading(true);
    TendersAPI.getTenders()
        .then((response) => {
            if (response && Array.isArray(response)) {
                setTenders(response);
                console.log("tenders", response);
            } else if (response && response.data && Array.isArray(response.data)) {
                setTenders(response.data);
                console.log("tenders", response.data);
            } else {
                console.error("Unexpected response format:", response);
                setTenders([]); // Set empty array instead of showing error
                console.log("No tenders found, showing empty list");
            }
        })
        .catch((e) => {
            console.error("Error fetching tenders:", e);
            setTenders([]); // Set empty array to show empty state
            
            // Handle specific error types
            if (e.response?.status === 401) {
                enqueueSnackbar('Session expirée. Veuillez vous reconnecter.', { variant: 'warning' });
            } else if (e.response?.status === 403) {
                enqueueSnackbar('Vous devez être connecté en tant que vendeur pour accéder aux appels d\'offres.', { variant: 'warning' });
            } else if (e.response?.data?.message) {
                enqueueSnackbar(`Erreur: ${e.response.data.message}`, { variant: 'error' });
            } else {
                enqueueSnackbar('Impossible de charger les appels d\'offres. Veuillez réessayer.', { variant: 'error' });
            }
        })
        .finally(() => setLoading(false));
};

  const getStatusColor = (status: TENDER_STATUS) => {
    switch (status) {
      case TENDER_STATUS.OPEN:
        return 'info';
      case TENDER_STATUS.AWARDED:
        return 'success';
      case TENDER_STATUS.CLOSED:
        return 'error';
      case TENDER_STATUS.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getAuctionTypeLabel = (type: TENDER_AUCTION_TYPE) => {
    switch (type) {
      case TENDER_AUCTION_TYPE.CLASSIC:
        return 'Classique';
      case TENDER_AUCTION_TYPE.EXPRESS:
        return 'Express';
      default:
        return type;
    }
  };

  const getAuctionTypeColor = (type: TENDER_AUCTION_TYPE) => {
    switch (type) {
      case TENDER_AUCTION_TYPE.CLASSIC:
        return 'default';
      case TENDER_AUCTION_TYPE.EXPRESS:
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const TableBodyComponent = ({ data = [] }) => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    return (
      <TableBody>
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
          const { _id, title, tenderType, auctionType, maxBudget, currentLowestBid, endingAt, status } = row;

          return (
            <TableRow
              hover
              key={_id}
              tabIndex={-1}
            >
              <TableCell component="th" scope="row" padding="none" sx={{ pl: 2 }}>
                <Typography variant="subtitle2" noWrap>
                  {title}
                </Typography>
              </TableCell>
              <TableCell align="left">
                <Label variant="ghost" color="default">
                  {translateBackendData(t, 'tenderType' as any, tenderType, tenderType === 'PRODUCT' ? 'Product' : 'Service')}
                </Label>
              </TableCell>
              <TableCell align="left">
                <Label variant="ghost" color={getAuctionTypeColor(auctionType)}>
                  {translateBackendData(t, 'tenderAuctionType' as any, auctionType, getAuctionTypeLabel(auctionType))}
                </Label>
              </TableCell>
              <TableCell align="left">{maxBudget.toFixed(2)} DA</TableCell>
              <TableCell align="left">{currentLowestBid.toFixed(2)} DA</TableCell>
              <TableCell align="left">{formatDate(endingAt)}</TableCell>
              <TableCell align="left">
                <Chip
                  label={translateBackendData(t, 'tenderStatus' as any, status, status === TENDER_STATUS.OPEN ? 'OPEN' : status)}
                  color={getStatusColor(status)}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <Button
                  component={RouterLink}
                  to={`/dashboard/tenders/${_id}`}
                  size="small"
                  variant="outlined"
                >
                  {t('view')}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
        {emptyRows > 0 && (
          <TableRow style={{ height: 53 * emptyRows }}>
            <TableCell colSpan={8} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <Page title="Appels d'Offres">
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          justifyContent="space-between" 
          mb={{ xs: 3, sm: 4, md: 5 }}
          spacing={{ xs: 2, sm: 0 }}
        >
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Appels d'Offres
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/dashboard/tenders/create"
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, sm: 1 }
            }}
          >
            Nouvel Appel d'Offres
          </Button>
        </Stack>

        <Stack mb={3}>
          <Breadcrumb />
        </Stack>
        
        {tenders.length === 0 && !loading ? (
          <Stack 
            spacing={3} 
            alignItems="center" 
            justifyContent="center" 
            sx={{ 
              py: 8, 
              textAlign: 'center',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <Iconify 
              icon="mdi:file-document-multiple-outline" 
              width={80} 
              height={80} 
              sx={{ color: 'text.secondary', opacity: 0.5 }}
            />
            <Typography variant="h5" color="text.secondary">
              Aucun appel d'offres pour le moment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              Vous n'avez pas encore créé d'appels d'offres. Créez votre premier appel d'offres pour commencer à recevoir des propositions.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/dashboard/tenders/create"
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{ px: 4, py: 1.5 }}
            >
              Créer mon premier appel d'offres
            </Button>
          </Stack>
        ) : (
          <ResponsiveTable
            data={tenders}
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
            searchFields={['title']}
            selected={selected}
            setSelected={setSelected}
            onRowClick={(row) => navigate(`/dashboard/tenders/${row._id}`)}
          />
        )}
      </Container>
    </Page>
  );
}