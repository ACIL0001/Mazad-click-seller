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
  Chip,
  IconButton,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useState, useEffect, useMemo } from 'react';
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

const CategoryCard = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  height: '100%',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  color: theme.palette.text.primary,
  border: `2px solid transparent`,
  position: 'relative',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05), 0 1px 8px 0 rgba(0,0,0,0.03)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px 0 rgba(0,0,0,0.1), 0 4px 16px 0 rgba(0,0,0,0.06)',
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      backgroundColor: theme.palette.primary.main,
    }
  },
}));

const CategoryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  textAlign: 'center',
  height: '100%',
  justifyContent: 'center',
}));

const CategoryIcon = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '&.selected': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    transform: 'scale(1.1)',
    borderColor: theme.palette.primary.main,
  },
}));

const SubCategoryCard = styled(Paper)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: `2px solid transparent`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)',
    transform: 'translateY(-2px)',
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.light, 0.08),
    boxShadow: `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const SubCategoryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const SubCategoryIcon = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.grey[300], 0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&.selected': {
    backgroundColor: theme.palette.primary.main,
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
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const validationSchema = Yup.object().shape({
    title: Yup.string().min(3, t('directSales.create.errors.titleMinLength')).required(t('directSales.create.errors.titleRequired')),
    description: Yup.string().min(10, t('directSales.create.errors.descriptionMinLength')).required(t('directSales.create.errors.descriptionRequired')),
    saleType: Yup.string().oneOf(Object.values(DIRECT_SALE_TYPES), t('directSales.create.errors.invalidType')).required(t('directSales.create.errors.typeRequired')),
    productCategory: Yup.string().required(t('directSales.create.errors.categoryRequired')),
    price: Yup.number().min(1, t('directSales.create.errors.pricePositive')).required(t('directSales.create.errors.priceRequired')),
    wilaya: Yup.string().required(t('directSales.create.errors.wilayaRequired')),
    place: Yup.string().required(t('directSales.create.errors.placeRequired')),
    quantity: Yup.number().min(0, t('directSales.create.errors.quantityNegative')),
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

  // Dynamic steps that show selected values - recalculated when formik values or selectedCategory change
  const steps = useMemo(() => {
    const getStepTitle = (stepIndex: number) => {
      switch (stepIndex) {
        case 0:
          // Show selected type if available, otherwise show "Type"
          if (formik.values.saleType === DIRECT_SALE_TYPES.PRODUCT) {
            return t('common.product');
          } else if (formik.values.saleType === DIRECT_SALE_TYPES.SERVICE) {
            return t('common.service');
          }
          return t('directSales.create.step1.type');
        case 1:
          // Show selected category name if available, otherwise show "Catégorie"
          if (selectedCategory && selectedCategory.name) {
            return selectedCategory.name;
          }
          return t('common.categories');
        case 2:
          return t('createAuction.steps.details');
        default:
          return '';
      }
    };

    return [
      { title: getStepTitle(0), description: t('directSales.create.step1.description') },
      { title: getStepTitle(1), description: t('directSales.create.step2.description') },
      { title: getStepTitle(2), description: t('directSales.create.step3.description') },
    ];
  }, [formik.values.saleType, selectedCategory]);

  // Fetch categories when sale type changes
  useEffect(() => {
    if (formik.values.saleType) {
      fetchCategories(formik.values.saleType);
    } else {
      // Clear categories when no type is selected
      setCategories([]);
      setSelectedCategory(null);
      setSelectedCategoryPath([]);
    }
  }, [formik.values.saleType]);

  const fetchCategories = async (saleType?: string) => {
    try {
      const response = await CategoryAPI.getCategoryTree();
      
      // Handle different response structures
      let categoryData = null;
      let isSuccess = false;
      
      if (response) {
        if (response.success && Array.isArray(response.data)) {
          categoryData = response.data;
          isSuccess = true;
        } else if (Array.isArray(response)) {
          categoryData = response;
          isSuccess = true;
        } else if (response.data && Array.isArray(response.data)) {
          categoryData = response.data;
          isSuccess = true;
        }
      }
      
      if (isSuccess && categoryData && categoryData.length > 0) {
        // Filter categories by sale type
        const filteredCategories = categoryData.filter((category: any) => {
          // For now, show all categories regardless of type to debug the issue
          // TODO: Fix category type mapping
          return true; // Temporarily show all categories
          // return category.type === saleType || 
          //        category.saleType === saleType ||
          //        category.forSaleType === saleType ||
          //        !category.type; // Include categories without specific type
        });
        setCategories(filteredCategories);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Erreur lors du chargement des catégories', { variant: 'error' });
      
      // Fallback: set empty array
      setCategories([]);
    }
  };

  const selectCategory = (category: any, path: any[] = []) => {
    const newPath = [...path, category];
    setSelectedCategory(category);
    setSelectedCategoryPath(newPath);
    formik.setFieldValue('productCategory', category._id);
    // Clear subcategory field since we're using a single category field now
    formik.setFieldValue('productSubCategory', '');
    // Automatically advance to the next step after the formik values are updated
    setTimeout(() => {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 0);
  };

  const handleTypeSelection = (type: string) => {
    formik.setFieldValue('saleType', type);
    // Reset category when type changes
    formik.setFieldValue('productCategory', '');
    setSelectedCategory(null);
    setSelectedCategoryPath([]);
    // Automatically advance to the next step after the formik values are updated
    setTimeout(() => {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 0);
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
                  onClick={() => handleTypeSelection(DIRECT_SALE_TYPES.PRODUCT)}
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
                  onClick={() => handleTypeSelection(DIRECT_SALE_TYPES.SERVICE)}
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

            {/* Category Validation Error */}
            {formik.touched.productCategory && formik.errors.productCategory && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {formik.errors.productCategory}
              </Alert>
            )}

            {/* Category Breadcrumb */}
            {selectedCategoryPath.length > 0 && (
              <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Catégorie sélectionnée :
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  {selectedCategoryPath.map((cat, index) => (
                    <Box key={cat._id} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={cat.name}
                        variant={index === selectedCategoryPath.length - 1 ? 'filled' : 'outlined'}
                        color="primary"
                        size="small"
                      />
                      {index < selectedCategoryPath.length - 1 && (
                        <Iconify icon="eva:arrow-right-fill" width={16} sx={{ mx: 1, color: 'text.secondary' }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Category Grid - Circular Layout */}
            <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
              {categories.length > 0 ? (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  {categories
                    .filter(category => {
                      // Filter by type for root level categories
                      return category.type === formik.values.saleType || !category.type;
                    })
                    .map((category) => {
                      const isSelected = selectedCategory?._id === category._id;
                      const hasError = formik.touched.productCategory && formik.errors.productCategory && !isSelected;

                      return (
                        <Grid item xs={6} sm={4} md={3} key={category._id}>
                          <Box
                            onClick={() => selectCategory(category, [])}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 3,
                              borderRadius: 3,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              border: `2px solid ${isSelected ? theme.palette.primary.main : hasError ? theme.palette.error.main : 'transparent'}`,
                              backgroundColor: isSelected 
                                ? alpha(theme.palette.primary.main, 0.05)
                                : hasError
                                ? alpha(theme.palette.error.main, 0.05)
                                : 'transparent',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                backgroundColor: isSelected 
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : alpha(theme.palette.primary.main, 0.03),
                                borderColor: isSelected 
                                  ? theme.palette.primary.main
                                  : alpha(theme.palette.primary.main, 0.3),
                              },
                            }}
                          >
                            {/* Circular Icon */}
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: isSelected 
                                  ? theme.palette.primary.main
                                  : hasError
                                  ? theme.palette.error.main
                                  : alpha(theme.palette.grey[300], 0.5),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 2,
                                transition: 'all 0.3s ease',
                                boxShadow: isSelected 
                                  ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                                  : 'none',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              {isSelected ? (
                                <Iconify icon="eva:checkmark-fill" width={32} sx={{ color: 'white' }} />
                              ) : (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: isSelected ? 'white' : theme.palette.text.secondary,
                                    fontSize: '0.7rem',
                                    textAlign: 'center',
                                    px: 1
                                  }}
                                >
                                  Category
                                </Typography>
                              )}
                            </Box>
                            
                            {/* Category Name */}
                            <Typography
                              variant="body2"
                              sx={{
                                textAlign: 'center',
                                fontWeight: isSelected ? 600 : 500,
                                color: isSelected 
                                  ? theme.palette.primary.main
                                  : hasError
                                  ? theme.palette.error.main
                                  : theme.palette.text.primary,
                                wordBreak: 'break-word',
                                maxWidth: '100%',
                              }}
                            >
                              {category.name}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary">
                    {formik.values.saleType 
                      ? `Aucune catégorie disponible pour les ${formik.values.saleType === DIRECT_SALE_TYPES.PRODUCT ? 'produits' : 'services'}`
                      : 'Veuillez d\'abord sélectionner un type de vente'
                    }
                  </Typography>
                </Box>
              )}
            </Box>
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
                label={t('directSales.create.form.title')}
                {...formik.getFieldProps('title')}
                error={formik.touched.title && !!formik.errors.title}
                helperText={formik.touched.title && formik.errors.title}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label={t('directSales.create.form.description')}
                {...formik.getFieldProps('description')}
                error={formik.touched.description && !!formik.errors.description}
                helperText={formik.touched.description && formik.errors.description}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('directSales.create.form.price')}
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
                    label={t('directSales.create.form.quantity')}
                    {...formik.getFieldProps('quantity')}
                    error={formik.touched.quantity && !!formik.errors.quantity}
                    helperText={formik.touched.quantity && formik.errors.quantity || t('directSales.create.form.quantityHelper')}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('directSales.create.form.wilaya')}
                    {...formik.getFieldProps('wilaya')}
                    error={formik.touched.wilaya && !!formik.errors.wilaya}
                    helperText={formik.touched.wilaya && formik.errors.wilaya}
                  >
                    <MenuItem value="">{t('directSales.create.form.selectWilaya')}</MenuItem>
                    {[
                      "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", 
                      "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", 
                      "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", 
                      "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", 
                      "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", 
                      "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", 
                      "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane"
                    ].map((wilaya) => (
                      <MenuItem key={wilaya} value={wilaya}>
                        {wilaya}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('directSales.create.form.place')}
                    {...formik.getFieldProps('place')}
                    error={formik.touched.place && !!formik.errors.place}
                    helperText={formik.touched.place && formik.errors.place}
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  {t('directSales.create.form.imagesAndVideos')}
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
                label={t('directSales.create.form.professionalSale')}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.hidden}
                    onChange={(e) => formik.setFieldValue('hidden', e.target.checked)}
                  />
                }
                label={t('directSales.create.form.anonymousSale')}
              />
            </Stack>
          </StepCard>
        );

      default:
        return null;
    }
  };

  return (
    <Page title={t('directSales.createTitle') || 'Créer une vente directe'}>
      <MainContainer>
        <Breadcrumb links={[{ name: t('navigation.directSales') || 'Ventes Directes', href: '/dashboard/direct-sales' }, { name: t('common.create') || 'Créer' }]} />

        <HeaderCard>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              {t('directSales.createTitle') || 'Créer une vente directe'}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {t('directSales.createSubtitle') || 'Vendez vos produits et services à prix fixe'}
            </Typography>
          </Box>
        </HeaderCard>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('directSales.step', { current: activeStep + 1, total: steps.length }) || `Étape ${activeStep + 1} sur ${steps.length}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('directSales.progress', { percent: Math.round(((activeStep + 1) / steps.length) * 100) }) || `${Math.round(((activeStep + 1) / steps.length) * 100)}% terminé`}
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

              {activeStep === steps.length - 1 && (
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={isSubmitting}
                >
                  Créer la vente directe
                </LoadingButton>
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
