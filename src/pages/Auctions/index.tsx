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
import { alpha, useTheme } from '@mui/material/styles';
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
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
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
    let y = setInterval(() => {
      get();
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
            let auctionData = [];
            if (response && Array.isArray(response)) {
                auctionData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                auctionData = response.data;
            } else {
                console.error("Unexpected response format:", response);
                enqueueSnackbar(t('auctions.errors.unexpectedFormat'), { variant: 'error' });
                return;
            }

            // Separate active and finished auctions
            const now = new Date();
            const active = auctionData.filter(auction => {
                const endTime = new Date(auction.endingAt);
                const isActive = endTime > now && auction.status !== BID_STATUS.CLOSED;
                console.log('Active filter check:', {
                    auctionId: auction._id,
                    title: auction.title,
                    endingAt: auction.endingAt,
                    endTime: endTime.toISOString(),
                    now: now.toISOString(),
                    status: auction.status,
                    isActive
                });
                return isActive;
            });
            const finished = auctionData.filter(auction => {
                const endTime = new Date(auction.endingAt);
                const isFinished = endTime <= now || auction.status === BID_STATUS.CLOSED;
                console.log('Finished filter check:', {
                    auctionId: auction._id,
                    title: auction.title,
                    endingAt: auction.endingAt,
                    endTime: endTime.toISOString(),
                    now: now.toISOString(),
                    status: auction.status,
                    isFinished
                });
                return isFinished;
            });

            setAuctions(auctionData); // Keep all auctions for "ALL" filter
            setActiveAuctions(active);
            setFinishedAuctions(finished);
            
            console.log("All auctions:", auctionData);
            console.log("Active auctions:", active);
            console.log("Finished auctions:", finished);
        })
        .catch((e) => {
            console.error("Error fetching auctions:", e);
            enqueueSnackbar(t('auctions.errors.loadFailed'), { variant: 'error' });
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
        return t('auctions.type.classic');
      case AUCTION_TYPE.EXPRESS:
        return t('auctions.type.express');
      case AUCTION_TYPE.AUTO_SUB_BID:
        return t('auctions.type.automatic');
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
    
    // Allow relaunch if auction is either time-finished OR status-closed
    const canRelaunch = isTimeFinished || isStatusClosed;
    
    console.log('isAuctionFinished check:', {
      auctionId: auction._id,
      endingAt: auction.endingAt,
      endTime: endTime,
      now: now,
      isTimeFinished,
      status: auction.status,
      isStatusClosed,
      result: canRelaunch
    });
    
    return canRelaunch;
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
    
    // Additional debugging
    const now = new Date();
    const endTime = new Date(auction.endingAt);
    const isTimeFinished = endTime < now;
    const isStatusClosed = auction.status === BID_STATUS.CLOSED;
    console.log('Detailed check:', {
      now: now.toISOString(),
      endTime: endTime.toISOString(),
      isTimeFinished,
      isStatusClosed,
      timeDiff: endTime.getTime() - now.getTime(),
      hoursDiff: (endTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    });
    
    setSelectedAuction(auction);
    
    // Calculate dates based on timing configuration
    const { startingAt, endingAt } = calculateDates();
    
    // Use type assertion to access optional properties safely
    const auctionAny = auction as any;
    
    setRelaunchData({
      title: auction.title || '',
      description: auction.description || '',
      startingPrice: auction.startingPrice || 0,
      startingAt,
      endingAt,
      auctionType: (auction.auctionType as AUCTION_TYPE) || AUCTION_TYPE.CLASSIC,
      isPro: Boolean(auctionAny.isPro) || false,
      place: auctionAny.place || 'Alger',
      quantity: auctionAny.quantity || '1',
      wilaya: auctionAny.wilaya || 'Alger',
      attributes: Array.isArray(auctionAny.attributes) ? auctionAny.attributes : [],
    });
    setRelaunchDialog(true);
  };

  const validateRelaunchData = () => {
    const errors: ValidationErrors = {};

    console.log('Validation data:', relaunchData);
    console.log('Current time:', new Date());

    if (!relaunchData.title.trim()) {
      console.log('Title validation failed');
      errors.title = t('auctions.validation.titleRequired');
    }

    if (!relaunchData.description.trim()) {
      console.log('Description validation failed');
      errors.description = t('auctions.validation.descriptionRequired');
    }

    if (!relaunchData.place.trim()) {
      console.log('Place validation failed');
      errors.place = t('auctions.validation.placeRequired');
    }

    if (relaunchData.startingPrice <= 0) {
      console.log('Starting price validation failed:', relaunchData.startingPrice);
      errors.startingPrice = t('auctions.validation.startingPriceRequired');
    }

    const now = new Date();
    if (relaunchData.startingAt < now) {
      console.log('Starting date validation failed:', {
        startingAt: relaunchData.startingAt,
        now: now,
        comparison: relaunchData.startingAt < now
      });
      errors.startingAt = t('auctions.validation.startingDateRequired');
    }

    if (relaunchData.endingAt <= relaunchData.startingAt) {
      console.log('Ending date validation failed:', {
        endingAt: relaunchData.endingAt,
        startingAt: relaunchData.startingAt,
        comparison: relaunchData.endingAt <= relaunchData.startingAt
      });
      errors.endingAt = t('auctions.validation.endingDateRequired');
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
      errors.endingAt = t('auctions.validation.durationRequired');
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
      startingAt: relaunchData.startingAt.toISOString(),
      endingAt: relaunchData.endingAt.toISOString(),
    };

    console.log('Sending relaunch payload:', JSON.stringify(relaunchPayload, null, 2));
    console.log('Payload types:', {
      originalBidId: typeof relaunchPayload.originalBidId,
      title: typeof relaunchPayload.title,
      description: typeof relaunchPayload.description,
      place: typeof relaunchPayload.place,
      startingPrice: typeof relaunchPayload.startingPrice,
      startingAt: typeof relaunchPayload.startingAt,
      endingAt: typeof relaunchPayload.endingAt,
      isPro: typeof relaunchPayload.isPro,
      auctionType: typeof relaunchPayload.auctionType,
    });

    AuctionsAPI.relaunchAuction(relaunchPayload)
      .then((response) => {
        console.log('Relaunch successful:', response);
        enqueueSnackbar(t('auctions.success.relaunched'), { variant: 'success' });
        setRelaunchDialog(false);
        setSelectedAuction(null);
        setValidationErrors({});
        
        // Refresh all auction data
        get();
      })
      .catch((error) => {
        console.error('Error relaunching auction:', error);
        console.error('Error response:', error.response);
        console.error('Error data:', error.response?.data);
        
        let errorMessage = t('auctions.errors.relaunchFailed');
        
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
    switch (statusFilter) {
      case 'ACTIVE':
        return activeAuctions;
      case 'FINISHED':
        return finishedAuctions;
      case 'ALL':
      default:
        return auctions;
    }
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
                  {(statusFilter === 'FINISHED' || (statusFilter === 'ALL' && isAuctionFinished(row))) && (
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
                      {t('auctions.relaunch')}
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
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'stretch', sm: 'center' }} 
            justifyContent="space-between" 
            spacing={{ xs: 2, sm: 2 }}
          >
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                m: 0,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              {t('navigation.auctions')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>{t('auctions.filterByStatus')}</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label={t('auctions.filterByStatus')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.25)',
                      backdropFilter: 'blur(8px)'
                    }
                  }}
                >
                  <MenuItem value="ALL">{t('auctions.filter.all')}</MenuItem>
                  <MenuItem value="ACTIVE">{t('auctions.filter.active')}</MenuItem>
                  <MenuItem value="FINISHED">{t('auctions.filter.finished')}</MenuItem>
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
        </Box>

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
        ) : (
          <Box textAlign="center" py={4}>
            <Iconify 
              icon={statusFilter === 'ACTIVE' ? "eva:clock-fill" : statusFilter === 'FINISHED' ? "eva:archive-fill" : "eva:grid-fill"} 
              width={64} 
              height={64} 
              sx={{ color: 'text.disabled', mb: 2 }} 
            />
            <Typography variant="h6" gutterBottom>
              {statusFilter === 'ACTIVE' && t('auctions.empty.active')}
              {statusFilter === 'FINISHED' && t('auctions.empty.finished')}
              {statusFilter === 'ALL' && t('auctions.empty.all')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {statusFilter === 'ACTIVE' && t('auctions.empty.activeDescription')}
              {statusFilter === 'FINISHED' && t('auctions.empty.finishedDescription')}
              {statusFilter === 'ALL' && t('auctions.empty.allDescription')}
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/dashboard/auctions/create"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              {t('auctions.createNewAuction')}
            </Button>
          </Box>
        )}

        {/* Relaunch Dialog */}
        <Dialog open={relaunchDialog} onClose={() => setRelaunchDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{t('auctions.relaunchDialog.title')}</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('auctions.relaunchDialog.auctionTitle')}
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
                    label={t('auctions.relaunchDialog.description')}
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
                    label={t('auctions.relaunchDialog.place')}
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
                    label={t('auctions.relaunchDialog.quantity')}
                    value={relaunchData.quantity}
                    onChange={(e) => setRelaunchData({ ...relaunchData, quantity: e.target.value })}
                    error={!!validationErrors.quantity}
                    helperText={validationErrors.quantity}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auctions.relaunchDialog.startingPrice')}
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
                    <InputLabel>{t('auctions.relaunchDialog.auctionType')}</InputLabel>
                    <Select
                      value={relaunchData.auctionType}
                      onChange={(e) => setRelaunchData({ ...relaunchData, auctionType: e.target.value as AUCTION_TYPE })}
                    >
                      <MenuItem value={AUCTION_TYPE.CLASSIC}>{t('auctions.relaunchDialog.type.classic')}</MenuItem>
                      <MenuItem value={AUCTION_TYPE.EXPRESS}>{t('auctions.relaunchDialog.type.express')}</MenuItem>
                      <MenuItem value={AUCTION_TYPE.AUTO_SUB_BID}>{t('auctions.relaunchDialog.type.automatic')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {/* Timing Configuration */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {t('auctions.relaunchDialog.timing.title')}
                  </Typography>
                </Grid>
                
                {/* Start Delay Configuration */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auctions.relaunchDialog.timing.startDelay')}
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
                    <InputLabel>{t('auctions.relaunchDialog.timing.startUnit')}</InputLabel>
                    <Select
                      value={timingConfig.startUnit}
                      onChange={(e) => {
                        setTimingConfig(prev => ({ ...prev, startUnit: e.target.value as 'minutes' | 'hours' | 'days' }));
                      }}
                    >
                      <MenuItem value="minutes">{t('auctions.relaunchDialog.timing.units.minutes')}</MenuItem>
                      <MenuItem value="hours">{t('auctions.relaunchDialog.timing.units.hours')}</MenuItem>
                      <MenuItem value="days">{t('auctions.relaunchDialog.timing.units.days')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Duration Configuration */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auctions.relaunchDialog.timing.duration')}
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
                    <InputLabel>{t('auctions.relaunchDialog.timing.durationUnit')}</InputLabel>
                    <Select
                      value={timingConfig.unit}
                      onChange={(e) => {
                        setTimingConfig(prev => ({ ...prev, unit: e.target.value as 'hours' | 'days' | 'months' }));
                      }}
                    >
                      <MenuItem value="hours">{t('auctions.relaunchDialog.timing.units.hours')}</MenuItem>
                      <MenuItem value="days">{t('auctions.relaunchDialog.timing.units.days')}</MenuItem>
                      <MenuItem value="months">{t('auctions.relaunchDialog.timing.units.months')}</MenuItem>
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
                    {t('auctions.relaunchDialog.updateDates')}
                  </Button>
                </Grid>
                
                {/* Calculated Dates Display */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auctions.relaunchDialog.calculatedStartDate')}
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
                    label={t('auctions.relaunchDialog.calculatedEndDate')}
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
            <Button onClick={() => setRelaunchDialog(false)}>{t('auctions.relaunchDialog.cancel')}</Button>
            <Button onClick={handleRelaunch} variant="contained" color="primary">
              {t('auctions.relaunchDialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}