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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { AuctionsAPI } from '@/api/auctions';
import { CategoryAPI } from '@/api/category';
import { SubCategoryAPI } from '@/api/subcategory';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { alpha } from '@mui/material/styles';
import { ACCOUNT_TYPE } from '@/types/User';
import { loadGoogleMapsScript } from '@/utils/loadGoogleMapsScript';

// Modern styled components
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
  },
  '&.error': {
    borderColor: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.05),
  }
}));

const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 10,
      left: "calc(-50% + 16px)",
      right: "calc(50% + 16px)",
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        borderWidth: 0,
        height: 4,
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderWidth: 0,
        height: 4,
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : alpha(theme.palette.grey[300], 0.6),
      borderTopWidth: 2,
      borderRadius: 2,
      height: 2,
      background: alpha(theme.palette.grey[300], 0.3),
    },
  }))

const QontoStepIconRoot = styled("div")<{ ownerState: { active?: boolean; completed?: boolean } }>(
    ({ theme, ownerState }) => ({
      color: theme.palette.mode === "dark" ? theme.palette.grey[700] : alpha(theme.palette.grey[400], 0.8),
      display: "flex",
      height: 32,
      width: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      backgroundColor: theme.palette.background.paper,
      border: `3px solid ${alpha(theme.palette.grey[300], 0.5)}`,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.1)",
      ...(ownerState.active && {
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderColor: theme.palette.primary.main,
        color: "#fff",
        transform: "scale(1.1)",
        boxShadow: `0 4px 16px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
      }),
      ...(ownerState.completed && {
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderColor: theme.palette.primary.main,
        color: "#fff",
        boxShadow: `0 2px 12px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
      }),
      "& .QontoStepIcon-completedIcon": {
        color: "#fff",
        zIndex: 1,
        fontSize: 18,
        fontWeight: "bold",
      },
      "& .QontoStepIcon-circle": {
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: "currentColor",
      },
    }),
  )

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props

  return (
    <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? (
        <Iconify icon="eva:checkmark-fill" className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  )
}

const BidTypeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: 24,
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px 0 rgba(0,0,0,0.06), 0 2px 16px 0 rgba(0,0,0,0.03)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  border: `2px solid transparent`,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, transparent 100%)`,
    transition: "all 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 16px 48px 0 rgba(0,0,0,0.1), 0 8px 24px 0 rgba(0,0,0,0.06)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
    "&::before": {
      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.primary.main} 100%)`,
    },
  },
  "&.selected": {
    borderColor: theme.palette.primary.main,
    background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.12)} 100%)`,
    boxShadow: `0 12px 40px 0 ${alpha(theme.palette.primary.main, 0.2)}, 0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
    "&::before": {
      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: 16,
      right: 16,
      width: 24,
      height: 24,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 2px 8px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
    },
  },
  "&.error": {
    borderColor: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.05),
  },
}))

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
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.3)} 50%, transparent 100%)`,
    transition: "all 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 16px 48px 0 rgba(0,0,0,0.1), 0 8px 24px 0 rgba(0,0,0,0.06)",
    borderColor: alpha(theme.palette.primary.main, 0.4),
    "&::before": {
      background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
    },

  },
  "&.selected": {
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
  "&.error": {
    borderColor: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.05),
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
  },
  '&.error': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
  }
}));

const CategoryGrid = styled(Grid)(({ theme }) => ({
  '& .MuiGrid-item': {
    marginBottom: theme.spacing(2),
  }
}));

const CategoryIcon = styled(Box)(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(3),
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 4px 16px 0 rgba(0,0,0,0.08)",
  "&.selected": {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    transform: "scale(1.15)",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  "&.error": {
    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.light, 0.15)} 100%)`,
    borderColor: alpha(theme.palette.error.main, 0.3),
  },
}))

const CategoryContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  justifyContent: "center",
}))

const SubCategoryCard = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2.5),
  transition: "all 0.3s ease",
  cursor: "pointer",
  border: `2px solid transparent`,
  backgroundColor: theme.palette.background.paper,
  position: "relative",
  "&:hover": {
    boxShadow: "0 8px 20px 0 rgba(0,0,0,0.06)",
    transform: "translateY(-3px)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  "&.selected": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.light, 0.08),
    boxShadow: `0 6px 16px 0 ${alpha(theme.palette.primary.main, 0.15)}`,
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      backgroundColor: theme.palette.primary.main,
    },
  },
  "&.error": {
    borderColor: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.05),
  },
}))

const SubCategoryContent = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
}))

const SubCategoryIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.grey[300], 0.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
  "&.selected": {
    backgroundColor: theme.palette.primary.main,
  },
  "&.error": {
    backgroundColor: alpha(theme.palette.error.main, 0.3),
  },
}))

const AttributesGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}))

const AttributeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: `2px solid transparent`,
  backgroundColor: alpha(theme.palette.grey[50], 0.8),
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px 0 rgba(0,0,0,0.1)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  "&.selected": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    boxShadow: `0 6px 16px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      backgroundColor: theme.palette.primary.dark,
    },
  },
  "&.error": {
    borderColor: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.05),
  },
}))

const AttributeIcon = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.grey[300], 0.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  marginBottom: theme.spacing(1),
  transition: "all 0.3s ease",
  "&.selected": {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  "&.error": {
    backgroundColor: alpha(theme.palette.error.main, 0.3),
  },
}))

const AttributesContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 16,
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  marginTop: theme.spacing(2),
}))

const SelectedAttributesChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: 20,
  fontSize: "0.75rem",
  height: 28,
  fontWeight: 500,
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  "& .MuiChip-deleteIcon": {
    color: "rgba(255,255,255,0.8)",
    "&:hover": {
      color: "#fff",
    },
  },
}))

const AttributesModal = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: theme.spacing(2),
}))

const AttributesDialog = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  maxWidth: 600,
  width: "100%",
  maxHeight: "80vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px 0 rgba(0,0,0,0.3)",
}))

const AttributesHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}))

const AttributesContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flex: 1,
  overflowY: "auto",
  backgroundColor: alpha(theme.palette.grey[50], 0.3),
}))

const AttributesFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}))

const AttributeToggle = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  borderRadius: 12,
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: `2px solid transparent`,
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(1),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  "&.selected": {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  "&.error": {
    borderColor: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.05),
  },
}))

const AttributeCheckbox = styled(Box)(({ theme }) => ({
  width: 20,
  height: 20,
  borderRadius: 4,
  border: `2px solid ${theme.palette.grey[300]}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing(2),
  transition: "all 0.3s ease",
  "&.selected": {
    backgroundColor: "#fff",
    borderColor: theme.palette.primary.main,
  },
  "&.error": {
    borderColor: theme.palette.error.main,
  },
}))

const SelectedAttributesList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}))

const SelectedAttributeTag = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 1.5),
  borderRadius: 20,
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}))

const AuctionTypeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  border: "2px solid transparent",
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 6px 24px 0 rgba(0,0,0,0.06), 0 2px 12px 0 rgba(0,0,0,0.04)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, transparent 100%)`,
    transition: "all 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 16px 48px 0 rgba(0,0,0,0.1), 0 8px 24px 0 rgba(0,0,0,0.06)",
    borderColor: alpha(theme.palette.primary.main, 0.4),
    "&::before": {
      background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
    },
  },
  "&.selected": {
    borderColor: theme.palette.primary.main,
    background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
    boxShadow: `0 12px 40px 0 ${alpha(theme.palette.primary.main, 0.2)}, 0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
    "&::before": {
      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      height: "3px",
    },
  },
  "&.error": {
    borderColor: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.05),
  },
}))

const AuctionTypeIcon = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 4px 16px 0 rgba(0,0,0,0.08)",
  "&.selected": {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    transform: "scale(1.1)",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  "&.error": {
    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.light, 0.15)} 100%)`,
    borderColor: alpha(theme.palette.error.main, 0.3),
  },
}))

const AuctionTypeContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  height: "100%",
}))

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
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, transparent 100%)`,
    transition: "all 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px 0 rgba(0,0,0,0.08), 0 4px 16px 0 rgba(0,0,0,0.05)",

    borderColor: alpha(theme.palette.primary.main, 0.3),
    "&::before": {
      background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
    },
  },
  "&.selected": {
    borderColor: theme.palette.primary.main,

    backgroundColor: alpha(theme.palette.primary.light, 0.05),
    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  "&.error": {
    borderColor: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.05),
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
}))

const DurationIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  marginBottom: theme.spacing(2),
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 2px 12px 0 rgba(0,0,0,0.06)",
  "&.selected": {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    transform: "scale(1.08)",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 4px 16px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  "&.error": {
    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.light, 0.15)} 100%)`,
    borderColor: alpha(theme.palette.error.main, 0.3),
  },
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  fontSize: "1.25rem",
  letterSpacing: "-0.02em",
  position: "relative",
  "&::after": {
    content: '""',
    flex: 1,
    height: "1px",
    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 100%)`,
    marginLeft: theme.spacing(2),
  },
}))

const StepTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(4),
  textAlign: "center",
  fontSize: "2rem",
  letterSpacing: "-0.03em",
  background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.8)} 100%)`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -8,
    left: "50%",
    transform: "translateX(-50%)",
    width: 60,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    borderRadius: 2,
  },
}))

const StepDescriptionTypo = styled(Typography)(({ theme }) => ({
  color: alpha(theme.palette.text.secondary, 0.8),
  textAlign: "center",
  fontSize: "1.1rem",
  lineHeight: 1.6,
  maxWidth: 600,
  margin: "0 auto",
  marginBottom: theme.spacing(5),
}));

const StatusCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  height: "100%",
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  boxShadow: "0 6px 24px 0 rgba(0,0,0,0.06), 0 2px 12px 0 rgba(0,0,0,0.04)",
  border: "2px solid transparent",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, transparent 100%)`,
    transition: "all 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 16px 48px 0 rgba(0,0,0,0.1), 0 8px 24px 0 rgba(0,0,0,0.06)",

    borderColor: alpha(theme.palette.primary.main, 0.3),
    "&::before": {
      background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
    },
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
  }
}));

const StatusIconContainerStyled = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 4px 16px 0 rgba(0,0,0,0.08)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
}))

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: theme.spacing(6),
  paddingTop: theme.spacing(4),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  gap: theme.spacing(2),
}))

const StepSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}))

const SelectionIndicator = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  width: 20,
  height: 20,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: "0.75rem",
  fontWeight: 600,
}))

const ExpandIcon = styled(Box)<{ expanded?: boolean }>(({ theme, expanded }) => ({
  marginLeft: "auto",
  transition: "transform 0.3s ease",
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
}))


