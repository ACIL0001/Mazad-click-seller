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
import { useSnackbar } from 'notistack';
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
  } | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

export default function Orders() {
  const { enqueueSnackbar } = useSnackbar();
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
      enqueueSnackbar('Erreur lors du chargement des commandes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedOrder) return;

    try {
      setConfirming(true);
      await DirectSaleAPI.confirmPurchase(selectedOrder._id);
      enqueueSnackbar('Commande confirmée avec succès', { variant: 'success' });
      setConfirmDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      enqueueSnackbar('Erreur lors de la confirmation', { variant: 'error' });
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
        return 'Confirmé';
      case 'PENDING':
        return 'En attente';
      case 'CANCELLED':
        return 'Annulé';
      case 'COMPLETED':
        return 'Terminé';
      default:
        return status;
    }
  };

  return (
    <Page title="Mes commandes">
      <Container maxWidth="xl">
        <Breadcrumb links={[{ name: 'Ventes Directes', href: '/direct-sales' }, { name: 'Commandes' }]} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Mes commandes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez les commandes reçues pour vos ventes directes
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography>Chargement...</Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Iconify icon="mdi:package-variant" width={64} height={64} sx={{ color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Aucune commande
            </Typography>
            <Typography color="text.secondary">
              Vous n'avez reçu aucune commande pour le moment
            </Typography>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produit</TableCell>
                  <TableCell>Acheteur</TableCell>
                  <TableCell align="right">Quantité</TableCell>
                  <TableCell align="right">Prix unitaire</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.directSale?.title || 'Produit inconnu'}</TableCell>
                    <TableCell>
                      {order.buyer ? `${order.buyer.firstName || ''} ${order.buyer.lastName || ''}`.trim() || 'Acheteur inconnu' : 'Acheteur inconnu'}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {order.buyer?.email || 'Email non disponible'}
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
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell align="center">
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
                          Confirmer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>Confirmer la commande</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir confirmer la commande de {selectedOrder?.buyer ? `${selectedOrder.buyer.firstName || ''} ${selectedOrder.buyer.lastName || ''}`.trim() || 'Acheteur inconnu' : 'Acheteur inconnu'}{' '}
              pour "{selectedOrder?.directSale?.title || 'Produit inconnu'}" ?
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Quantité: {selectedOrder?.quantity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {selectedOrder?.totalPrice.toLocaleString()} DA
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Annuler</Button>
            <LoadingButton
              onClick={handleConfirm}
              loading={confirming}
              variant="contained"
              color="success"
            >
              Confirmer
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}

