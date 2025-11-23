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
      enqueueSnackbar('Erreur lors du chargement des ventes directes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSale) return;

    try {
      await DirectSaleAPI.delete(selectedSale._id);
      enqueueSnackbar('Vente directe supprimée avec succès', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedSale(null);
      fetchDirectSales();
    } catch (error: any) {
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
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
        return 'Active';
      case 'SOLD_OUT':
        return 'Épuisé';
      case 'INACTIVE':
        return 'Inactif';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getAvailableQuantity = (sale: DirectSale) => {
    if (sale.quantity === 0) return 'Illimité';
    return `${sale.quantity - sale.soldQuantity} / ${sale.quantity}`;
  };

  return (
    <Page title="Mes ventes directes">
      <Container maxWidth="xl">
        <Breadcrumb links={[{ name: 'Ventes Directes', href: '/dashboard/direct-sales' }]} />

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Mes ventes directes
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => navigate('/dashboard/direct-sales/create')}
          >
            Créer une vente directe
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography>Chargement...</Typography>
          </Box>
        ) : directSales.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Iconify icon="mdi:package-variant-closed" width={64} height={64} sx={{ color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Aucune vente directe
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Commencez par créer votre première vente directe
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard/direct-sales/create')}
            >
              Créer une vente directe
            </Button>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="table des ventes directes">
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell>Quantité</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date de création</TableCell>
                  <TableCell align="center">Actions</TableCell>
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
                          Voir détails
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
          <DialogTitle>Supprimer la vente directe</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer "{selectedSale?.title}" ? Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}