const BID_TYPES = {
  PRODUCT: "PRODUCT",
  SERVICE: "SERVICE",
}

const AUCTION_TYPES = {
  CLASSIC: "CLASSIC",
  EXPRESS: "EXPRESS",
}

// Google Maps API types
declare global {
  interface Window {
    google: any;
  }
}

export default function CreateAuction() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { auth, isLogged } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]); // Combined images and videos
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wilayaAutoDetected, setWilayaAutoDetected] = useState(false);
  const [detectedWilaya, setDetectedWilaya] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render
  const [showWarningModal, setShowWarningModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { title: 'Type d\'enchère', description: 'Choisissez le type d\'enchère' },
    { title: 'Catégorie', description: 'Sélectionnez la catégorie' },
    { title: 'Détails', description: 'Remplissez les informations' }
  ];

  // Enhanced validation schema
  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .min(3, 'Le titre doit contenir au moins 3 caractères')
      .max(100, 'Le titre est trop long')
      .required('Le titre est requis'),
    description: Yup.string()
      .min(10, 'La description doit contenir au moins 10 caractères')
      .required('La description est requise'),
    bidType: Yup.string()
      .oneOf(Object.values(BID_TYPES), 'Type d\'enchère invalide')
      .required('Le type d\'enchère est requis'),
    auctionType: Yup.string()
      .oneOf(Object.values(AUCTION_TYPES), 'Type d\'enchère invalide')
      .required('Le type d\'enchère est requis'),
    productCategory: Yup.string()
      .required('La catégorie est requise'),
    startingPrice: Yup.number()
      .min(1, 'Le prix de départ doit être positif')
      .required('Le prix de départ est requis'),
    reservePrice: Yup.number()
      .min(1, 'Le prix de réserve doit être positif')
      .required('Le prix de réserve est requis')
      .test(
        'is-greater-than-starting',
        'Le prix de réserve doit être supérieur au prix de départ',
        function(value) {
          const { startingPrice } = this.parent;
          if (!value || !startingPrice) return true; // Let required validation handle empty values
          const startingPriceNum = typeof startingPrice === 'string' ? parseFloat(startingPrice) : Number(startingPrice);
          const reservePriceNum = Number(value);
          return reservePriceNum > startingPriceNum;
        }
      ),
    duration: Yup.object()
      .nullable()
      .required('La durée est requise'),
    wilaya: Yup.string()
      .required('La wilaya est requise'),
    place: Yup.string()
      .required('L\'emplacement est requis'),
    hidden: Yup.boolean(),
    quantity: Yup.string().when('bidType', ([bidType], schema) => {
      return bidType === BID_TYPES.PRODUCT
        ? schema.required('La quantité est requise pour les produits')
        : schema.notRequired();
    }),
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      bidType: '',
      auctionType: '',
      productCategory: '',
      productSubCategory: '',
      startingPrice: '',
      duration: null,
      attributes: [],
      place: '',
      wilaya: '',
      quantity: '',
      isPro: false,
      hidden: false,
      reservePrice: '',
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      console.log('📋 Formik onSubmit called');
      await handleSubmit(values);
    },
  });

  // Revalidate reservePrice when startingPrice changes
  useEffect(() => {
    if (formik.values.startingPrice && formik.values.reservePrice && formik.touched.reservePrice) {
      formik.validateField('reservePrice');
    }
  }, [formik.values.startingPrice]);

  // Helper function to get formatted selection text for each step
  const getStepSelectionText = (stepIndex: number): string | null => {
    if (stepIndex === steps.length - 1) return null; // Skip last step (details)
    
    switch (stepIndex) {
      case 0: {
        // Step 0: Show bidType and auctionType
        const bidTypeLabel = formik.values.bidType === BID_TYPES.PRODUCT ? 'Produit' : 
                           formik.values.bidType === BID_TYPES.SERVICE ? 'Service' : null;
        const auctionTypeLabel = formik.values.auctionType === AUCTION_TYPES.CLASSIC ? 'Classique' :
                                formik.values.auctionType === AUCTION_TYPES.EXPRESS ? 'Express' : null;
        
        if (bidTypeLabel && auctionTypeLabel) {
          return `${bidTypeLabel} - ${auctionTypeLabel}`;
        }
        return null;
      }
      case 1: {
        // Step 1: Show category name
        if (selectedCategory && selectedCategory.name) {
          return selectedCategory.name;
        }
        return null;
      }
      default:
        return null;
    }
  };

  // Helper function to scroll to first error field
  const scrollToField = (fieldName: string) => {
    console.log(`🎯 scrollToField called with: ${fieldName}`);
    
    setTimeout(() => {
      let element: Element | null = null;
      
      // Special handling for duration (which is not a standard input field)
      if (fieldName === 'duration') {
        element = document.getElementById('duration-section');
        console.log('Looking for duration section by ID:', element ? 'FOUND' : 'NOT FOUND');
      } else {
        element = document.querySelector(`[name="${fieldName}"]`);
        console.log(`Looking for field [name="${fieldName}"]:`, element ? 'FOUND' : 'NOT FOUND');
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
        } else if (fieldName === 'duration' && element instanceof HTMLElement) {
          // For duration section, highlight the entire section briefly
          setTimeout(() => {
            console.log('Highlighting duration section');
            element.style.transition = 'all 0.5s ease';
            element.style.backgroundColor = 'rgba(255, 0, 0, 0.08)';
            element.style.borderRadius = '12px';
            element.style.padding = '16px';
            setTimeout(() => {
              element.style.backgroundColor = '';
              element.style.padding = '';
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
      case 0: // Bid Type & Auction Type
        if (!values.bidType) {
          enqueueSnackbar('Veuillez sélectionner un type d\'enchère', { variant: 'error' });
          // Scroll to top of the page to show bid type selection
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
        if (!values.auctionType) {
          enqueueSnackbar('Veuillez sélectionner un type d\'enchère', { variant: 'error' });
          // Scroll to auction type section
          window.scrollTo({ top: 400, behavior: 'smooth' });
          return false;
        }
        return true;

      case 1: // Category
        if (!values.productCategory) {
          enqueueSnackbar('Veuillez sélectionner une catégorie', { variant: 'error' });
          // Scroll to top to show categories
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
        return true;

      case 2: // Details
        console.log('📝 Validating Step 2 (Details)...');
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
        if (values.bidType === BID_TYPES.PRODUCT && !values.quantity) {
          errors.push('La quantité est requise pour les produits');
          if (!firstErrorField) {
            firstErrorField = 'quantity';
            console.log('❌ First error: quantity');
          }
        }
        if (!values.startingPrice || parseFloat(values.startingPrice) < 1) {
          errors.push('Le prix de départ doit être positif');
          if (!firstErrorField) {
            firstErrorField = 'startingPrice';
            console.log('❌ First error: startingPrice');
          }
        }
        if (!values.duration) {
          errors.push('La durée est requise');
          if (!firstErrorField) {
            firstErrorField = 'duration';
            console.log('❌ First error: duration');
          }
        }
        if (!values.place) {
          errors.push('L\'emplacement est requis');
          if (!firstErrorField) {
            firstErrorField = 'place';
            console.log('❌ First error: place');
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
          console.log(`❌ Step 2 validation failed with ${errors.length} errors`);
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
        console.log('✅ Step 2 validation passed');
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
        touchedFields.bidType = true;
        touchedFields.auctionType = true;
        break;
      case 1:
        touchedFields.productCategory = true;
        break;
      case 2:
        touchedFields.title = true;
        touchedFields.description = true;
        touchedFields.startingPrice = true;
        touchedFields.duration = true;
        touchedFields.place = true;
        touchedFields.wilaya = true;
        if (formik.values.bidType === BID_TYPES.PRODUCT) {
          touchedFields.quantity = true;
        }
        break;
    }
    
    formik.setTouched(touchedFields);
  };

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

  // Auto-advance functionality: Move to next step when options are selected
  useEffect(() => {
    // Step 0: Auto-advance when both bidType and auctionType are selected
    if (activeStep === 0 && formik.values.bidType && formik.values.auctionType) {
      const isValid = validateStep(0, formik.values);
      if (isValid) {
        // Small delay to ensure UI updates smoothly
        setTimeout(() => {
          setActiveStep(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      }
    }
    
    // Step 1: Auto-advance when category is selected
    if (activeStep === 1 && formik.values.productCategory) {
      const isValid = validateStep(1, formik.values);
      if (isValid) {
        setTimeout(() => {
          setActiveStep(2);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      }
    }
  }, [activeStep, formik.values.bidType, formik.values.auctionType, formik.values.productCategory]);

  const handleBack = () => {
    const previousStep = activeStep - 1;
    
    // Clear selections when going back to prevent auto-advance
    if (previousStep === 0) {
      // Going back to step 0: clear bidType and auctionType
      formik.setFieldValue('bidType', '');
      formik.setFieldValue('auctionType', '');
    } else if (previousStep === 1) {
      // Going back to step 1: clear category
      formik.setFieldValue('productCategory', '');
      formik.setFieldValue('productSubCategory', '');
      setSelectedCategory(null);
      setSelectedCategoryPath([]);
    }
    
    setActiveStep(previousStep);
    // Scroll to top when going back
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const findCategoryInTree = (categories: any[], categoryId: string): any | null => {
    for (const category of categories) {
      if (category._id === categoryId) {
        return category;
      }
      if (hasChildren(category)) {
        const found = findCategoryInTree(category.children, categoryId);
        if (found) return found;
      }
    }
    return null;
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

  // Load categories and handle auth check
  useEffect(() => {
    if (!isLogged) {
      enqueueSnackbar('Veuillez vous connecter pour créer une enchère', { variant: 'error' });
      navigate('/login');
      return;
    }

    const loadData = async () => {
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


  // List of Algerian wilayas (states)
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

  // Google Maps integration
  useEffect(() => {
    if (!inputRef.current) return;

    const initializeAutocomplete = async () => {
      try {
        await loadGoogleMapsScript();
        
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          throw new Error('Google Maps Places library not available');
        }

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current!, {
          types: ['geocode'],
          componentRestrictions: { country: 'dz' },
          fields: ['formatted_address', 'address_components', 'name']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const placeValue = place.formatted_address || place.name;
          formik.setFieldValue('place', placeValue);

          console.log('=== GOOGLE MAPS PLACE SELECTED ===');
          console.log('Place:', place);
          console.log('Address components:', place.address_components);

          // Simplified wilaya detection
          const detectedWilaya = detectWilayaFromPlace(place);
          
          if (detectedWilaya) {
            formik.setFieldValue('wilaya', detectedWilaya);
            setWilayaAutoDetected(true);
            setDetectedWilaya(detectedWilaya);
            setForceUpdate(prev => prev + 1);
            enqueueSnackbar(`Wilaya détectée: ${detectedWilaya}`, { variant: 'success' });
          } else {
            setWilayaAutoDetected(false);
            setDetectedWilaya('');
            enqueueSnackbar('Wilaya non détectée. Veuillez sélectionner manuellement.', { variant: 'warning' });
          }
        });

      } catch (error: any) {
        console.error('Failed to initialize Google Maps autocomplete:', error);
        enqueueSnackbar(
          error.message.includes('API key') 
            ? 'Google Maps API key not configured. Please contact support.'
            : 'Erreur lors du chargement de Google Maps. Veuillez réessayer.',
          { variant: 'error' }
        );
      }
    };

    initializeAutocomplete();
  }, [formik, enqueueSnackbar]);

  // Helper function to detect wilaya from place
  const detectWilayaFromPlace = (place: any): string | null => {
    if (!place.address_components) return null;

    // Method 1: Look for administrative_area_level_1 (most reliable for states)
    const wilayaComponent = place.address_components.find((component: any) =>
      component.types.includes('administrative_area_level_1')
    );

    if (wilayaComponent) {
      const wilayaName = wilayaComponent.long_name;
      const cleanName = wilayaName.replace(/wilaya\s+d['']/i, '').trim();
      
      // Find exact match in WILAYAS array
      const exactMatch = WILAYAS.find(wilaya =>
        wilaya.name.toLowerCase() === cleanName.toLowerCase() ||
        cleanName.toLowerCase().includes(wilaya.name.toLowerCase()) ||
        wilaya.name.toLowerCase().includes(cleanName.toLowerCase())
      );

      if (exactMatch) {
        console.log('Wilaya detected via administrative_area_level_1:', exactMatch.name);
        return exactMatch.name;
      }
    }

    // Method 2: Look for locality (city level)
    const localityComponent = place.address_components.find((component: any) =>
      component.types.includes('locality')
    );

    if (localityComponent) {
      const matchingWilaya = WILAYAS.find(wilaya =>
        localityComponent.long_name.toLowerCase().includes(wilaya.name.toLowerCase()) ||
        wilaya.name.toLowerCase().includes(localityComponent.long_name.toLowerCase())
      );

      if (matchingWilaya) {
        console.log('Wilaya detected via locality:', matchingWilaya.name);
        return matchingWilaya.name;
      }
    }

    // Method 3: Parse from formatted address
    if (place.formatted_address) {
      const addressParts = place.formatted_address.split(',');
      
      for (const part of addressParts) {
        const trimmedPart = part.trim();
        const matchingWilaya = WILAYAS.find(wilaya =>
          trimmedPart.toLowerCase().includes(wilaya.name.toLowerCase()) ||
          wilaya.name.toLowerCase().includes(trimmedPart.toLowerCase())
        );

        if (matchingWilaya) {
          console.log('Wilaya detected via formatted address:', matchingWilaya.name);
          return matchingWilaya.name;
        }
      }
    }

    return null;
  };

  // Debug useEffect to track detectedWilaya changes
  useEffect(() => {
    console.log('detectedWilaya state changed to:', detectedWilaya);
  }, [detectedWilaya]);

  const handleSubmit = async (values: any) => {
    console.log('=== SUBMIT BUTTON CLICKED ===');
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
          const stepNames = ['le type d\'enchère', 'la catégorie', 'les détails'];
          enqueueSnackbar(`Veuillez compléter ${stepNames[step]}`, { variant: 'warning' });
        }
        
        // If error is on step 0 or 1, scroll to top to show step selector
        // If error is on step 2 (current step), validateStep already handled scrolling to the field
        if (step !== 2) {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        }
        return;
      }
      console.log(`✅ Step ${step} validated successfully`);
    }

    // Additional validation for files
    if (mediaFiles.length === 0) {
      enqueueSnackbar('Veuillez télécharger au moins une image ou une vidéo', { variant: 'error' });
      setActiveStep(2); // Go to details step where files are uploaded
      // Scroll to media section
      setTimeout(() => {
        const mediaSection = document.querySelector('h5')?.parentElement?.parentElement;
        if (mediaSection) {
          mediaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
      return;
    }

    if (auth.user?.rate < 3) {
      enqueueSnackbar('Votre note est trop faible pour créer une enchère', { variant: 'error' });
      return;
    }

    // Show warning modal instead of directly submitting
    setShowWarningModal(true);
  };

  // Actual submission after user confirms the warning
  const handleConfirmSubmit = async () => {
    setShowWarningModal(false);
    setIsSubmitting(true);

    const values = formik.values;

    try {
      const now = new Date();
      let endingDate: Date;

      if (values.auctionType === AUCTION_TYPES.CLASSIC) {
        endingDate = new Date(now.getTime() + (values.duration.value * 24 * 60 * 60 * 1000));
      } else {
        endingDate = new Date(now.getTime() + (values.duration.value * 60 * 60 * 1000));
      }

      const dataPayload = {
        owner: auth.user._id,
        title: values.title,
        description: values.description,
        bidType: values.bidType,
        auctionType: values.auctionType,
        productCategory: values.productCategory,
        productSubCategory: values.productSubCategory || undefined,
        startingPrice: parseFloat(values.startingPrice),
        currentPrice: parseFloat(values.startingPrice),
        startingAt: now.toISOString(),
        endingAt: endingDate.toISOString(),
        attributes: values.attributes || [],
        place: values.place,
        wilaya: values.wilaya,
        isPro: values.isPro,
        hidden: values.hidden,
        quantity: values.quantity || '',
        reservePrice: parseFloat(values.reservePrice), // Required field
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(dataPayload));

      // Separate images and videos from combined mediaFiles
      mediaFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          formData.append('thumbs[]', file);
        } else if (file.type.startsWith('video/')) {
          formData.append('videos[]', file);
        }
      });

      await AuctionsAPI.create(formData);

      enqueueSnackbar('Enchère créée avec succès!', { variant: 'success' });
      console.log('Navigating back to previous page...');
      
      // Add a small delay to ensure the success message is shown
      setTimeout(() => {
        console.log('Attempting to go back to previous page');
        navigate(-1);
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création de l\'enchère';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setMediaFiles(prev => [...prev, ...acceptedFiles]);
  };

  const handleRemoveFile = (file: File) => {
    setMediaFiles(mediaFiles.filter(f => f !== file));
  };

  const handleRemoveAllFiles = () => {
    setMediaFiles([]);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
              Choisissez le type d'enchère
            </Typography>

            {/* Bid Type Validation Error */}
            {formik.touched.bidType && formik.errors.bidType && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {formik.errors.bidType}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SelectionCard
                  className={
                    formik.values.bidType === BID_TYPES.PRODUCT ? 'selected' : 
                    formik.touched.bidType && formik.errors.bidType ? 'error' : ''
                  }
                  onClick={() => formik.setFieldValue('bidType', BID_TYPES.PRODUCT)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <IconContainer className={
                      formik.values.bidType === BID_TYPES.PRODUCT ? 'selected' : 
                      formik.touched.bidType && formik.errors.bidType ? 'error' : ''
                    }>
                      <Iconify
                        icon="mdi:package-variant"
                        width={32}
                        height={32}
                        sx={{ 
                          color: formik.values.bidType === BID_TYPES.PRODUCT ? 'white' : 
                                formik.touched.bidType && formik.errors.bidType ? theme.palette.error.main : 
                                theme.palette.primary.main 
                        }}
                      />
                    </IconContainer>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Produit
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vendez des objets physiques, matériels ou numériques
                    </Typography>
                  </Box>
                </SelectionCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <SelectionCard
                  className={
                    formik.values.bidType === BID_TYPES.SERVICE ? 'selected' : 
                    formik.touched.bidType && formik.errors.bidType ? 'error' : ''
                  }
                  onClick={() => formik.setFieldValue('bidType', BID_TYPES.SERVICE)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <IconContainer className={
                      formik.values.bidType === BID_TYPES.SERVICE ? 'selected' : 
                      formik.touched.bidType && formik.errors.bidType ? 'error' : ''
                    }>
                      <Iconify
                        icon="mdi:handshake"
                        width={32}
                        height={32}
                        sx={{ 
                          color: formik.values.bidType === BID_TYPES.SERVICE ? 'white' : 
                                formik.touched.bidType && formik.errors.bidType ? theme.palette.error.main : 
                                theme.palette.primary.main 
                        }}
                      />
                    </IconContainer>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Service
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Proposez vos compétences et services professionnels
                    </Typography>
                  </Box>
                </SelectionCard>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Type d'enchère
              </Typography>

              {/* Auction Type Validation Error */}
              {formik.touched.auctionType && formik.errors.auctionType && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {formik.errors.auctionType}
                </Alert>
              )}

              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={6}>
                  <SelectionCard
                    className={
                      formik.values.auctionType === AUCTION_TYPES.CLASSIC ? 'selected' : 
                      formik.touched.auctionType && formik.errors.auctionType ? 'error' : ''
                    }
                    onClick={() => formik.setFieldValue('auctionType', AUCTION_TYPES.CLASSIC)}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <IconContainer className={
                        formik.values.auctionType === AUCTION_TYPES.CLASSIC ? 'selected' : 
                        formik.touched.auctionType && formik.errors.auctionType ? 'error' : ''
                      }>
                        <Iconify
                          icon="mdi:clock-outline"
                          width={24}
                          height={24}
                          sx={{ 
                            color: formik.values.auctionType === AUCTION_TYPES.CLASSIC ? 'white' : 
                                  formik.touched.auctionType && formik.errors.auctionType ? theme.palette.error.main : 
                                  theme.palette.primary.main 
                          }}
                        />
                      </IconContainer>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Classique
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enchère traditionnelle sur plusieurs jours
                      </Typography>
                    </Box>
                  </SelectionCard>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <SelectionCard
                    className={
                      formik.values.auctionType === AUCTION_TYPES.EXPRESS ? 'selected' : 
                      formik.touched.auctionType && formik.errors.auctionType ? 'error' : ''
                    }
                    onClick={() => formik.setFieldValue('auctionType', AUCTION_TYPES.EXPRESS)}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <IconContainer className={
                        formik.values.auctionType === AUCTION_TYPES.EXPRESS ? 'selected' : 
                        formik.touched.auctionType && formik.errors.auctionType ? 'error' : ''
                      }>
                        <Iconify
                          icon="mdi:lightning-bolt"
                          width={24}
                          height={24}
                          sx={{ 
                            color: formik.values.auctionType === AUCTION_TYPES.EXPRESS ? 'white' : 
                                  formik.touched.auctionType && formik.errors.auctionType ? theme.palette.error.main : 
                                  theme.palette.primary.main 
                          }}
                        />
                      </IconContainer>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Express
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enchère rapide en quelques heures
                      </Typography>
                    </Box>
                  </SelectionCard>
                </Grid>
              </Grid>
            </Box>
          </StepCard>
        );

      case 1:
        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
              Sélectionnez la catégorie *
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
                      return category.type === formik.values.bidType || !category.type;
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
                    Aucune catégorie disponible pour le type sélectionné
                  </Typography>
                </Box>
              )}
            </Box>
          </StepCard>
        );

      case 2:
        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
              Détails de l'enchère
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
                  label="Titre de l'enchère *"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={
                    formik.touched.title && formik.errors.title ? 
                      <Alert severity="error" sx={{ py: 0, mt: 1, fontSize: '0.75rem' }}>
                        {formik.errors.title}
                      </Alert> : 
                      'Le titre doit contenir au moins 3 caractères'
                  }
                  placeholder="Ex: iPhone 13 Pro Max - État neuf"
                />
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description détaillée *"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={
                    formik.touched.description && formik.errors.description ? 
                      <Alert severity="error" sx={{ py: 0, mt: 1, fontSize: '0.75rem' }}>
                        {formik.errors.description}
                      </Alert> : 
                      'La description doit contenir au moins 10 caractères'
                  }
                  placeholder="Décrivez votre produit/service en détail..."
                />
              </Grid>

              {formik.values.bidType === BID_TYPES.PRODUCT && (
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Quantité *"
                    name="quantity"
                    value={formik.values.quantity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                    helperText={
                      formik.touched.quantity && formik.errors.quantity ? 
                        <Alert severity="error" sx={{ py: 0, mt: 1, fontSize: '0.75rem' }}>
                          {formik.errors.quantity}
                        </Alert> : 
                        'Ex: 1 unité, 5 pièces...'
                    }
                  />
                </Grid>
              )}

              {/* Pricing */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Prix et conditions
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Conseils de prix :</strong> Le prix de réserve protège votre vente en définissant
                    un prix minimum pour accepter l'enchère. Laissez vide si vous n'avez pas de prix minimum.
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  type="number"
                  label="Prix de départ *"
                  name="startingPrice"
                  value={formik.values.startingPrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.startingPrice && Boolean(formik.errors.startingPrice)}
                  helperText={
                    formik.touched.startingPrice && formik.errors.startingPrice ? 
                      <Alert severity="error" sx={{ py: 0, mt: 1, fontSize: '0.75rem' }}>
                        {formik.errors.startingPrice}
                      </Alert> : 
                      'Le prix de départ doit être positif'
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  type="number"
                  label="Prix de réserve *"
                  name="reservePrice"
                  value={formik.values.reservePrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ce prix doit être supérieur au prix de départ"
                  error={formik.touched.reservePrice && !!formik.errors.reservePrice}
                  helperText={
                    formik.touched.reservePrice && formik.errors.reservePrice ? 
                      <Alert severity="error" sx={{ py: 0, mt: 1, fontSize: '0.75rem' }}>
                        {formik.errors.reservePrice}
                      </Alert> : 
                      "Ce prix doit être supérieur au prix de départ"
                  }
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Duration */}
              <Grid item xs={12} id="duration-section">
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }} id="duration-heading">
                  Durée de l'enchère *
                </Typography>

                {formik.touched.duration && formik.errors.duration && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {typeof formik.errors.duration === 'string' ? formik.errors.duration : 'La durée est requise'}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  {(formik.values.auctionType === AUCTION_TYPES.CLASSIC ? TimeOptions : ExpressTimeOptions).map((option) => (
                    <Grid item xs={6} sm={4} md={2.4} key={option.value}>
                      <DurationCard
                        className={
                          formik.values.duration?.value === option.value ? 'selected' : 
                          formik.touched.duration && formik.errors.duration ? 'error' : ''
                        }
                        onClick={() => formik.setFieldValue('duration', option)}
                        sx={{
                          borderColor: formik.touched.duration && formik.errors.duration ? 
                            theme.palette.error.main : 'transparent',
                          borderWidth: formik.touched.duration && formik.errors.duration ? 2 : 0
                        }}
                      >
                        <IconContainer className={
                          formik.values.duration?.value === option.value ? 'selected' : 
                          formik.touched.duration && formik.errors.duration ? 'error' : ''
                        }>
                          <Iconify
                            icon={option.icon}
                            width={20}
                            height={20}
                            sx={{ 
                              color: formik.values.duration?.value === option.value ? 'white' : 
                                    formik.touched.duration && formik.errors.duration ? theme.palette.error.main : 
                                    theme.palette.primary.main 
                            }}
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
                    Si la détection automatique échoue, vous pouvez sélectionner manuellement.
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12} md={8}>
                <StyledTextField
                  inputRef={inputRef}
                  fullWidth
                  label="Adresse *"
                  name="place"
                  value={formik.values.place}
                  onChange={(e) => {
                    const newPlace = e.target.value;
                    formik.setFieldValue('place', newPlace);

                    // Clear detected wilaya when place changes significantly
                    if (detectedWilaya && newPlace !== formik.values.place) {
                      setDetectedWilaya('');
                      setWilayaAutoDetected(false);
                      formik.setFieldValue('wilaya', '');
                    }
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.place && Boolean(formik.errors.place)}
                  helperText={
                    formik.touched.place && formik.errors.place ? 
                      <Alert severity="error" sx={{ py: 0, mt: 1, fontSize: '0.75rem' }}>
                        {formik.errors.place}
                      </Alert> : 
                      'Commencez à taper votre adresse pour voir les suggestions'
                  }
                  placeholder="Ex: 123 Rue de la Liberté, Alger, Algérie"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  select
                  label="Wilaya *"
                  name="wilaya"
                  key={forceUpdate}
                  value={detectedWilaya || formik.values.wilaya || ''}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    formik.setFieldValue('wilaya', selectedValue);
                    
                    // If manually selected, clear auto-detection
                    if (selectedValue && !detectedWilaya) {
                      setWilayaAutoDetected(false);
                    }
                  }}
                  onBlur={formik.handleBlur}
                  InputProps={{
                    readOnly: wilayaAutoDetected && !!detectedWilaya,
                  }}
                  error={formik.touched.wilaya && Boolean(formik.errors.wilaya)}
                  helperText={
                    formik.touched.wilaya && formik.errors.wilaya ? 
                      <Alert severity="error" sx={{ py: 0, mt: 1, fontSize: '0.75rem' }}>
                        {formik.errors.wilaya}
                      </Alert> :
                    wilayaAutoDetected && detectedWilaya
                      ? `Wilaya détectée automatiquement: ${detectedWilaya}`
                      : 'Sélectionnez manuellement si non détectée'
                  }
                >
                  <MenuItem value="">
                    <em>
                      {wilayaAutoDetected && detectedWilaya
                        ? `Wilaya détectée: ${detectedWilaya}`
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

              {formik.values.place && formik.values.wilaya && (
                <Grid item xs={12}>
                  <Alert 
                    severity={wilayaAutoDetected ? "success" : "info"} 
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2">
                      <strong>Localisation sélectionnée :</strong> {formik.values.place}, {formik.values.wilaya}
                      {wilayaAutoDetected && (
                        <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', opacity: 0.8 }}>
                          (détectée automatiquement)
                        </Box>
                      )}
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
                            Enchère professionnelle
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

              {/* Name Visibility Option */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <FormControl component="fieldset">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.hidden}
                        onChange={(e) => formik.setFieldValue('hidden', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {t('auctions.nameVisibility.title', { defaultValue: 'Mode Anonyme' })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formik.values.hidden
                            ? t('auctions.nameVisibility.descriptionHidden', { defaultValue: 'Votre nom sera masqué (Mode Anonyme)' })
                            : t('auctions.nameVisibility.descriptionVisible', { defaultValue: 'Votre nom sera visible publiquement' })
                          }
                        </Typography>
                      </Box>
                    }
                  />
                </FormControl>
              </Grid>

              {/* Images & Videos */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Images et Vidéos
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Téléchargez des images et vidéos de haute qualité pour mieux présenter votre produit ou service. Formats supportés: JPEG, PNG, GIF, WebP, MP4, MOV, AVI, WebM
                </Alert>

                <UploadMultiFile
                  showPreview
                  files={mediaFiles}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  accept={{
                    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
                    'video/*': ['.mp4', '.mpeg', '.mov', '.avi', '.webm']
                  }}
                  maxSize={100 * 1024 * 1024} // 100MB
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
    <Page title="Créer une enchère">
      <MainContainer>
        {/* Header */}
        <HeaderCard>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Créer une nouvelle enchère
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Vendez vos produits et services en quelques étapes simples
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
          <ProgressBar
            variant="determinate"
            value={((activeStep + 1) / steps.length) * 100}
          />
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => {
              const selectionText = getStepSelectionText(index);
              return (
                <Step key={step.title}>
                  <StepLabel>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color={selectionText ? "primary.main" : "text.secondary"}
                      sx={{ 
                        fontWeight: selectionText ? 600 : 400,
                        fontStyle: selectionText ? 'normal' : 'italic'
                      }}
                    >
                      {selectionText || step.description}
                    </Typography>
                  </StepLabel>
                </Step>
              );
            })}
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
                    console.log('🔘 Créer l\'enchère button clicked');
                    // Use our custom handleSubmit instead of Formik's
                    await handleSubmit(formik.values);
                  }}
                  endIcon={<Iconify icon="eva:checkmark-fill" />}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Créer l'enchère
                </LoadingButton>
              ) : (
                // Hide "Suivant" button on steps 0 and 1 (auto-advance enabled)
                activeStep >= 2 && (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Suivant
                  </Button>
                )
              )}
            </Box>
          </Form>
        </FormikProvider>
      </MainContainer>

      {/* Warning Modal */}
      <Dialog
        open={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          pt: 3,
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Iconify icon="mdi:alert" width={32} height={32} sx={{ color: 'white' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Attention Important
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              ⚠️ Une fois créée, vous ne pourrez plus supprimer cette enchère
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Veuillez vous assurer que toutes les informations sont correctes avant de confirmer la création.
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
            Voulez-vous vraiment créer cette enchère ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setShowWarningModal(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#cbd5e1',
                background: '#f8fafc',
              }
            }}
          >
            Annuler
          </Button>
          <LoadingButton
            onClick={handleConfirmSubmit}
            loading={isSubmitting}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #0063b1 0%, #00a3e0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #005299 0%, #0091cc 100%)',
              }
            }}
          >
            Confirmer et Créer
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Page>
  );
}