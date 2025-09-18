import { Box, Card, CardHeader, Container, Grid, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Form, useFormik, FormikProvider } from 'formik';
import Breadcrumb from '@/components/Breadcrumbs';
import Iconify from '@/components/Iconify';
import ImageInput from '@/components/ImageInput';
import Page from '@/components/Page';
import { CategoryAPI } from '@/api/category';
import { useSnackbar } from 'notistack';
import { useLocation, useNavigate } from 'react-router-dom';

export default function UpdateCategory() {
  const [thumb, setThumb] = useState(undefined);
  const [defaultImage, setDefaultImage] = useState();

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const [category, setCategory] = useState<any>(location.state.category);
  const CategorySchema = Yup.object().shape({
    name: Yup.string().min(3, 'Trop court!').max(20, 'Trop Long!').required('Le nom du categorie est requis!'),
    thumb: Yup.object().nullable().optional(),
  });

  useEffect(() => {
    if (category) {
      setDefaultImage(category?.thumb?.filename); // Assuming `filename` contains the URL of the image
    }
  }, [category]);

  // console.log(category.thumb);

  const formik = useFormik({
    initialValues: { name: category?.name, thumb: category.thumb },
    validationSchema: CategorySchema,
    onSubmit: (values, { setSubmitting }) => {
      var proceed = true || confirm('Êtes-vous sur de vouloir appliquer les changements?');
      if (!proceed) {
        setSubmitting(false);
        return;
      }

      const formData = new FormData();

      formData.append('name', values.name);

      if (thumb) formData.append('thumb', thumb);

      // setSubmitting(false)

      CategoryAPI.update(category._id, formData)
        .then((r) => {
          enqueueSnackbar(`Category ${values.name} a ete modifier avec success`, { variant: 'success' });
          navigate(-1);
        })
        .catch((e) => {})
        .finally(() => setSubmitting(false));
    },
  });

  // const submit = async (event: React.FormEvent<HTMLFormElement>) => {
  //     event.preventDefault();
  //     if (!thumb) {
  //         return alert("Vous n'avez pas ajouté l'image");
  //     }
  //     handleSubmit();
  // };
  const { errors, touched, values, validateForm, isSubmitting, handleSubmit, getFieldProps } = formik;

  console.log(errors);

  return (
    <Page title="Update Category">
      <Container>
        <Stack direction={'row'} justifyContent={'space-between'} mb={3}>
          <Typography variant="h4" gutterBottom>
            Mettre à jour la catégorie
          </Typography>
        </Stack>
        <Stack mb={3}>
          <Breadcrumb />
        </Stack>
      </Container>
      <CardHeader
        title="Modifier une Categegorie"
        subheader="Ces information seron visibles aux clients"
        action={<Iconify width={40} height={40} icon="material-symbols:category" />}
      />
      <Grid item lg={8} md={6} xs={12}>
        <Card sx={{ p: 4 }}>
          <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
              <Box display="flex" alignItems={'center'} gap={2}>
                <ImageInput
                  handleFile={setThumb}
                  file={thumb}
                  defaultImage={defaultImage}
                  label="Image de Categorie"
                  style={{ height: 100, aspectRatio: 1 / 1, objectFit: 'cover' }}
                  {...getFieldProps('thumb')}
                />
                <TextField
                  fullWidth
                  {...getFieldProps('name')}
                  autoComplete="name"
                  type="text"
                  label="Nom De Categorie"
                  error={Boolean(touched.name && errors.name)}
                  helperText={touched.name && (errors.name as string)}
                />
              </Box>
              <LoadingButton
                sx={{ mx: 3, mt: 5 }}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Appliquer
              </LoadingButton>
            </Form>
          </FormikProvider>
        </Card>
      </Grid>
    </Page>
  );
}
