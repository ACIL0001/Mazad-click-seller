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
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
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

  // Helper functions for category hierarchy
  const hasChildren = (category: any) => {
    return category.children && category.children.length > 0;
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const selectCategory = (category: any, path: any[] = []) => {
    const newPath = [...path, category];
    setSelectedCategory(category);
    setSelectedCategoryPath(newPath);
    formik.setFieldValue('productCategory', category._id);
    // Clear subcategory field since we're using a single category field now
    formik.setFieldValue('productSubCategory', '');
  };

  const handleTypeSelection = (type: string) => {
    formik.setFieldValue('saleType', type);
    // Reset category when type changes
    formik.setFieldValue('productCategory', '');
    setSelectedCategory(null);
    setSelectedCategoryPath([]);
  };

  // Recursive category hierarchy renderer
  const renderCategoryHierarchy = (categories: any[], level = 0, parentPath: any[] = []): JSX.Element[] => {
    return categories
      .filter(category => {
        // Filter by type only for root level categories
        if (level === 0) {
          // Log for debugging
          console.log('Direct Sale Category filtering debug:', {
            categoryName: category.name,
            categoryType: category.type,
            selectedSaleType: formik.values.saleType,
            match: category.type === formik.values.saleType
          });
          
          // For now, show all categories regardless of type to debug the issue
          // TODO: Fix category type mapping
          return true; // Temporarily show all categories
          // return category.type === formik.values.saleType;
        }
        return true;
      })
      .map((category) => {
        const categoryId = category._id;
        const hasSubcategories = hasChildren(category);
        const isExpanded = expandedCategories[categoryId];
        const isSelected = selectedCategory?._id === categoryId;
        const currentPath = [...parentPath, category];
        const hasError = formik.touched.productCategory && formik.errors.productCategory;

        return (
          <Box key={categoryId} sx={{ mb: 1 }}>
            {/* Category Item */}
            <Paper
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                ml: level * 3,
                background: level === 0 
                  ? 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)' 
                  : 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                border: level === 0 ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: isSelected 
                  ? `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}` 
                  : hasError
                  ? `0 2px 8px ${alpha(theme.palette.error.main, 0.2)}`
                  : '0 2px 8px rgba(0, 0, 0, 0.05)',
                transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                ...(isSelected && {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.light, 0.05),
                }),
                ...(hasError && !isSelected && {
                  borderColor: theme.palette.error.main,
                  backgroundColor: alpha(theme.palette.error.main, 0.05),
                }),
              }}
              onClick={() => hasSubcategories ? toggleCategory(categoryId) : selectCategory(category, parentPath)}
            >
              {/* Level Indicator */}
              {level > 0 && (
                <Box sx={{
                  position: 'absolute',
                  left: -12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 1,
                  bgcolor: '#cbd5e1',
                }} />
              )}
              
              {/* Expand/Collapse Icon */}
              {hasSubcategories && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(categoryId);
                  }}
                  sx={{
                    mr: 2,
                    bgcolor: isExpanded ? theme.palette.primary.main : 
                              hasError ? theme.palette.error.main : '#f1f5f9',
                    color: isExpanded ? 'white' : 
                           hasError ? 'white' : '#64748b',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: isExpanded ? theme.palette.primary.dark : 
                                hasError ? theme.palette.error.dark : theme.palette.primary.light,
                    },
                  }}
                >
                  <Iconify icon="eva:arrow-right-fill" width={16} />
                </IconButton>
              )}

              {/* Category Icon */}
              <Box
                sx={{
                  width: level === 0 ? 48 : 40,
                  height: level === 0 ? 48 : 40,
                  borderRadius: '50%',
                  bgcolor: isSelected 
                    ? theme.palette.primary.main 
                    : hasError
                    ? theme.palette.error.main
                    : alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  transition: 'all 0.3s ease',
                }}
              >
                <Iconify
                  icon={level === 0 ? "mdi:shape" : "mdi:subdirectory-arrow-right"}
                  width={level === 0 ? 24 : 20}
                  sx={{ color: isSelected || hasError ? 'white' : theme.palette.primary.main }}
                />
              </Box>

              {/* Category Info */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant={level === 0 ? 'h6' : 'subtitle1'}
                  sx={{
                    fontWeight: level === 0 ? 700 : 600,
                    color: '#1e293b',
                    mb: 0.5,
                  }}
                >
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasSubcategories 
                    ? `${category.children.length} sous-catégories` 
                    : category.description || 'Cliquer pour sélectionner'
                  }
                </Typography>
              </Box>

              {/* Subcategory Count Badge */}
              {hasSubcategories && (
                <Chip
                  label={category.children.length}
                  size="small"
                  sx={{
                    bgcolor: hasError ? theme.palette.error.main : theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 600,
                    ml: 1,
                  }}
                />
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 1,
                  }}
                >
                  <Iconify icon="eva:checkmark-fill" width={16} sx={{ color: 'white' }} />
                </Box>
              )}
            </Paper>

            {/* Recursive Subcategories */}
            {hasSubcategories && isExpanded && (
              <Box sx={{
                mt: 1,
                pl: 2,
                borderLeft: level < 2 ? '2px solid #f1f5f9' : 'none',
                ml: level * 3 + 2,
              }}>
                {renderCategoryHierarchy(category.children, level + 1, currentPath)}
              </Box>
            )}
          </Box>
        );
      });
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
      // Validate required fields
      if (!auth.user?._id) {
        throw new Error('Utilisateur non authentifié');
      }

      // Prepare the data payload
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

      console.log('Creating direct sale with data:', dataPayload);

      const formData = new FormData();
      
      // Append data as JSON string - THIS IS CORRECT
      formData.append('data', JSON.stringify(dataPayload));
      
      // CORRECTED: Use the exact field names that the backend expects
      mediaFiles.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          // Backend expects 'thumbs[]' with brackets
          formData.append('thumbs[]', file);
        } else if (file.type.startsWith('video/')) {
          // Backend expects 'videos[]' with brackets
          formData.append('videos[]', file);
        }
      });

      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const response = await DirectSaleAPI.create(formData);
      
      console.log('Direct sale created successfully:', response);

      enqueueSnackbar('Vente directe créée avec succès!', { variant: 'success' });
      
      setTimeout(() => {
        navigate('/dashboard/direct-sales');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error creating direct sale:', error);
      
      let errorMessage = 'Erreur lors de la création de la vente directe';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
        console.error('Server error response:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        console.error('No response received:', error.request);
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
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

            {/* Category Tree */}
            <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
              {categories.length > 0 ? (
                renderCategoryHierarchy(categories)
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
                    select
                    label="Wilaya"
                    {...formik.getFieldProps('wilaya')}
                    error={formik.touched.wilaya && !!formik.errors.wilaya}
                    helperText={formik.touched.wilaya && formik.errors.wilaya}
                  >
                    <MenuItem value="">Sélectionnez une wilaya</MenuItem>
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