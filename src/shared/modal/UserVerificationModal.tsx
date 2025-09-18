import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle } from '@mui/material';
import app from '@/config'; 


const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

export default function UserVerificationModal({ open: identity, setOpen, accept, decline }) {
  const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (identity) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [identity]);

  const handleClose = () => {
    setOpen(undefined);
  };

  const onAccept = () => accept(identity);
  const onDecline = () => decline(identity);

  // console.log("open", identity);
  // console.log(app.route + identity.selfie.filename);
  
  

  return (
    <div>
      <Modal
        open={identity}
        aria-open="modal-modal-title"
        aria-describedby="modal-modal-description"
        onClose={setOpen}
      >
        <Box sx={style}>
          <Dialog
            open={identity}
            onClose={handleClose}
            scroll={scroll}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
          >
            <DialogTitle id="scroll-dialog-title">Vérification d'identité</DialogTitle>
            <DialogContent dividers={true}>
              <DialogContentText
                id="scroll-dialog-description"
                tabIndex={-1}
              >
                <Typography variant="overline" display="block" gutterBottom>
                  Document
                </Typography>

                <img
                  src={app.route + identity?.document?.filename}
                  alt="document"
                  width={'100%'}
                />
                <Typography variant="overline" display="block" gutterBottom mt={2}>
                  Vehicle
                </Typography>

                <img
                  src={app.route + identity?.vehicle?.filename}
                  alt="vehicle"
                  width={'100%'}
                />
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              {/*<Button onClick={handleClose}>Ignorer</Button>*/}
              <Button color='error' onClick={onDecline}>Décliner</Button>
              <Button variant='outlined' onClick={onAccept}>Vérifier</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Modal>
    </div>
  );
}
