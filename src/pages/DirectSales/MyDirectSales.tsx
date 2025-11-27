import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import Page from '@/components/Page';
import Breadcrumb from '@/components/Breadcrumbs';
import Iconify from '@/components/Iconify';
import { DirectSaleAPI } from '@/api/direct-sale';
import useAuth from '@/hooks/useAuth';
import { LoadingButton } from '@mui/lab';

interface DirectSale {
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  status: string;
  thumbs?: Array<{ url: string }>;
  productCategory?: { name: string };
  createdAt: string;
}

export default function MyDirectSales() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { auth } = useAuth();
  const [directSales, setDirectSales] = useState<DirectSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<DirectSale | null>(null);

  useEffect(() => {
    fetchDirectSales();
  }, []);

  const fetchDirectSales = async () => {
    try {
      setLoading(true);
      const data = await DirectSaleAPI.getMyDirectSales();
      setDirectSales(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching direct sales:', error);
      enqueueSnackbar(t('directSales.loadError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSale) return;

    try {
      await DirectSaleAPI.delete(selectedSale._id);
      enqueueSnackbar(t('directSales.deleteSuccess'), { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedSale(null);
      fetchDirectSales();
    } catch (error: any) {
      enqueueSnackbar(t('directSales.deleteError'), { variant: 'error' });
    }
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
        return t('directSales.status.active');
      case 'SOLD_OUT':
        return t('directSales.status.soldOut');
      case 'INACTIVE':
        return t('directSales.status.inactive');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const localeMap: { [key: string]: string } = {
      en: 'en-US',
      fr: 'fr-FR',
      ar: 'ar-SA',
    };
    const locale = localeMap[currentLanguage] || 'en-US';
    return new Date(dateString).toLocaleDateString(locale);
  };

  const getAvailableQuantity = (sale: DirectSale) => {
    if (sale.quantity === 0) return t('directSales.unlimited');
    return `${sale.quantity - sale.soldQuantity} / ${sale.quantity}`;
  };

  return (
    <Page title={t('directSales.myDirectSales')}>
      <Container maxWidth="xl">
        <Breadcrumb links={[{ name: t('navigation.directSales'), href: '/dashboard/direct-sales' }]} />

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {t('directSales.myDirectSales')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => navigate('/dashboard/direct-sales/create')}
          >
            {t('directSales.createDirectSale')}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography>{t('directSales.loading')}</Typography>
          </Box>
        ) : directSales.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Iconify icon="mdi:package-variant-closed" width={64} height={64} sx={{ color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('directSales.noDirectSales')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {t('directSales.noDirectSalesDescription')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard/direct-sales/create')}
            >
              {t('directSales.createDirectSale')}
            </Button>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label={t('directSales.table.ariaLabel')}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('directSales.table.title')}</TableCell>
                  <TableCell>{t('directSales.table.description')}</TableCell>
                  <TableCell>{t('directSales.table.price')}</TableCell>
                  <TableCell>{t('directSales.table.quantity')}</TableCell>
                  <TableCell>{t('directSales.table.status')}</TableCell>
                  <TableCell>{t('directSales.table.createdAt')}</TableCell>
                  <TableCell align="center">{t('directSales.table.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {directSales.map((sale) => (
                  <TableRow
                    key={sale._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {sale.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {sale.description.length > 100 
                          ? `${sale.description.substring(0, 100)}...` 
                          : sale.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {sale.price.toLocaleString()} DA
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getAvailableQuantity(sale)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(sale.status)}
                        color={getStatusColor(sale.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(sale.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/dashboard/direct-sales/${sale._id}`)}
                        >
                          {t('directSales.viewDetails')}
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedSale(sale);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Iconify icon="eva:trash-2-fill" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>{t('directSales.deleteTitle')}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('directSales.deleteMessage', { title: selectedSale?.title || '' })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}