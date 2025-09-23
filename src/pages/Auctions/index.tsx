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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

// Define the validation errors interface
interface ValidationErrors {
  title?: string;
  description?: string;
  place?: string;
  quantity?: string;
  startingPrice?: string;
  startingAt?: string;
  endingAt?: string;
}

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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [finishedAuctions, setFinishedAuctions] = useState<Auction[]>([]);
  const [relaunchDialog, setRelaunchDialog] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [relaunchData, setRelaunchData] = useState({
    title: '',
    description: '',
    startingPrice: 0,
    startingAt: new Date(),
    endingAt: new Date(),
    auctionType: AUCTION_TYPE.CLASSIC,
    isPro: false,
    place: '',
    quantity: '',
    wilaya: '',
    attributes: [] as string[],
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [timingConfig, setTimingConfig] = useState({
    duration: 7,
    unit: 'days' as 'hours' | 'days' | 'months',
    startDelay: 5,
    startUnit: 'minutes' as 'minutes' | 'hours' | 'days',
  });

  useEffect(() => {
    get();
    getFinishedAuctions();
    let y = setInterval(() => {
      get();
      getFinishedAuctions();
    }, 5000);
    return () => {
      clearInterval(y);
     }
  }, []);

  // Auto-update timing when configuration changes
  useEffect(() => {
    if (relaunchDialog) {
      updateTiming();
    }
  }, [timingConfig, relaunchDialog]);

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

  const getFinishedAuctions = () => {
    AuctionsAPI.getFinishedAuctions()
        .then((response) => {
            console.log('Finished auctions response:', response);
            if (response && Array.isArray(response)) {
                setFinishedAuctions(response);
                console.log('Set finished auctions:', response);
            } else if (response && response.data && Array.isArray(response.data)) {
                setFinishedAuctions(response.data);
                console.log('Set finished auctions from data:', response.data);
            }
        })
        .catch((e) => {
            console.error("Error fetching finished auctions:", e);
        });
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

  const isAuctionFinished = (auction: Auction) => {
    const now = new Date();
    const endTime = new Date(auction.endingAt);
    const isTimeFinished = endTime < now;
    const isStatusClosed = auction.status === BID_STATUS.CLOSED;
    
    console.log('isAuctionFinished check:', {
      auctionId: auction._id,
      endingAt: auction.endingAt,
      endTime: endTime,
      now: now,
      isTimeFinished,
      status: auction.status,
      isStatusClosed,
      result: isTimeFinished && isStatusClosed
    });
    
    return isTimeFinished && isStatusClosed;
  };

  const calculateDates = () => {
    const now = new Date();
    
    // Calculate start delay
    let startDelayMs = 0;
    switch (timingConfig.startUnit) {
      case 'minutes':
        startDelayMs = timingConfig.startDelay * 60 * 1000;
        break;
      case 'hours':
        startDelayMs = timingConfig.startDelay * 60 * 60 * 1000;
        break;
      case 'days':
        startDelayMs = timingConfig.startDelay * 24 * 60 * 60 * 1000;
        break;
    }
    
    // Calculate duration
    let durationMs = 0;
    switch (timingConfig.unit) {
      case 'hours':
        durationMs = timingConfig.duration * 60 * 60 * 1000;
        break;
      case 'days':
        durationMs = timingConfig.duration * 24 * 60 * 60 * 1000;
        break;
      case 'months':
        durationMs = timingConfig.duration * 30 * 24 * 60 * 60 * 1000; // Approximate month as 30 days
        break;
    }
    
    const startingAt = new Date(now.getTime() + startDelayMs);
    const endingAt = new Date(startingAt.getTime() + durationMs);
    
    return { startingAt, endingAt };
  };

  const updateTiming = () => {
    const { startingAt, endingAt } = calculateDates();
    setRelaunchData(prev => ({
      ...prev,
      startingAt,
      endingAt
    }));
  };

  const handleRelaunchClick = (auction: Auction) => {
    console.log('Relaunch button clicked for auction:', auction);
    console.log('Auction status:', auction.status);
    console.log('Auction endingAt:', auction.endingAt);
    console.log('Current time:', new Date());
    console.log('Is auction finished:', isAuctionFinished(auction));
    
    setSelectedAuction(auction);
    
    // Calculate dates based on timing configuration
    const { startingAt, endingAt } = calculateDates();
    
    // Use type assertion to access optional properties safely
    const auctionAny = auction as any;
    
    setRelaunchData({
      title: auction.title,
      description: auction.description,
      startingPrice: auction.startingPrice,
      startingAt,
      endingAt,
      auctionType: auction.auctionType,
      isPro: auctionAny.isPro || false,
      place: auctionAny.place || 'Alger', // Add default place
      quantity: auctionAny.quantity || '1',
      wilaya: auctionAny.wilaya || 'Alger',
      attributes: auctionAny.attributes || [],
    });
    setRelaunchDialog(true);
  };

  const validateRelaunchData = () => {
    const errors: ValidationErrors = {};

    console.log('Validation data:', relaunchData);
    console.log('Current time:', new Date());

    if (!relaunchData.title.trim()) {
      console.log('Title validation failed');
      errors.title = 'Le titre est requis';
    }

    if (!relaunchData.description.trim()) {
      console.log('Description validation failed');
      errors.description = 'La description est requise';
    }

    if (!relaunchData.place.trim()) {
      console.log('Place validation failed');
      errors.place = 'Le lieu est requis';
    }

    if (relaunchData.startingPrice <= 0) {
      console.log('Starting price validation failed:', relaunchData.startingPrice);
      errors.startingPrice = 'Le prix de départ doit être supérieur à 0';
    }

    const now = new Date();
    if (relaunchData.startingAt < now) {
      console.log('Starting date validation failed:', {
        startingAt: relaunchData.startingAt,
        now: now,
        comparison: relaunchData.startingAt < now
      });
      errors.startingAt = 'La date de début doit être dans le futur';
    }

    if (relaunchData.endingAt <= relaunchData.startingAt) {
      console.log('Ending date validation failed:', {
        endingAt: relaunchData.endingAt,
        startingAt: relaunchData.startingAt,
        comparison: relaunchData.endingAt <= relaunchData.startingAt
      });
      errors.endingAt = 'La date de fin doit être après la date de début';
    }

    // Check minimum duration (1 hour)
    const duration = relaunchData.endingAt.getTime() - relaunchData.startingAt.getTime();
    const oneHour = 60 * 60 * 1000;
    if (duration < oneHour) {
      console.log('Duration validation failed:', {
        duration: duration,
        oneHour: oneHour,
        comparison: duration < oneHour
      });
      errors.endingAt = 'La durée de l\'enchère doit être d\'au moins 1 heure';
    }

    console.log('Validation errors:', errors);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRelaunch = () => {
    console.log('handleRelaunch called');
    console.log('selectedAuction:', selectedAuction);
    console.log('relaunchData:', relaunchData);
    
    if (!selectedAuction) {
      console.log('No selected auction, returning');
      return;
    }

    console.log('Validating relaunch data...');
    if (!validateRelaunchData()) {
      console.log('Validation failed, returning');
      return;
    }

    const relaunchPayload = {
      originalBidId: selectedAuction._id,
      ...relaunchData,
    };

    console.log('Sending relaunch payload:', relaunchPayload);

    AuctionsAPI.relaunchAuction(relaunchPayload)
      .then((response) => {
        console.log('Relaunch successful:', response);
        enqueueSnackbar('Enchère relancée avec succès!', { variant: 'success' });
        setRelaunchDialog(false);
        setSelectedAuction(null);
        setValidationErrors({});
        
        // Remove the relaunched auction from finished auctions table
        console.log('Removing auction from finished auctions table:', selectedAuction._id);
        setFinishedAuctions(prev => {
          const filtered = prev.filter(auction => auction._id !== selectedAuction._id);
          console.log('Finished auctions after removal:', filtered.length);
          return filtered;
        });
        
        get(); // Refresh active auctions
        getFinishedAuctions(); // Refresh finished auctions to get updated list
      })
      .catch((error) => {
        console.error('Error relaunching auction:', error);
        console.error('Error response:', error.response);
        console.error('Error data:', error.response?.data);
        
        let errorMessage = 'Erreur lors de la relance de l\'enchère.';
        
        if (error.response?.data?.message) {
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(', ');
          } else {
            errorMessage = error.response.data.message;
          }
        }
        
        console.log('Final error message:', errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      });
  };


  const getFilteredAuctions = () => {
    if (statusFilter === 'FINISHED') {
      return finishedAuctions;
    }
    return auctions;
  };

  const TableBodyComponent = ({ data = [] }) => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;
    console.log('TableBodyComponent rendering with data:', data);
    console.log('Status filter:', statusFilter);

    return (
      <TableBody>
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
          const { _id, title, bidType, auctionType, startingPrice, currentPrice, endingAt, status } = row;
          console.log('Rendering row:', { _id, title, status, endingAt, isFinished: isAuctionFinished(row) });

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
                <Stack direction="row" spacing={1}>
                <Button
                  component={RouterLink}
                  to={`/dashboard/auctions/${_id}`}
                  size="small"
                  variant="outlined"
                >
                  {t('view')}
                </Button>
                  {statusFilter === 'FINISHED' && isAuctionFinished(row) && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Relancer button clicked for row:', row);
                        handleRelaunchClick(row);
                      }}
                      startIcon={<Iconify icon="eva:refresh-fill" />}
                    >
                      Relancer
                    </Button>
                  )}
                </Stack>
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filtrer par statut</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filtrer par statut"
              >
                <MenuItem value="ALL">Toutes les enchères</MenuItem>
                <MenuItem value="FINISHED">Enchères terminées</MenuItem>
              </Select>
            </FormControl>
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
        </Stack>

        <Stack mb={3}>
          <Breadcrumb />
        </Stack>
        
        {getFilteredAuctions() && getFilteredAuctions().length > 0 ? (
          <ResponsiveTable
            data={getFilteredAuctions()}
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
        ) : statusFilter === 'FINISHED' ? (
          <Box textAlign="center" py={4}>
            <Iconify icon="eva:archive-fill" width={64} height={64} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Aucune enchère terminée
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vous n'avez pas encore d'enchères terminées et fermées à relancer.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/dashboard/auctions/create"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Créer une nouvelle enchère
            </Button>
          </Box>
        ) : null}

        {/* Relaunch Dialog */}
        <Dialog open={relaunchDialog} onClose={() => setRelaunchDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Relancer l'Enchère</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Titre de l'enchère"
                    value={relaunchData.title}
                    onChange={(e) => setRelaunchData({ ...relaunchData, title: e.target.value })}
                    error={!!validationErrors.title}
                    helperText={validationErrors.title}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={relaunchData.description}
                    onChange={(e) => setRelaunchData({ ...relaunchData, description: e.target.value })}
                    error={!!validationErrors.description}
                    helperText={validationErrors.description}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Lieu"
                    value={relaunchData.place}
                    onChange={(e) => setRelaunchData({ ...relaunchData, place: e.target.value })}
                    error={!!validationErrors.place}
                    helperText={validationErrors.place}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantité"
                    value={relaunchData.quantity}
                    onChange={(e) => setRelaunchData({ ...relaunchData, quantity: e.target.value })}
                    error={!!validationErrors.quantity}
                    helperText={validationErrors.quantity}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prix de départ (DA)"
                    type="number"
                    value={relaunchData.startingPrice}
                    onChange={(e) => setRelaunchData({ ...relaunchData, startingPrice: Number(e.target.value) })}
                    error={!!validationErrors.startingPrice}
                    helperText={validationErrors.startingPrice}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type d'enchère</InputLabel>
                    <Select
                      value={relaunchData.auctionType}
                      onChange={(e) => setRelaunchData({ ...relaunchData, auctionType: e.target.value as AUCTION_TYPE })}
                    >
                      <MenuItem value={AUCTION_TYPE.CLASSIC}>Classique</MenuItem>
                      <MenuItem value={AUCTION_TYPE.EXPRESS}>Express (MEZROUB)</MenuItem>
                      <MenuItem value={AUCTION_TYPE.AUTO_SUB_BID}>Automatique</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {/* Timing Configuration */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Configuration du timing
                  </Typography>
                </Grid>
                
                {/* Start Delay Configuration */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Délai de début"
                    type="number"
                    value={timingConfig.startDelay}
                    onChange={(e) => {
                      const newDelay = Number(e.target.value);
                      setTimingConfig(prev => ({ ...prev, startDelay: newDelay }));
                    }}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Unité de délai</InputLabel>
                    <Select
                      value={timingConfig.startUnit}
                      onChange={(e) => {
                        setTimingConfig(prev => ({ ...prev, startUnit: e.target.value as 'minutes' | 'hours' | 'days' }));
                      }}
                    >
                      <MenuItem value="minutes">Minutes</MenuItem>
                      <MenuItem value="hours">Heures</MenuItem>
                      <MenuItem value="days">Jours</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Duration Configuration */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Durée de l'enchère"
                    type="number"
                    value={timingConfig.duration}
                    onChange={(e) => {
                      const newDuration = Number(e.target.value);
                      setTimingConfig(prev => ({ ...prev, duration: newDuration }));
                    }}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Unité de durée</InputLabel>
                    <Select
                      value={timingConfig.unit}
                      onChange={(e) => {
                        setTimingConfig(prev => ({ ...prev, unit: e.target.value as 'hours' | 'days' | 'months' }));
                      }}
                    >
                      <MenuItem value="hours">Heures</MenuItem>
                      <MenuItem value="days">Jours</MenuItem>
                      <MenuItem value="months">Mois</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Update Timing Button */}
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    onClick={updateTiming}
                    startIcon={<Iconify icon="eva:refresh-fill" />}
                  >
                    Mettre à jour les dates
                  </Button>
                </Grid>
                
                {/* Calculated Dates Display */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date de début calculée"
                    value={relaunchData.startingAt.toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    InputProps={{ readOnly: true }}
                    error={!!validationErrors.startingAt}
                    helperText={validationErrors.startingAt}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date de fin calculée"
                    value={relaunchData.endingAt.toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    InputProps={{ readOnly: true }}
                    error={!!validationErrors.endingAt}
                    helperText={validationErrors.endingAt}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRelaunchDialog(false)}>Annuler</Button>
            <Button onClick={handleRelaunch} variant="contained" color="primary">
              Relancer l'Enchère
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}