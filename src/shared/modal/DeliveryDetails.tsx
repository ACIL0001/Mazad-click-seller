import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  DialogProps,
} from '@mui/material';
import Label from '@/components/Label';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

export default function DeliveryDetails({ order, isModalOpen, handleModalClose }: any) {
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper');
  const [showExtra, setShowExtra] = useState(false);

  const onDecline = () => handleModalClose(false);

  return (
    <Modal
      open={isModalOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Dialog
          open={isModalOpen}
          onClose={handleModalClose}
          scroll={scroll}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
        >
          <DialogTitle id="scroll-dialog-title">Détails de commande</DialogTitle>
          <DialogContent dividers>
            <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
              <Box sx={{ py: 1, px: 3, width: '40vw' }}>
                <Typography variant="body1">
                  <span style={{ fontWeight: 'bold' }}>ID:</span> {order ? order.orderId : ''}
                </Typography>
                <Typography variant="body1">
                  <span style={{ fontWeight: 'bold' }}>Client:</span> {order ? order.user.name : ''}
                </Typography>
                <Typography variant="body1">
                  <span style={{ fontWeight: 'bold' }}>Status:</span> {order ? order.status : ''}
                </Typography>
                <Typography variant="body1">
                  <span style={{ fontWeight: 'bold' }}>Prix Des Produit/Boisson:</span> {order ? order.totalPrice : ''}{' '}
                  DZD
                </Typography>
                {order?.promocode && (
                  <>
                    <Typography variant="body1">
                      <span style={{ fontWeight: 'bold' }}>Coupon:</span>{' '}
                      {order?.promocode ? `${order.promocode.code} - ${order.promocode.discount}%` : ''}
                    </Typography>
                  </>
                )}
                <Typography variant="body1">
                  <span style={{ fontWeight: 'bold' }}>Prix Final:</span> {order ? order.totalAmount : '0'}DZD
                </Typography>
                {order && order.note && (
                  <Typography variant="body1">
                    <span style={{ fontWeight: 'bold' }}>Note:</span> {order.note}
                  </Typography>
                )}
              </Box>
              {order && order.drinks && order.drinks.length > 0 && (
                <TableContainer component={Paper}>
                  <Typography sx={{ fontWeight: 'bold', textAlign: 'center', mt: 5 }}>Boissons:</Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Nom</TableCell>
                        <TableCell>Prix</TableCell>
                        <TableCell>Quantité</TableCell>
                        <TableCell>Prix Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order?.drinks?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell align="left">
                            <Label variant="ghost" color="success">
                              {index + 1}
                            </Label>
                          </TableCell>
                          <TableCell>{item.drink.name}</TableCell>
                          <TableCell>{item.drink.price} DZD</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.drink.price * item.quantity} DZD</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {order && order.items && order.items.length > 0 && (
                <TableContainer component={Paper}>
                  <Typography sx={{ fontWeight: 'bold', textAlign: 'center', mt: 5 }}>Produits:</Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Nom</TableCell>
                        <TableCell>Prix</TableCell>
                        <TableCell>Quantité</TableCell>
                        <TableCell>Prix Total</TableCell>
                        {/* <TableCell>Suppléments</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order?.items?.map((item, index) => (
                        <React.Fragment key={index}>
                          <TableRow key={index}>
                            <TableCell align="left">
                              <Label variant="ghost" color="success">
                                {index + 1}
                              </Label>
                            </TableCell>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell>{item.product.price} DZD</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.product.price * item.quantity} DZD</TableCell>
                            {/* <TableCell>
                                                            <Button onClick={() => setShowExtra(!showExtra)}>
                                                                {showExtra ? "Hide Extra" : "Show Extra"}
                                                            </Button>
                                                        </TableCell> */}
                          </TableRow>
                          {/* {item.showExtra && item.product.extra && item.product.extra.length > 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={5}>
                                                                <Table>
                                                                    <TableBody>
                                                                        {item.extra.map((extra, extraIndex) => (
                                                                            <TableRow key={extraIndex}>
                                                                                <TableCell>{extra.name}</TableCell>
                                                                                <TableCell>{extra.price} DZD</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableCell>
                                                        </TableRow>
                                                    )} */}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="error" onClick={onDecline}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
}
