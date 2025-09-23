import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Chip,
  Avatar,
  Box,
} from '@mui/material';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import { useSnackbar } from 'notistack';
import ResponsiveTable from '../../components/Tables/ResponsiveTable';
import { useTheme } from '@mui/material/styles';
// types
import { TenderBid, TenderBidStatus } from '../../types/Tender';
import Breadcrumb from '@/components/Breadcrumbs';
import { TendersAPI } from '@/api/tenders';
import useAuth from '@/hooks/useAuth';

export default function TenderBids() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { auth } = useAuth();
  
  const COLUMNS = [
    { id: 'bidder', label: 'Prestataire', alignRight: false, searchable: true, sortable: true },
    { id: 'tender', label: 'Appel d\'Offres', alignRight: false, searchable: true, sortable: true },
    { id: 'bidAmount', label: 'Montant', alignRight: false, searchable: false, sortable: true },
    { id: 'deliveryTime', label: 'Délai', alignRight: false, searchable: false, sortable: true },
    { id: 'createdAt', label: 'Date', alignRight: false, searchable: false, sortable: true },
    { id: 'status', label: 'Statut', alignRight: false, searchable: false },
    { id: 'actions', label: '', alignRight: true, searchable: false }
  ];
  const { enqueueSnackbar } = useSnackbar();
  
  const [tenderBids, setTenderBids] = useState<TenderBid[]>([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    get();
  }, []);

  const get = () => {
    if (!auth?.user?._id) return;
    
    setLoading(true);
    TendersAPI.getTenderBidsByOwner(auth.user._id)
      .then((response) => {
        if (response && Array.isArray(response)) {
          setTenderBids(response);
          console.log("tender bids", response);
        } else {
          console.error("Unexpected response format:", response);
          enqueueSnackbar('Format de réponse inattendu.', { variant: 'error' });
        }
      })
      .catch((e) => {
        console.error("Error fetching tender bids:", e);
        enqueueSnackbar('Chargement échoué.', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  };

  const getStatusColor = (status: TenderBidStatus) => {
    switch (status) {
      case TenderBidStatus.PENDING:
        return 'warning';
      case TenderBidStatus.ACCEPTED:
        return 'success';
      case TenderBidStatus.DECLINED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: TenderBidStatus) => {
    switch (status) {
      case TenderBidStatus.PENDING:
        return 'En attente';
      case TenderBidStatus.ACCEPTED:
        return 'Acceptée';
      case TenderBidStatus.DECLINED:
        return 'Refusée';
      default:
        return status;
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
          const { _id, bidder, tender, bidAmount, deliveryTime, createdAt, status, proposal } = row;

          return (
            <TableRow
              hover
              key={_id}
              tabIndex={-1}
            >
              <TableCell component="th" scope="row" padding="none" sx={{ pl: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {bidder?.firstName?.charAt(0) || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" noWrap>
                      {bidder?.firstName} {bidder?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {bidder?.email}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell align="left">
                <Typography variant="subtitle2" noWrap>
                  {tender?.title || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="h6" color="success.main">
                  {bidAmount.toLocaleString()} DA
                </Typography>
              </TableCell>
              <TableCell align="left">
                {deliveryTime ? `${deliveryTime} jours` : '-'}
              </TableCell>
              <TableCell align="left">{formatDate(createdAt)}</TableCell>
              <TableCell align="left">
                <Chip
                  label={getStatusLabel(status)}
                  color={getStatusColor(status)}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      // Show proposal details in modal or navigate to detail page
                      console.log('Proposal:', proposal);
                    }}
                  >
                    Voir détails
                  </Button>
                  {status === TenderBidStatus.PENDING && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => {
                          // Accept bid logic
                          console.log('Accept bid:', _id);
                        }}
                      >
                        Accepter
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          // Decline bid logic
                          console.log('Decline bid:', _id);
                        }}
                      >
                        Refuser
                      </Button>
                    </>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          );
        })}
        {emptyRows > 0 && (
          <TableRow style={{ height: 53 * emptyRows }}>
            <TableCell colSpan={7} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <Page title="Offres Reçues">
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
            Offres Reçues
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
        
        {tenderBids && (
          <ResponsiveTable
            data={tenderBids}
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
            searchFields={['bidder.firstName', 'bidder.lastName', 'tender.title']}
            selected={selected}
            setSelected={setSelected}
            onRowClick={(row) => navigate(`/dashboard/tenders/${row.tender?._id}`)}
          />
        )}
      </Container>
    </Page>
  );
}
