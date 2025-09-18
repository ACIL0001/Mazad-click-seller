import {
  Stack,
  Container,
  Typography,
  Box,
  Grid,
  CardHeader,
  Divider,
  Card,
  CardContent,
  FormControl,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';

// components
import Page from '../../components/Page';
import IComminucation from '../../types/Communication';
import { useSnackbar } from 'notistack';
import Breadcrumb from '@/components/Breadcrumbs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { NotificationAPI } from '@/api/notification';

const initialValues: IComminucation = {
  title: '',
  description: '',
  client: false,
  rider: false,
};

const CommunicationSchema = Yup.object().shape({
  title: Yup.string().required(),
  description: Yup.string().required(),
  client: Yup.boolean().required(),
  rider: Yup.boolean().required(),
});

export default function Communication() {
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues,
    validationSchema: CommunicationSchema,
    onSubmit: (values: any, actions) => {
      var proceed = confirm('Êtes-vous sur de vouloir appliquer les changements?');
      if (!proceed) {
        actions.setSubmitting(false);
        return;
      }

      NotificationAPI.SubmitPushNotification(values)
        .then(({ data }) => {
          enqueueSnackbar(`Envoyer a ${data.counts | 0} utilisateurr`, { variant: 'success' });
        })
        .catch((e) => {
          enqueueSnackbar('Erreur', { variant: 'error' });
          console.error(e);
        })
        .finally(() => {
          actions.setSubmitting(false);
        });
    },
  });

  const { errors, touched, handleSubmit, getFieldProps, setFieldValue, values }: any = formik;

  const handleCheckboxChange = (type: 'client' | 'rider') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(type, event.target.checked);
  };

  return (
    <Page title="Communication">
      <Container>
        {/* Toolbar */}

        <Stack direction="row" alignItems="center" justifyContent="space-between" ml={2} mb={1}>
          <Typography variant="h4" gutterBottom>
            Communication
          </Typography>
        </Stack>

        {/* Breadcrumbs */}

        <Box sx={{ mb: 2, mx: 2 }}>
          <Grid item lg={8} md={6} xs={12}>
            <Breadcrumb />
          </Grid>
        </Box>

        {/* Delivery fees */}

        {/* <CardHeader
                      title="Gestion des frais de trajets"
                      subheader="Valeurs par default"
                      action={<Iconify width={40} height={40} icon="ion:car-sport-sharp" />}
                  /> */}
        <Divider />

        <Box sx={{ mb: 8 }}>
          <Grid item lg={8} md={6} xs={12}>
            <Card sx={{ my: 2 }}>
              <Divider />
              <CardContent sx={{ mx: 2 }}>
                <CardHeader
                  title="Notification"
                  subheader="Envoyer des messages au client et au conducteur sous forme de notification"
                />
                <Divider />
                <Grid container m={1} spacing={2}>
                  <Grid item md={12} xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        fullWidth
                        label="Titre"
                        aria-describedby="standard-weight-helper-text"
                        error={Boolean(touched.title && errors.title)}
                        helperText={touched.title && errors.title}
                        type="text"
                        {...getFieldProps('title')}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <FormControl fullWidth variant="standard">
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Description"
                        aria-describedby="standard-weight-helper-text"
                        error={Boolean(touched.description && errors.description)}
                        helperText={touched.description && errors.description}
                        type="text"
                        {...getFieldProps('description')}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormControl component="fieldset">
                      <FormGroup row>
                        <FormControlLabel
                          control={
                            <Checkbox checked={values.rider} onChange={handleCheckboxChange('rider')} name="rider" />
                          }
                          label="Chauffeur"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox checked={values.client} onChange={handleCheckboxChange('client')} name="client" />
                          }
                          label="Client"
                        />
                      </FormGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                <Button color="primary" variant="contained" onClick={handleSubmit}>
                  Appliquer
                </Button>
              </Box>
            </Card>
          </Grid>
        </Box>
      </Container>
    </Page>
  );
}
