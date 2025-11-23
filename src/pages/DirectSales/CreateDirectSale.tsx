import {
  Box,
  Card,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Button,
  Paper,
  styled,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik, FormikProvider } from 'formik';
import Breadcrumb from '@/components/Breadcrumbs';
import Iconify from '@/components/Iconify';
import { UploadMultiFile } from '@/components/upload/UploadMultiFile';
import Page from '@/components/Page';
import { DirectSaleAPI } from '@/api/direct-sale';
import { CategoryAPI } from '@/api/category';
import { SubCategoryAPI } from '@/api/subcategory';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { alpha } from '@mui/material/styles';

const DIRECT_SALE_TYPES = {
  PRODUCT: 'PRODUCT',
  SERVICE: 'SERVICE',
};

const MainContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(6),
  maxWidth: '1200px',
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const StepCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const SelectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid transparent`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  },
}));

export default function CreateDirectSale() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { auth, isLogged } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const steps = [
    { title: 'Type', description: 'Choisissez le type' },
    { title: 'Catégorie', description: 'Sélectionnez la catégorie' },
    { title: 'Détails', description: 'Remplissez les informations' },
  ];

  const validationSchema = Yup.object().shape({
    title: Yup.string().min(3, 'Le titre doit contenir au moins 3 caractères').required('Le titre est requis'),
    description: Yup.string().min(10, 'La description doit contenir au moins 10 caractères').required('La description est requise'),
    saleType: Yup.string().oneOf(Object.values(DIRECT_SALE_TYPES), 'Type invalide').required('Le type est requis'),
    productCategory: Yup.string().required('La catégorie est requise'),
    price: Yup.number().min(1, 'Le prix doit être positif').required('Le prix est requis'),
    wilaya: Yup.string().required('La wilaya est requise'),
    place: Yup.string().required('L\'emplacement est requis'),
    quantity: Yup.number().min(0, 'La quantité ne peut pas être négative'),
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      saleType: '',
      productCategory: '',
      productSubCategory: '',
      price: '',
      quantity: '0',
      attributes: [] as string[],
      place: '',
      wilaya: '',
      isPro: false,
      hidden: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await CategoryAPI.getCategories();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formik.values.saleType) {
        enqueueSnackbar('Veuillez sélectionner un type', { variant: 'error' });
        return;
      }
    } else if (activeStep === 1) {
      if (!formik.values.productCategory) {
        enqueueSnackbar('Veuillez sélectionner une catégorie', { variant: 'error' });
        return;
      }
    }
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (values: any) => {
    if (mediaFiles.length === 0) {
      enqueueSnackbar('Veuillez télécharger au moins une image ou une vidéo', { variant: 'error' });
      return;
    }

    if (auth.user?.rate < 3) {
      enqueueSnackbar('Votre note est trop faible pour créer une vente directe', { variant: 'error' });
      return;
    }

    setShowWarningModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowWarningModal(false);
    setIsSubmitting(true);

    const values = formik.values;

    try {
      const dataPayload = {
        owner: auth.user._id,
        title: values.title,
        description: values.description,
        saleType: values.saleType,
        productCategory: values.productCategory,
        productSubCategory: values.productSubCategory || undefined,
        price: parseFloat(values.price),
        quantity: parseInt(values.quantity) || 0,
        attributes: values.attributes || [],
        place: values.place,
        wilaya: values.wilaya,
        isPro: values.isPro,
        hidden: values.hidden,
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(dataPayload));

      mediaFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          formData.append('thumbs[]', file);
        } else if (file.type.startsWith('video/')) {
          formData.append('videos[]', file);
        }
      });

      await DirectSaleAPI.create(formData);

      enqueueSnackbar('Vente directe créée avec succès!', { variant: 'success' });
      setTimeout(() => {
        navigate('/dashboard/direct-sales');
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création de la vente directe';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
              Choisissez le type
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SelectionCard
                  className={formik.values.saleType === DIRECT_SALE_TYPES.PRODUCT ? 'selected' : ''}
                  onClick={() => formik.setFieldValue('saleType', DIRECT_SALE_TYPES.PRODUCT)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Iconify icon="mdi:package-variant" width={48} height={48} sx={{ mb: 2, color: 'primary.main' }} />
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Produit
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vendez des objets physiques
                    </Typography>
                  </Box>
                </SelectionCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <SelectionCard
                  className={formik.values.saleType === DIRECT_SALE_TYPES.SERVICE ? 'selected' : ''}
                  onClick={() => formik.setFieldValue('saleType', DIRECT_SALE_TYPES.SERVICE)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Iconify icon="mdi:handshake" width={48} height={48} sx={{ mb: 2, color: 'primary.main' }} />
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Service
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Offrez vos services
                    </Typography>
                  </Box>
                </SelectionCard>
              </Grid>
            </Grid>
          </StepCard>
        );

      case 1:
        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
              Sélectionnez la catégorie
            </Typography>
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category._id}>
                  <SelectionCard
                    className={formik.values.productCategory === category._id ? 'selected' : ''}
                    onClick={() => {
                      formik.setFieldValue('productCategory', category._id);
                      setSelectedCategory(category);
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                      {category.name}
                    </Typography>
                  </SelectionCard>
                </Grid>
              ))}
            </Grid>
          </StepCard>
        );

      case 2:
        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
              Détails de la vente directe
            </Typography>

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Titre"
                {...formik.getFieldProps('title')}
                error={formik.touched.title && !!formik.errors.title}
                helperText={formik.touched.title && formik.errors.title}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                {...formik.getFieldProps('description')}
                error={formik.touched.description && !!formik.errors.description}
                helperText={formik.touched.description && formik.errors.description}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Prix (DA)"
                    {...formik.getFieldProps('price')}
                    error={formik.touched.price && !!formik.errors.price}
                    helperText={formik.touched.price && formik.errors.price}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">DA</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantité (0 = illimité)"
                    {...formik.getFieldProps('quantity')}
                    error={formik.touched.quantity && !!formik.errors.quantity}
                    helperText={formik.touched.quantity && formik.errors.quantity || 'Mettez 0 pour quantité illimitée'}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Wilaya"
                    {...formik.getFieldProps('wilaya')}
                    error={formik.touched.wilaya && !!formik.errors.wilaya}
                    helperText={formik.touched.wilaya && formik.errors.wilaya}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lieu"
                    {...formik.getFieldProps('place')}
                    error={formik.touched.place && !!formik.errors.place}
                    helperText={formik.touched.place && formik.errors.place}
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Images et vidéos
                </Typography>
                <UploadMultiFile
                  files={mediaFiles}
                  onDrop={(acceptedFiles) => setMediaFiles([...mediaFiles, ...acceptedFiles])}
                  onRemove={(file) => setMediaFiles(mediaFiles.filter((f) => f !== file))}
                  onRemoveAll={() => setMediaFiles([])}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isPro}
                    onChange={(e) => formik.setFieldValue('isPro', e.target.checked)}
                  />
                }
                label="Vente professionnelle"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.hidden}
                    onChange={(e) => formik.setFieldValue('hidden', e.target.checked)}
                  />
                }
                label="Vente anonyme"
              />
            </Stack>
          </StepCard>
        );

      default:
        return null;
    }
  };

  return (
    <Page title="Créer une vente directe">
      <MainContainer>
        <Breadcrumb links={[{ name: 'Ventes Directes', href: '/dashboard/direct-sales' }, { name: 'Créer' }]} />

        <HeaderCard>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Créer une vente directe
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Vendez vos produits et services à prix fixe
            </Typography>
          </Box>
        </HeaderCard>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Étape {activeStep + 1} sur {steps.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(((activeStep + 1) / steps.length) * 100)}% terminé
            </Typography>
          </Box>
          <ProgressBar variant="determinate" value={((activeStep + 1) / steps.length) * 100} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                size="large"
                variant="outlined"
              >
                Précédent
              </Button>

              {activeStep === steps.length - 1 ? (
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={isSubmitting}
                >
                  Créer la vente directe
                </LoadingButton>
              ) : (
                <Button onClick={handleNext} variant="contained" size="large">
                  Suivant
                </Button>
              )}
            </Box>
          </form>
        </FormikProvider>

        <Dialog open={showWarningModal} onClose={() => setShowWarningModal(false)}>
          <DialogTitle>Confirmer la création</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir créer cette vente directe ? Une fois créée, elle sera visible par tous les acheteurs.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowWarningModal(false)}>Annuler</Button>
            <LoadingButton onClick={handleConfirmSubmit} loading={isSubmitting} variant="contained">
              Confirmer
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </MainContainer>
    </Page>
  );
}

