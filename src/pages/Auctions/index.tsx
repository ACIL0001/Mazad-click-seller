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
import { Auction, AUCTION_TYPE, BID_STATUS } from '../../types/Auction';
import Breadcrumb from '@/components/Breadcrumbs';
import { AuctionsAPI } from '@/api/auctions';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function Auctions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const COLUMNS = [
    { id: 'title', label: t('title'), alignRight: false, searchable: true, sortable: true },
    { id: 'bidType', label: t('type'), alignRight: false, searchable: false },
    { id: 'auctionType', label: t('mode'), alignRight: false, searchable: false },
    { id: 'startingPrice', label: t('startingPrice'), alignRight: false, searchable: false, sortable: true },
    { id: 'currentPrice', label: t('currentPrice'), alignRight: false, searchable: false, sortable: true },
    { id: 'endingAt', label: t('endsAt'), alignRight: false, searchable: false, sortable: true },
    { id: 'status', label: t('status'), alignRight: false, searchable: false },
    { id: 'actions', label: '', alignRight: true, searchable: false }
  ];
  const { enqueueSnackbar } = useSnackbar();
  
  const [auctions, setAuctions] = useState<Auction[]>([]);
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
    AuctionsAPI.getAuctions()
        .then((response) => {
            if (response && Array.isArray(response)) {
                setAuctions(response);
                console.log("auctions", response);
            } else if (response && response.data && Array.isArray(response.data)) {
                setAuctions(response.data);
                console.log("auctions", response.data);
            } else {
                console.error("Unexpected response format:", response);
                enqueueSnackbar('Format de réponse inattendu.', { variant: 'error' });
            }
        })
        .catch((e) => {
            console.error("Error fetching auctions:", e);
            enqueueSnackbar('Chargement échoué.', { variant: 'error' });
        })
        .finally(() => setLoading(false));
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

  const getAuctionTypeLabel = (type: AUCTION_TYPE) => {
    switch (type) {
      case AUCTION_TYPE.CLASSIC:
        return 'Classique';
      case AUCTION_TYPE.EXPRESS:
        return 'Express (MEZROUB)';
      case AUCTION_TYPE.AUTO_SUB_BID:
        return 'Automatique';
      default:
        return type;
    }
  };

  const getAuctionTypeColor = (type: AUCTION_TYPE) => {
    switch (type) {
      case AUCTION_TYPE.CLASSIC:
        return 'default';
      case AUCTION_TYPE.EXPRESS:
        return 'warning';
      case AUCTION_TYPE.AUTO_SUB_BID:
        return 'info';
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
          const { _id, title, bidType, auctionType, startingPrice, currentPrice, endingAt, status } = row;

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
                  {translateBackendData(t, 'bidType', bidType, bidType === 'PRODUCT' ? 'Product' : 'Service')}
                </Label>
              </TableCell>
              <TableCell align="left">
                <Label variant="ghost" color={getAuctionTypeColor(auctionType)}>
                  {translateBackendData(t, 'auctionType', auctionType, getAuctionTypeLabel(auctionType))}
                </Label>
              </TableCell>
              <TableCell align="left">{startingPrice.toFixed(2)} DA</TableCell>
              <TableCell align="left">{currentPrice.toFixed(2)} DA</TableCell>
              <TableCell align="left">{formatDate(endingAt)}</TableCell>
              <TableCell align="left">
                <Chip
                  label={translateBackendData(t, 'auctionStatus', status, status === BID_STATUS.OPEN ? 'OPEN' : status)}
                  color={getStatusColor(status)}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <Button
                  component={RouterLink}
                  to={`/dashboard/auctions/${_id}`}
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
    <Page title={t('navigation.auctions')}>
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
            {t('navigation.auctions')}
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/dashboard/auctions/create"
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, sm: 1 }
            }}
          >
            {t('newAuction')}
          </Button>
        </Stack>

        <Stack mb={3}>
          <Breadcrumb />
        </Stack>
        
        {auctions && (
          <ResponsiveTable
            data={auctions}
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
            onRowClick={(row) => navigate(`/dashboard/auctions/${row._id}`)}
          />
        )}
      </Container>
    </Page>
  );
}
