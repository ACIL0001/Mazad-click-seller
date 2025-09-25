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
import { UploadVideoFile } from '@/components/upload/UploadVideoFile';
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
import app from '@/config';

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

// Helper function to construct proper image URLs
const getImageUrl = (attachment: any): string => {
  if (!attachment) return "";
  
  // Handle string URLs
  if (typeof attachment === "string") {
    // If it's already a full URL, return as-is
    if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
      return attachment;
    }
    // If it already starts with /static/, prepend base URL
    if (attachment.startsWith('/static/')) {
      return app.route + attachment;
    }
    // If it's just a filename, prepend /static/
    return app.route + '/static/' + attachment;
  }
  
  // Handle object with url property
  if (typeof attachment === "object" && attachment.url) {
    // If it's already a full URL, return as-is
    if (attachment.url.startsWith('http://') || attachment.url.startsWith('https://')) {
      return attachment.url;
    }
    // If it already starts with /static/, prepend base URL
    if (attachment.url.startsWith('/static/')) {
      return app.route + attachment.url;
    }
    // If it's just a filename, prepend /static/
    return app.route + '/static/' + attachment.url;
  }
  
  return "";
};

export default function CreateAuction() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { auth, isLogged } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [thumbs, setThumbs] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wilayaAutoDetected, setWilayaAutoDetected] = useState(false);
  const [detectedWilaya, setDetectedWilaya] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render
  const inputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { title: 'Type d\'enchère', description: 'Choisissez le type d\'enchère' },
    { title: 'Catégorie', description: 'Sélectionnez la catégorie' },
    { title: 'Détails', description: 'Remplissez les informations' }
  ];

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

  // Validation schema
  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .min(3, 'Le titre doit contenir au moins 3 caractères')
      .max(100, 'Le titre est trop long')
      .required('Le titre est requis'),
    description: Yup.string()
      .min(10, 'La description doit contenir au moins 10 caractères')
      .required('La description est requise'),
    bidType: Yup.string()
      .oneOf(Object.values(BID_TYPES))
      .required('Le type d\'enchère est requis'),
    auctionType: Yup.string()
      .oneOf(Object.values(AUCTION_TYPES))
      .required('Le type d\'enchère est requis'),
    productCategory: Yup.string()
      .required('La catégorie est requise'),
    startingPrice: Yup.number()
      .min(1, 'Le prix de départ doit être positif')
      .required('Le prix de départ est requis'),
    duration: Yup.object()
      .required('La durée est requise'),
    wilaya: Yup.string()
      .required('La wilaya est requise'),
    place: Yup.string()
      .required('L\'emplacement est requis'),
    hidden: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      bidType: BID_TYPES.PRODUCT,
      auctionType: AUCTION_TYPES.CLASSIC,
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
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

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

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (values: any) => {
    if (thumbs.length === 0 && videos.length === 0) {
      enqueueSnackbar('Veuillez télécharger au moins une image ou une vidéo', { variant: 'error' });
      return;
    }

    if (auth.user?.rate < 3) {
      enqueueSnackbar('Votre note est trop faible pour créer une enchère', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);

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
        reservePrice: parseFloat(values.reservePrice) || undefined,
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(dataPayload));

      thumbs.forEach((file) => {
        formData.append('thumbs[]', file);
      });

      videos.forEach((file) => {
        formData.append('videos[]', file);
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
    setThumbs(acceptedFiles);
  };

  const handleRemoveFile = (file: File) => {
    setThumbs(thumbs.filter(f => f !== file));
  };

  const handleRemoveAllFiles = () => {
    setThumbs([]);
  };

  const handleVideoDrop = (acceptedFiles: File[]) => {
    setVideos(acceptedFiles);
  };

  const handleRemoveVideo = (file: File) => {
    setVideos(videos.filter(f => f !== file));
  };

  const handleRemoveAllVideos = () => {
    setVideos([]);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
              Choisissez le type d'enchère
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SelectionCard
                  className={formik.values.bidType === BID_TYPES.PRODUCT ? 'selected' : ''}
                  onClick={() => formik.setFieldValue('bidType', BID_TYPES.PRODUCT)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <IconContainer className={formik.values.bidType === BID_TYPES.PRODUCT ? 'selected' : ''}>
                      <Iconify
                        icon="mdi:package-variant"
                        width={32}
                        height={32}
                        sx={{ color: formik.values.bidType === BID_TYPES.PRODUCT ? 'white' : theme.palette.primary.main }}
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
                  className={formik.values.bidType === BID_TYPES.SERVICE ? 'selected' : ''}
                  onClick={() => formik.setFieldValue('bidType', BID_TYPES.SERVICE)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <IconContainer className={formik.values.bidType === BID_TYPES.SERVICE ? 'selected' : ''}>
                      <Iconify
                        icon="mdi:handshake"
                        width={32}
                        height={32}
                        sx={{ color: formik.values.bidType === BID_TYPES.SERVICE ? 'white' : theme.palette.primary.main }}
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

              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={6}>
                  <SelectionCard
                    className={formik.values.auctionType === AUCTION_TYPES.CLASSIC ? 'selected' : ''}
                    onClick={() => formik.setFieldValue('auctionType', AUCTION_TYPES.CLASSIC)}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <IconContainer className={formik.values.auctionType === AUCTION_TYPES.CLASSIC ? 'selected' : ''}>
                        <Iconify
                          icon="mdi:clock-outline"
                          width={24}
                          height={24}
                          sx={{ color: formik.values.auctionType === AUCTION_TYPES.CLASSIC ? 'white' : theme.palette.primary.main }}
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
                    className={formik.values.auctionType === AUCTION_TYPES.EXPRESS ? 'selected' : ''}
                    onClick={() => formik.setFieldValue('auctionType', AUCTION_TYPES.EXPRESS)}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <IconContainer className={formik.values.auctionType === AUCTION_TYPES.EXPRESS ? 'selected' : ''}>
                        <Iconify
                          icon="mdi:lightning-bolt"
                          width={24}
                          height={24}
                          sx={{ color: formik.values.auctionType === AUCTION_TYPES.EXPRESS ? 'white' : theme.palette.primary.main }}
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
        // Recursive category hierarchy renderer
        const renderCategoryHierarchy = (categories: any[], level = 0, parentPath: any[] = []): JSX.Element[] => {
          return categories
            .filter(category => {
              // Filter by type only for root level categories
              if (level === 0) {
                // Log for debugging
                console.log('Auction Category filtering debug:', {
                  categoryName: category.name,
                  categoryType: category.type,
                  selectedBidType: formik.values.bidType,
                  match: category.type === formik.values.bidType
                });
                
                // Filter categories by bid type (PRODUCT or SERVICE)
                return category.type === formik.values.bidType;
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
                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                      ...(isSelected && {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.light, 0.05),
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
                          bgcolor: isExpanded ? theme.palette.primary.main : '#f1f5f9',
                          color: isExpanded ? 'white' : '#64748b',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: isExpanded ? theme.palette.primary.dark : theme.palette.primary.light,
                          },
                        }}
                      >
                        <Iconify icon="eva:arrow-right-fill" width={16} />
                      </IconButton>
                    )}

                    {/* Category Icon/Thumbnail */}
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
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {category.thumb && getImageUrl(category.thumb) ? (
                        <img
                          src={getImageUrl(category.thumb)}
                          alt={category.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%',
                          }}
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <Box
                        sx={{
                          display: category.thumb && getImageUrl(category.thumb) ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <Iconify
                          icon={level === 0 ? "mdi:shape" : "mdi:subdirectory-arrow-right"}
                          width={level === 0 ? 24 : 20}
                          sx={{ color: isSelected ? 'white' : theme.palette.primary.main }}
                        />
                      </Box>
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
                          bgcolor: theme.palette.primary.main,
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

        return (
          <StepCard>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 2, fontWeight: 600 }}>
              Sélectionnez la catégorie
            </Typography>
            
            {/* Type Indicator */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Chip
                label={`Type: ${formik.values.bidType === BID_TYPES.PRODUCT ? 'Produit' : 'Service'}`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>

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
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucune catégorie disponible pour le type "{formik.values.bidType === BID_TYPES.PRODUCT ? 'Produit' : 'Service'}"
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Veuillez revenir à l'étape précédente et sélectionner un autre type d'enchère.
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
                  label="Titre de l'enchère"
                  value={formik.values.title}
                  onChange={formik.handleChange('title')}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  placeholder="Ex: iPhone 13 Pro Max - État neuf"
                />
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description détaillée"
                  value={formik.values.description}
                  onChange={formik.handleChange('description')}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  placeholder="Décrivez votre produit/service en détail..."
                />
              </Grid>

              {formik.values.bidType === BID_TYPES.PRODUCT && (
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Quantité"
                    value={formik.values.quantity}
                    onChange={formik.handleChange('quantity')}
                    placeholder="Ex: 1 unité, 5 pièces..."
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
                  value={formik.values.startingPrice}
                  onChange={formik.handleChange('startingPrice')}
                  error={formik.touched.startingPrice && Boolean(formik.errors.startingPrice)}
                  helperText={formik.touched.startingPrice && formik.errors.startingPrice}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  type="number"
                  label="Prix de réserve (optionnel)"
                  value={formik.values.reservePrice}
                  onChange={formik.handleChange('reservePrice')}
                  helperText="Prix minimum pour accepter l'enchère"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Duration */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Durée de l'enchère
                </Typography>

                <Grid container spacing={2}>
                  {(formik.values.auctionType === AUCTION_TYPES.CLASSIC ? TimeOptions : ExpressTimeOptions).map((option) => (
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
                    Si la détection automatique échoue, vous pouvez sélectionner manuellement.
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12} md={8}>
                <StyledTextField
                  inputRef={inputRef}
                  fullWidth
                  label="Adresse"
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
                  error={formik.touched.place && Boolean(formik.errors.place)}
                  helperText={
                    formik.touched.place && formik.errors.place || 
                    'Commencez à taper votre adresse pour voir les suggestions'
                  }
                  placeholder="Ex: 123 Rue de la Liberté, Alger, Algérie"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  select
                  label="Wilaya"
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
                  InputProps={{
                    readOnly: wilayaAutoDetected && !!detectedWilaya,
                  }}
                  error={formik.touched.wilaya && Boolean(formik.errors.wilaya)}
                  helperText={
                    wilayaAutoDetected && detectedWilaya
                      ? `Wilaya détectée automatiquement: ${detectedWilaya}`
                      : formik.touched.wilaya && formik.errors.wilaya || 
                        'Sélectionnez manuellement si non détectée'
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
                          {t('auctions.nameVisibility.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formik.values.hidden 
                            ? t('auctions.nameVisibility.descriptionHidden')
                            : t('auctions.nameVisibility.descriptionVisible')
                          }
                        </Typography>
                      </Box>
                    }
                  />
                </FormControl>
              </Grid>

              {/* Images */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Images
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Téléchargez des images de haute qualité pour attirer plus d'enchérisseurs
                </Alert>

                <UploadMultiFile
                  showPreview
                  files={thumbs}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  accept={{
                    'image/*': ['.jpeg', '.jpg', '.png', '.gif']
                  }}
                />
              </Grid>

              {/* Videos */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Vidéos (Optionnel)
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Ajoutez des vidéos pour mieux présenter votre produit ou service
                </Alert>

                <UploadVideoFile
                  showPreview
                  files={videos}
                  onDrop={handleVideoDrop}
                  onRemove={handleRemoveVideo}
                  onRemoveAll={handleRemoveAllVideos}
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
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  endIcon={<Iconify icon="eva:checkmark-fill" />}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Créer l'enchère
                </LoadingButton>
              ) : (
                <Button
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