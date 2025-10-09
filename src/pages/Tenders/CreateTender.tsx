import {
  Box,
  Card,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  styled,
  useTheme,
  Divider,
  Chip,
  IconButton,
  FormControlLabel,
  Switch,
  Alert,
  LinearProgress,
  MenuItem,
  StepConnector,
  stepConnectorClasses,
  type StepIconProps
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, useFormik, FormikProvider } from 'formik';
import Breadcrumb from '@/components/Breadcrumbs';
import Iconify from '@/components/Iconify';
import { UploadMultiFile } from '@/components/upload/UploadMultiFile';
import Page from '@/components/Page';
import { TendersAPI } from '@/api/tenders';
import { CategoryAPI } from '@/api/category';
import { SubCategoryAPI } from '@/api/subcategory';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { alpha } from '@mui/material/styles';
import { ACCOUNT_TYPE } from '@/types/User';
import { loadGoogleMapsScript } from '@/utils/loadGoogleMapsScript';

// Modern styled components (reuse from CreateAuction with tender-specific names)
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
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
}));

const SelectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid transparent`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const IconContainer = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  transition: 'all 0.3s ease',
  '&.selected': {
    backgroundColor: theme.palette.primary.main,
    transform: 'scale(1.1)',
  }
}));

const CategoryCard = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  overflow: "hidden",
  height: "100%",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  color: theme.palette.text.primary,
  border: `2px solid transparent`,
  position: "relative",
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05), 0 1px 8px 0 rgba(0,0,0,0.03)",
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 16px 48px 0 rgba(0,0,0,0.1), 0 8px 24px 0 rgba(0,0,0,0.06)",
    borderColor: alpha(theme.palette.primary.main, 0.4),
  },
  "&.selected": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const DurationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  border: "2px solid transparent",
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  position: "relative",
  textAlign: "center",
  boxShadow: "0 4px 16px 0 rgba(0,0,0,0.05), 0 1px 8px 0 rgba(0,0,0,0.03)",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px 0 rgba(0,0,0,0.08), 0 4px 16px 0 rgba(0,0,0,0.05)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  "&.selected": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  }
}));

const TENDER_TYPES = {
  PRODUCT: "PRODUCT",
  SERVICE: "SERVICE",
};

const TENDER_AUCTION_TYPES = {
  CLASSIC: "CLASSIC",
  EXPRESS: "EXPRESS",
};

// Google Maps API types
declare global {
  interface Window {
    google: any;
  }
}

export default function CreateTender() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { auth, isLogged } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wilayaAutoDetected, setWilayaAutoDetected] = useState(false);
  const [detectedWilaya, setDetectedWilaya] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { title: 'Type de produit/service', description: 'Choisissez produit ou service' },
    { title: 'Type d\'appel d\'offres', description: 'Choisissez le type d\'appel d\'offres' },
    { title: 'Catégorie', description: 'Sélectionnez la catégorie' },
    { title: 'Détails', description: 'Remplissez les informations' }
  ];

  // Helper functions for category hierarchy (reuse from CreateAuction)
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
    formik.setFieldValue('category', category._id);
    formik.setFieldValue('subCategory', '');
  };

  const TimeOptions = [
    { label: '2 jours', value: 2, icon: 'mdi:clock-outline' },
    { label: '7 jours', value: 7, icon: 'mdi:calendar-week' },
    { label: '15 jours', value: 15, icon: 'mdi:calendar-month' },
    { label: '1 mois', value: 30, icon: 'mdi:calendar' },
    { label: '2 mois', value: 60, icon: 'mdi:calendar-multiple' }
  ];

  const ExpressTimeOptions = [
    { label: '2 heures', value: 2, icon: 'mdi:lightning-bolt' },
    { label: '4 heures', value: 4, icon: 'mdi:clock-fast' },
    { label: '8 heures', value: 8, icon: 'mdi:clock' },
    { label: '16 heures', value: 16, icon: 'mdi:clock-time-four' },
    { label: '24 heures', value: 24, icon: 'mdi:clock-time-twelve' }
  ];

  // Validation schema
  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .min(3, 'Le titre doit contenir au moins 3 caractères')
      .max(100, 'Le titre est trop long')
      .required('Le titre est requis'),
    description: Yup.string()
      .min(10, 'La description doit contenir au moins 10 caractères')
      .required('La description est requise'),
    tenderType: Yup.string()
      .oneOf(Object.values(TENDER_TYPES))
      .required('Le type d\'appel d\'offres est requis'),
    auctionType: Yup.string()
      .oneOf(Object.values(TENDER_AUCTION_TYPES))
      .required('Le type d\'appel d\'offres est requis'),
    category: Yup.string()
      .required('La catégorie est requise'),
    duration: Yup.object()
      .required('La durée est requise'),
    wilaya: Yup.string()
      .required('La wilaya est requise'),
    location: Yup.string()
      .required('L\'emplacement est requis'),
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      tenderType: TENDER_TYPES.PRODUCT,
      auctionType: TENDER_AUCTION_TYPES.CLASSIC,
      category: '',
      subCategory: '',
      duration: null,
      requirements: [],
      location: '',
      wilaya: '',
      quantity: '',
      isPro: false,
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      console.log('📋 Formik onSubmit called for tender');
      await handleSubmit(values);
    },
  });

  // Helper function to scroll to first error field
  const scrollToField = (fieldName: string) => {
    console.log(`🎯 scrollToField called with: ${fieldName}`);
    
    setTimeout(() => {
      let element: Element | null = null;
      
      // Special handling for duration (which is not a standard input field)
      if (fieldName === 'duration') {
        element = document.getElementById('tender-duration-section');
      } else {
        element = document.querySelector(`[name="${fieldName}"]`);
      }
      
      if (element) {
        console.log(`✅ Element found for ${fieldName}, scrolling now...`);
        
        // Scroll to element with some offset for better visibility
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 120;
        
        console.log(`Scroll position calculated: ${offsetPosition}px`);
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Focus the field for better visibility (only for input elements)
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
          setTimeout(() => {
            console.log(`Focusing and highlighting field: ${fieldName}`);
            (element as HTMLElement).focus();
            // Add a visual pulse effect
            element.style.transition = 'box-shadow 0.3s ease';
            element.style.boxShadow = '0 0 0 4px rgba(255, 0, 0, 0.4)';
            setTimeout(() => {
              element.style.boxShadow = '';
            }, 2500);
          }, 400);
        } else if (fieldName === 'duration') {
          // For duration section, highlight the entire section briefly
          setTimeout(() => {
            console.log('Highlighting duration section');
            const htmlElement = element as HTMLElement;
            htmlElement.style.transition = 'all 0.5s ease';
            htmlElement.style.backgroundColor = 'rgba(255, 0, 0, 0.08)';
            htmlElement.style.borderRadius = '12px';
            htmlElement.style.padding = '16px';
            setTimeout(() => {
              htmlElement.style.backgroundColor = '';
              htmlElement.style.padding = '';
            }, 2500);
          }, 400);
        }
        
        console.log(`✅ Successfully scrolled to field: ${fieldName}`);
      } else {
        console.error(`❌ Field not found: ${fieldName}`);
        console.log('Available input names:', Array.from(document.querySelectorAll('input, textarea, select')).map((el: any) => el.name).filter(Boolean));
      }
    }, 300);
  };

  // Validation functions for each step
  const validateStep = (step: number, values: any): boolean => {
    switch (step) {
      case 0: // Tender Type
        if (!values.tenderType) {
          enqueueSnackbar('Veuillez sélectionner un type (Produit ou Service)', { variant: 'error' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
        return true;

      case 1: // Auction Type
        if (!values.auctionType) {
          enqueueSnackbar('Veuillez sélectionner un type d\'appel d\'offres', { variant: 'error' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
        return true;

      case 2: // Category
        if (!values.category) {
          enqueueSnackbar('Veuillez sélectionner une catégorie', { variant: 'error' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
        return true;

      case 3: // Details
        console.log('📝 Validating Step 3 (Details)...');
        const errors = [];
        let firstErrorField = '';
        
        if (!values.title || values.title.length < 3) {
          errors.push('Le titre est requis et doit contenir au moins 3 caractères');
          if (!firstErrorField) {
            firstErrorField = 'title';
            console.log('❌ First error: title');
          }
        }
        if (!values.description || values.description.length < 10) {
          errors.push('La description est requise et doit contenir au moins 10 caractères');
          if (!firstErrorField) {
            firstErrorField = 'description';
            console.log('❌ First error: description');
          }
        }
        if (!values.duration) {
          errors.push('La durée est requise');
          if (!firstErrorField) {
            firstErrorField = 'duration';
            console.log('❌ First error: duration');
          }
        }
        if (!values.location) {
          errors.push('L\'emplacement est requis');
          if (!firstErrorField) {
            firstErrorField = 'location';
            console.log('❌ First error: location');
          }
        }
        if (!values.wilaya) {
          errors.push('La wilaya est requise');
          if (!firstErrorField) {
            firstErrorField = 'wilaya';
            console.log('❌ First error: wilaya');
          }
        }

        if (errors.length > 0) {
          console.log(`❌ Step 3 validation failed with ${errors.length} errors`);
          console.log('First error field:', firstErrorField);
          console.log('All errors:', errors);
          
          // Show ONLY the first error message (user-friendly, one at a time)
          enqueueSnackbar(errors[0], { variant: 'error', autoHideDuration: 5000 });
          
          // Scroll to the first error field
          if (firstErrorField) {
            console.log(`🚀 Calling scrollToField with: ${firstErrorField}`);
            scrollToField(firstErrorField);
          } else {
            console.warn('⚠️ No firstErrorField found, cannot scroll!');
          }
          
          return false;
        }
        console.log('✅ Step 3 validation passed');
        return true;

      default:
        return true;
    }
  };

  // Helper function to mark fields as touched for validation
  const markStepFieldsAsTouched = (step: number) => {
    const touchedFields: any = {};
    
    switch (step) {
      case 0:
        touchedFields.tenderType = true;
        break;
      case 1:
        touchedFields.auctionType = true;
        break;
      case 2:
        touchedFields.category = true;
        break;
      case 3:
        touchedFields.title = true;
        touchedFields.description = true;
        touchedFields.duration = true;
        touchedFields.location = true;
        touchedFields.wilaya = true;
        break;
    }
    
    formik.setTouched(touchedFields);
  };

  // Load categories and handle auth check (reuse from CreateAuction)
  useEffect(() => {
    if (!isLogged) {
      enqueueSnackbar('Veuillez vous connecter pour créer un appel d\'offres', { variant: 'error' });
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const response = await CategoryAPI.getCategoryTree();
        
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
          setCategories(categoryData);
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error: any) {
        enqueueSnackbar('Erreur lors du chargement des données', { variant: 'error' });
      }
    };

    loadData();
  }, [isLogged, navigate, enqueueSnackbar]);

  // List of Algerian wilayas (reuse from CreateAuction)
  const WILAYAS = [
    { code: "01", name: "Adrar" },
    { code: "02", name: "Chlef" },
    { code: "03", name: "Laghouat" },
    { code: "04", name: "Oum El Bouaghi" },
    { code: "05", name: "Batna" },
    { code: "06", name: "Béjaïa" },
    { code: "07", name: "Biskra" },
    { code: "08", name: "Béchar" },
    { code: "09", name: "Blida" },
    { code: "10", name: "Bouira" },
    { code: "11", name: "Tamanrasset" },
    { code: "12", name: "Tébessa" },
    { code: "13", name: "Tlemcen" },
    { code: "14", name: "Tiaret" },
    { code: "15", name: "Tizi Ouzou" },
    { code: "16", name: "Alger" },
    { code: "17", name: "Djelfa" },
    { code: "18", name: "Jijel" },
    { code: "19", name: "Sétif" },
    { code: "20", name: "Saïda" },
    { code: "21", name: "Skikda" },
    { code: "22", name: "Sidi Bel Abbès" },
    { code: "23", name: "Annaba" },
    { code: "24", name: "Guelma" },
    { code: "25", name: "Constantine" },
    { code: "26", name: "Médéa" },
    { code: "27", name: "Mostaganem" },
    { code: "28", name: "M'Sila" },
    { code: "29", name: "Mascara" },
    { code: "30", name: "Ouargla" },
    { code: "31", name: "Oran" },
    { code: "32", name: "El Bayadh" },
    { code: "33", name: "Illizi" },
    { code: "34", name: "Bordj Bou Arreridj" },
    { code: "35", name: "Boumerdès" },
    { code: "36", name: "El Tarf" },
    { code: "37", name: "Tindouf" },
    { code: "38", name: "Tissemsilt" },
    { code: "39", name: "El Oued" },
    { code: "40", name: "Khenchela" },
    { code: "41", name: "Souk Ahras" },
    { code: "42", name: "Tipaza" },
    { code: "43", name: "Mila" },
    { code: "44", name: "Aïn Defla" },
    { code: "45", name: "Naâma" },
    { code: "46", name: "Aïn Témouchent" },
    { code: "47", name: "Ghardaïa" },
    { code: "48", name: "Relizane" },
    { code: "49", name: "Timimoun" },
    { code: "50", name: "Bordj Badji Mokhtar" },
    { code: "51", name: "Ouled Djellal" },
    { code: "52", name: "Béni Abbès" },
    { code: "53", name: "In Salah" },
    { code: "54", name: "In Guezzam" },
    { code: "55", name: "Touggourt" },
    { code: "56", name: "Djanet" },
    { code: "57", name: "El M'Ghair" },
    { code: "58", name: "El Meniaa" },
  ];

  // Google Maps integration (reuse from CreateAuction)
  useEffect(() => {
    if (inputRef.current) {
      loadGoogleMapsScript().then(() => {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current!, {
          types: ['geocode'],
          componentRestrictions: { country: 'dz' },
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const placeValue = place.formatted_address || place.name;
          formik.setFieldValue('location', placeValue);

          // Wilaya detection logic (same as CreateAuction)
          if (place.address_components) {
            let wilayaFound = false;

            const wilayaComponent = place.address_components.find((component: any) =>
              component.types.includes('administrative_area_level_1')
            );

            if (wilayaComponent) {
              const wilayaName = wilayaComponent.long_name;
              const exactMatch = WILAYAS.find(wilaya =>
                wilaya.name.toLowerCase() === wilayaName.toLowerCase() ||
                wilayaName.toLowerCase().includes(wilaya.name.toLowerCase()) ||
                wilaya.name.toLowerCase().includes(wilayaName.toLowerCase())
              );

              if (exactMatch) {
                formik.setFieldValue('wilaya', exactMatch.name);
                setWilayaAutoDetected(true);
                setDetectedWilaya(exactMatch.name);
                setForceUpdate(prev => prev + 1);
                wilayaFound = true;
              }
            }

            if (!wilayaFound) {
              setWilayaAutoDetected(false);
              setDetectedWilaya('');
              enqueueSnackbar('Wilaya non détectée. Veuillez sélectionner manuellement.', { variant: 'warning' });
            }
          }
        });
      }).catch(console.error);
    }
  }, [formik]);

  const handleNext = () => {
    // Validate current step before proceeding
    const isValid = validateStep(activeStep, formik.values);
    
    if (!isValid) {
      // Mark fields as touched to show validation errors
      markStepFieldsAsTouched(activeStep);
      return;
    }

    setActiveStep((prev) => prev + 1);
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset category selection when tender type changes
  const handleTenderTypeChange = (tenderType: string) => {
    formik.setFieldValue('tenderType', tenderType);
    // Reset category selection when type changes
    setSelectedCategory(null);
    setSelectedCategoryPath([]);
    formik.setFieldValue('category', '');
    formik.setFieldValue('subCategory', '');
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    // Scroll to top when going back
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (values: any) => {
    console.log('=== SUBMIT BUTTON CLICKED (TENDER) ===');
    console.log('Current step:', activeStep);
    console.log('Form values:', values);
    
    // Validate all steps before submission
    for (let step = 0; step < steps.length; step++) {
      console.log(`Validating step ${step}...`);
      if (!validateStep(step, values)) {
        console.log(`❌ Validation failed on step ${step}`);
        setActiveStep(step);
        markStepFieldsAsTouched(step);
        
        // Don't show generic error message - validateStep already showed specific error
        // Only show message if we're switching steps
        if (step !== activeStep) {
          const stepNames = ['le type de produit/service', 'le type d\'appel d\'offres', 'la catégorie', 'les détails'];
          enqueueSnackbar(`Veuillez compléter ${stepNames[step]}`, { variant: 'warning' });
        }
        
        // If error is on step 0, 1, or 2, scroll to top to show step selector
        // If error is on step 3 (current step), validateStep already handled scrolling to the field
        if (step !== 3) {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        }
        return;
      }
      console.log(`✅ Step ${step} validated successfully`);
    }

    // Additional validation for attachments
    if (attachments.length === 0) {
      enqueueSnackbar('Veuillez télécharger au moins une pièce jointe', { variant: 'error' });
      setActiveStep(3); // Go to details step where files are uploaded
      // Scroll to attachments section
      setTimeout(() => {
        const attachmentsSection = Array.from(document.querySelectorAll('h5')).find(
          (el) => el.textContent?.includes('Pièces jointes')
        );
        if (attachmentsSection) {
          attachmentsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
      return;
    }

    if (auth.user?.rate < 3) {
      enqueueSnackbar('Votre note est trop faible pour créer un appel d\'offres', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      let endingDate: Date;

      if (values.auctionType === TENDER_AUCTION_TYPES.CLASSIC) {
        endingDate = new Date(now.getTime() + (values.duration.value * 24 * 60 * 60 * 1000));
      } else {
        endingDate = new Date(now.getTime() + (values.duration.value * 60 * 60 * 1000));
      }

      const dataPayload = {
        owner: auth.user._id,
        title: values.title,
        description: values.description,
        tenderType: values.tenderType,
        auctionType: values.auctionType,
        category: values.category,
        subCategory: values.subCategory || undefined,
        startingAt: now.toISOString(),
        endingAt: endingDate.toISOString(),
        requirements: values.requirements || [],
        location: values.location,
        wilaya: values.wilaya,
        isPro: values.isPro,
        quantity: values.quantity || '',
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(dataPayload));

      attachments.forEach((file) => {
        formData.append('attachments[]', file);
      });

      await TendersAPI.create(formData);

      enqueueSnackbar('Appel d\'offres créé avec succès!', { variant: 'success' });
      
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création de l\'appel d\'offres';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setAttachments(acceptedFiles);
  };

  const handleRemoveFile = (file: File) => {
    setAttachments(attachments.filter(f => f !== file));
  };

  const handleRemoveAllFiles = () => {
    setAttachments([]);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
              Choisissez le type de produit/service
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SelectionCard
                  className={formik.values.tenderType === TENDER_TYPES.PRODUCT ? 'selected' : ''}
                  onClick={() => handleTenderTypeChange(TENDER_TYPES.PRODUCT)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <IconContainer className={formik.values.tenderType === TENDER_TYPES.PRODUCT ? 'selected' : ''}>
                      <Iconify
                        icon="mdi:package-variant"
                        width={32}
                        height={32}
                        sx={{ color: formik.values.tenderType === TENDER_TYPES.PRODUCT ? 'white' : theme.palette.primary.main }}
                      />
                    </IconContainer>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Produit
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recherchez des produits ou matériels spécifiques
                    </Typography>
                  </Box>
                </SelectionCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <SelectionCard
                  className={formik.values.tenderType === TENDER_TYPES.SERVICE ? 'selected' : ''}
                  onClick={() => handleTenderTypeChange(TENDER_TYPES.SERVICE)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <IconContainer className={formik.values.tenderType === TENDER_TYPES.SERVICE ? 'selected' : ''}>
                      <Iconify
                        icon="mdi:handshake"
                        width={32}
                        height={32}
                        sx={{ color: formik.values.tenderType === TENDER_TYPES.SERVICE ? 'white' : theme.palette.primary.main }}
                      />
                    </IconContainer>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Service
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recherchez des prestations de services professionnels
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
              Choisissez le type d'appel d'offres
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <SelectionCard
                  className={formik.values.auctionType === TENDER_AUCTION_TYPES.CLASSIC ? 'selected' : ''}
                  onClick={() => formik.setFieldValue('auctionType', TENDER_AUCTION_TYPES.CLASSIC)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <IconContainer className={formik.values.auctionType === TENDER_AUCTION_TYPES.CLASSIC ? 'selected' : ''}>
                      <Iconify
                        icon="mdi:clock-outline"
                        width={24}
                        height={24}
                        sx={{ color: formik.values.auctionType === TENDER_AUCTION_TYPES.CLASSIC ? 'white' : theme.palette.primary.main }}
                      />
                    </IconContainer>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Classique
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Appel d'offres traditionnel sur plusieurs jours
                    </Typography>
                  </Box>
                </SelectionCard>
              </Grid>

              <Grid item xs={12} sm={6}>
                <SelectionCard
                  className={formik.values.auctionType === TENDER_AUCTION_TYPES.EXPRESS ? 'selected' : ''}
                  onClick={() => formik.setFieldValue('auctionType', TENDER_AUCTION_TYPES.EXPRESS)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <IconContainer className={formik.values.auctionType === TENDER_AUCTION_TYPES.EXPRESS ? 'selected' : ''}>
                      <Iconify
                        icon="mdi:lightning-bolt"
                        width={24}
                        height={24}
                        sx={{ color: formik.values.auctionType === TENDER_AUCTION_TYPES.EXPRESS ? 'white' : theme.palette.primary.main }}
                      />
                    </IconContainer>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Express
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Appel d'offres rapide en quelques heures
                    </Typography>
                  </Box>
                </SelectionCard>
              </Grid>
            </Grid>
          </StepCard>
        );

      case 2:
        // Category selection (reuse category hierarchy from CreateAuction)
        const renderCategoryHierarchy = (categories: any[], level = 0, parentPath: any[] = []): JSX.Element[] => {
          return categories
            .filter(category => {
              // Filter by type only for root level categories
              if (level === 0) {
                // Log for debugging
                console.log('Category filtering debug:', {
                  categoryName: category.name,
                  categoryType: category.type,
                  selectedTenderType: formik.values.tenderType,
                  match: category.type === formik.values.tenderType
                });
                
                // Filter categories based on tender type
                return category.type === formik.values.tenderType;
              }
              return true;
            })
            .map((category) => {
              const categoryId = category._id;
              const hasSubcategories = hasChildren(category);
              const isExpanded = expandedCategories[categoryId];
              const isSelected = selectedCategory?._id === categoryId;
              const currentPath = [...parentPath, category];

              return (
                <Box key={categoryId} sx={{ mb: 1 }}>
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
                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                      ...(isSelected && {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.light, 0.05),
                      }),
                    }}
                    onClick={() => hasSubcategories ? toggleCategory(categoryId) : selectCategory(category, parentPath)}
                  >
                    {hasSubcategories && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(categoryId);
                        }}
                        sx={{
                          mr: 2,
                          bgcolor: isExpanded ? theme.palette.primary.main : '#f1f5f9',
                          color: isExpanded ? 'white' : '#64748b',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Iconify icon="eva:arrow-right-fill" width={16} />
                      </IconButton>
                    )}

                    <Box
                      sx={{
                        width: level === 0 ? 48 : 40,
                        height: level === 0 ? 48 : 40,
                        borderRadius: '50%',
                        bgcolor: isSelected 
                          ? theme.palette.primary.main 
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
                        sx={{ color: isSelected ? 'white' : theme.palette.primary.main }}
                      />
                    </Box>

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

                    {hasSubcategories && (
                      <Chip
                        label={category.children.length}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          fontWeight: 600,
                          ml: 1,
                        }}
                      />
                    )}

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

        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
              Sélectionnez la catégorie
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Type sélectionné :</strong> {formik.values.tenderType === TENDER_TYPES.PRODUCT ? 'Produit' : 'Service'} - 
                Affichage des catégories correspondantes
              </Typography>
            </Alert>

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

            <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
              {categories.length > 0 ? (
                (() => {
                  const filteredCategories = categories.filter(category => category.type === formik.values.tenderType);
                  return filteredCategories.length > 0 ? (
                    renderCategoryHierarchy(categories)
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aucune catégorie disponible pour le type "{formik.values.tenderType === TENDER_TYPES.PRODUCT ? 'Produit' : 'Service'}"
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Veuillez contacter l'administrateur pour ajouter des catégories pour ce type.
                      </Typography>
                    </Box>
                  );
                })()
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary">
                    Chargement des catégories...
                  </Typography>
                </Box>
              )}
            </Box>
          </StepCard>
        );

      case 3:
        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
              Détails de l'appel d'offres
            </Typography>

            <Grid container spacing={4}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Informations de base
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  name="title"
                  label="Titre de l'appel d'offres"
                  value={formik.values.title}
                  onChange={formik.handleChange('title')}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  placeholder="Ex: Recherche fournisseur ordinateurs portables"
                />
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Description détaillée et cahier des charges"
                  value={formik.values.description}
                  onChange={formik.handleChange('description')}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  placeholder="Décrivez vos besoins, spécifications techniques, délais..."
                />
              </Grid>

              {formik.values.tenderType === TENDER_TYPES.PRODUCT && (
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Quantité souhaitée"
                    value={formik.values.quantity}
                    onChange={formik.handleChange('quantity')}
                    placeholder="Ex: 50 unités, 100 pièces..."
                  />
                </Grid>
              )}


              {/* Duration */}
              <Grid item xs={12} id="tender-duration-section">
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Durée de l'appel d'offres
                </Typography>

                <Grid container spacing={2}>
                  {(formik.values.auctionType === TENDER_AUCTION_TYPES.CLASSIC ? TimeOptions : ExpressTimeOptions).map((option) => (
                    <Grid item xs={6} sm={4} md={2.4} key={option.value}>
                      <DurationCard
                        className={formik.values.duration?.value === option.value ? 'selected' : ''}
                        onClick={() => formik.setFieldValue('duration', option)}
                      >
                        <IconContainer className={formik.values.duration?.value === option.value ? 'selected' : ''}>
                          <Iconify
                            icon={option.icon}
                            width={20}
                            height={20}
                            sx={{ color: formik.values.duration?.value === option.value ? 'white' : theme.palette.primary.main }}
                          />
                        </IconContainer>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {option.label}
                        </Typography>
                      </DurationCard>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Location */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Localisation
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Conseil :</strong> Tapez votre adresse complète et la wilaya sera automatiquement détectée.
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12} md={8}>
                <StyledTextField
                  inputRef={inputRef}
                  fullWidth
                  name="location"
                  label="Adresse de livraison/intervention"
                  value={formik.values.location}
                  onChange={(e) => {
                    const newLocation = e.target.value;
                    formik.setFieldValue('location', newLocation);

                    if (detectedWilaya && newLocation !== formik.values.location) {
                      setDetectedWilaya('');
                      setWilayaAutoDetected(false);
                      formik.setFieldValue('wilaya', '');
                    }
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                  placeholder="Ex: 123 Rue de la Liberté, Alger, Algérie"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  select
                  name="wilaya"
                  label="Wilaya"
                  key={forceUpdate}
                  value={detectedWilaya || formik.values.wilaya || ''}
                  onChange={(e) => {
                    if (!detectedWilaya) {
                      const selectedValue = e.target.value;
                      formik.setFieldValue('wilaya', selectedValue);
                      setDetectedWilaya(selectedValue);
                    }
                  }}
                  onBlur={formik.handleBlur}
                  InputProps={{
                    readOnly: !!detectedWilaya,
                  }}
                  error={formik.touched.wilaya && Boolean(formik.errors.wilaya)}
                  helperText={
                    detectedWilaya
                      ? 'Wilaya détectée'
                      : formik.touched.wilaya && formik.errors.wilaya || 'Sélectionnez manuellement si non détectée'
                  }
                >
                  <MenuItem value="">
                    <em>
                      {detectedWilaya
                        ? 'Wilaya détectée'
                        : 'Sélectionnez une wilaya'
                      }
                    </em>
                  </MenuItem>
                  {WILAYAS.map((wilaya) => (
                    <MenuItem key={wilaya.code} value={wilaya.name}>
                      {wilaya.name}
                    </MenuItem>
                  ))}
                </StyledTextField>
              </Grid>

              {formik.values.location && formik.values.wilaya && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Localisation sélectionnée :</strong> {formik.values.location}, {formik.values.wilaya}
                    </Typography>
                  </Alert>
                </Grid>
              )}

              {/* Professional Settings */}
              {auth.user?.type === ACCOUNT_TYPE.PROFESSIONAL && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Paramètres professionnels
                  </Typography>

                  <FormControl component="fieldset">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.isPro}
                          onChange={(e) => formik.setFieldValue('isPro', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Appel d'offres professionnel
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Visible uniquement par les professionnels
                          </Typography>
                        </Box>
                      }
                    />
                  </FormControl>
                </Grid>
              )}

              {/* Attachments */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Pièces jointes
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Téléchargez le cahier des charges, plans, spécifications techniques...
                </Alert>

                <UploadMultiFile
                  showPreview
                  files={attachments}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  accept={{
                    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                  }}
                />
              </Grid>
            </Grid>
          </StepCard>
        );

      default:
        return null;
    }
  };

  return (
    <Page title="Créer un appel d'offres">
      <MainContainer>
        {/* Header */}
        <HeaderCard>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Créer un nouvel appel d'offres
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Trouvez les meilleurs prestataires au meilleur prix
            </Typography>
          </Box>
        </HeaderCard>

        {/* Progress */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Étape {activeStep + 1} sur {steps.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(((activeStep + 1) / steps.length) * 100)}% terminé
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((activeStep + 1) / steps.length) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.title}>
                <StepLabel>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content */}
        <FormikProvider value={formik}>
          <Form>
            {getStepContent(activeStep)}

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Précédent
              </Button>

              {activeStep === steps.length - 1 ? (
                <LoadingButton
                  type="button"
                  variant="contained"
                  loading={isSubmitting}
                  onClick={async () => {
                    console.log('🔘 Créer l\'appel d\'offres button clicked');
                    // Use our custom handleSubmit instead of Formik's
                    await handleSubmit(formik.values);
                  }}
                  endIcon={<Iconify icon="eva:checkmark-fill" />}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Créer l'appel d'offres
                </LoadingButton>
              ) : (
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Suivant
                </Button>
              )}
            </Box>
          </Form>
        </FormikProvider>
      </MainContainer>
    </Page>
  );
}
