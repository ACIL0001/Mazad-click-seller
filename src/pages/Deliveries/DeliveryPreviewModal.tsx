import { Dialog, DialogTitle, DialogContent, Typography, Box, IconButton, Grid, Divider } from '@mui/material';
import { Close } from '@mui/icons-material';
import Label from '@/components/Label';
import { sentenceCase } from 'change-case';
import IDelivery from '@/types/Delivery';

// Define the types for the nested objects to avoid using 'any'
interface IProduct {
    name: string;
    price: number;
}

interface IExtra {
    name: string;
    price: number;
}

interface IItem {
    quantity: number;
    product: IProduct;
    extra?: IExtra[];
}

interface DeliveryPreviewModalProps {
    open: boolean;
    onClose: () => void;
    delivery: IDelivery | null;
}

// Reusable component for displaying key-value pairs
const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Typography variant="body1" gutterBottom>
        <strong>{label}:</strong> {value}
    </Typography>
);

export default function DeliveryPreviewModal({ open, onClose, delivery }: DeliveryPreviewModalProps) {
    if (!delivery) return null;

    const deliveryDate = new Date(delivery.createdAt);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Détails de la livraison #{delivery.order.orderId}</Typography>
                    <IconButton onClick={onClose} aria-label="close">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    {/* All direct children of this container must be items */}
                    <Grid item xs={12}>
                        <Box mb={2}>
                            <Label variant="ghost" color="info" sx={{ fontSize: '1rem', padding: '8px 16px' }}>
                                {sentenceCase(delivery.status)}
                            </Label>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="text.secondary">Informations de livraison</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box mt={2}>
                            <InfoItem label="Adresse" value={delivery.end_address} />
                            <InfoItem label="Prix" value={`${delivery.price} DA`} />
                            <InfoItem label="Date" value={deliveryDate.toLocaleDateString('fr-FR')} />
                            <InfoItem 
                                label="Heure" 
                                value={deliveryDate.toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })} 
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="text.secondary">Participants</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box mt={2}>
                            <InfoItem label="Restaurant" value={delivery.restaurant.name} />
                            <InfoItem label="Client" value={delivery.user.name} />
                            <InfoItem label="Livreur" value={delivery.rider?.name || 'Non assigné'} />
                        </Box>
                    </Grid>

                    {delivery.order.items && delivery.order.items.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>Commande</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box mt={2}>
                                {delivery.order.items.map((item: IItem, index: number) => (
                                    <Box key={index} mb={2}>
                                        <Typography variant="body1" gutterBottom>
                                            {item.quantity}x {item.product.name} - {item.product.price} DA
                                        </Typography>
                                        
                                        {item.extra && item.extra.length > 0 && (
                                            <>
                                                <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>Supplément</Typography>
                                                <Divider sx={{ my: 1 }} />
                                                <Box>
                                                    {item.extra.map((extraItem: IExtra, extraIndex: number) => (
                                                        <Typography key={extraIndex} variant="body1" gutterBottom>
                                                            {extraItem.name} - {extraItem.price} DA
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
        </Dialog>
    );
}