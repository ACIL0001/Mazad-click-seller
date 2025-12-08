import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { LoadingButton } from '@mui/lab';

interface Order {
  _id: string;
  directSale?: {
    _id: string;
    title: string;
  } | null;
  buyer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  } | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

export default function Orders() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await DirectSaleAPI.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      enqueueSnackbar(t('orders.loadError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedOrder) return;

    try {
      setConfirming(true);
      await DirectSaleAPI.confirmPurchase(selectedOrder._id);
      enqueueSnackbar(t('orders.confirmSuccess'), { variant: 'success' });
      setConfirmDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      enqueueSnackbar(t('orders.confirmError'), { variant: 'error' });
    } finally {
      setConfirming(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'COMPLETED':
        return 'info';
      default:
        return 'default';
    }
  };


  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return t('orders.status.confirmed');
      case 'PENDING':
        return t('orders.status.pending');
      case 'CANCELLED':
        return t('orders.status.cancelled');
      case 'COMPLETED':
        return t('orders.status.completed');
      default:
        return status;
    }
  };

  return (
    <Page title={t('orders.title')}>
      <Container maxWidth="xl">
        <Breadcrumb links={[{ name: t('navigation.directSales'), href: '/direct-sales' }, { name: t('navigation.myOrders') }]} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {t('orders.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('orders.description')}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography>{t('orders.loading')}</Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Iconify icon="mdi:package-variant" width={64} height={64} sx={{ color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('orders.noOrders')}
            </Typography>
            <Typography color="text.secondary">
              {t('orders.noOrdersDescription')}
            </Typography>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('orders.table.product')}</TableCell>
                  <TableCell>{t('orders.table.buyer')}</TableCell>
                  <TableCell align="right">{t('orders.table.quantity')}</TableCell>
                  <TableCell align="right">{t('orders.table.unitPrice')}</TableCell>
                  <TableCell align="right">{t('orders.table.total')}</TableCell>
                  <TableCell>{t('orders.table.status')}</TableCell>
                  <TableCell>{t('orders.table.date')}</TableCell>
                  <TableCell align="center">{t('orders.table.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.directSale?.title || t('orders.unknownProduct')}</TableCell>
                    <TableCell>
                      {order.buyer ? `${order.buyer.firstName || ''} ${order.buyer.lastName || ''}`.trim() || t('orders.unknownBuyer') : t('orders.unknownBuyer')}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {order.buyer?.phone || t('orders.phoneNotAvailable') || 'Téléphone non disponible'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{order.quantity}</TableCell>
                    <TableCell align="right">{order.unitPrice.toLocaleString()} DA</TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {order.totalPrice.toLocaleString()} DA
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(order.status)}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const localeMap: { [key: string]: string } = {
                          en: 'en-US',
                          fr: 'fr-FR',
                          ar: 'ar-SA',
                        };
                        const locale = localeMap[currentLanguage] || 'en-US';
                        return new Date(order.createdAt).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        });
                      })()}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="eva:eye-fill" />}
                          onClick={() => {
                            if (order.directSale?._id) {
                              navigate(`/dashboard/direct-sales/${order.directSale._id}`);
                            } else {
                              console.error('Direct sale ID not found for order:', order._id);
                              enqueueSnackbar(t('orders.directSaleNotFound') || 'Produit introuvable', { variant: 'error' });
                            }
                          }}
                        >
                          {t('orders.viewDetails') || 'Voir détails'}
                        </Button>
                        {order.status === 'PENDING' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => {
                              setSelectedOrder(order);
                              setConfirmDialogOpen(true);
                            }}
                          >
                            {t('orders.confirm')}
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('orders.confirmOrder')}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('orders.confirmOrderMessage', {
                buyer: selectedOrder?.buyer ? `${selectedOrder.buyer.firstName || ''} ${selectedOrder.buyer.lastName || ''}`.trim() || t('orders.unknownBuyer') : t('orders.unknownBuyer'),
                product: selectedOrder?.directSale?.title || t('orders.unknownProduct')
              })}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('orders.quantity')} {selectedOrder?.quantity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('orders.total')} {selectedOrder?.totalPrice.toLocaleString()} DA
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>{t('orders.cancel')}</Button>
            <LoadingButton
              onClick={handleConfirm}
              loading={confirming}
              variant="contained"
              color="success"
            >
              {t('orders.confirm')}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}

