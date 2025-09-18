import { styled } from '@mui/material/styles';
import { Box, IconButton, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Iconify from '@/components/Iconify';
import { fData } from '@/utils/formatNumber';

// ----------------------------------------------------------------------

const ListItemStyle = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  border: `solid 1px ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
}));

// More compact list item style
const CompactListItemStyle = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  border: `solid 1px ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  '& .MuiListItemText-root': {
    margin: 0,
  },
  '& .MuiListItemText-primary': {
    fontSize: '0.75rem',
  },
  '& .MuiListItemText-secondary': {
    fontSize: '0.7rem',
  },
}));

// ----------------------------------------------------------------------

interface MultiFilePreviewProps {
  file: File;
  onRemove: () => void;
  compact?: boolean;
}

export default function MultiFilePreview({ file, onRemove, compact = false }: MultiFilePreviewProps) {
  const { name, size, type } = file;
  const isImage = type.startsWith('image/');
  
  const ItemComponent = compact ? CompactListItemStyle : ListItemStyle;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <ItemComponent>
        {isImage ? (
          <Box
            component="img"
            alt={name}
            src={URL.createObjectURL(file)}
            sx={{
              width: compact ? 32 : 48,
              height: compact ? 32 : 48,
              objectFit: 'cover',
              borderRadius: 1,
              mr: compact ? 1 : 2,
            }}
          />
        ) : (
          <Box 
            sx={{ 
              width: compact ? 32 : 48, 
              height: compact ? 32 : 48, 
              mr: compact ? 1 : 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Iconify icon="eva:file-fill" width={compact ? 24 : 36} height={compact ? 24 : 36} />
          </Box>
        )}

        <ListItemText
          primary={name}
          secondary={
            <Typography 
              variant="caption" 
              component="div" 
              sx={{ 
                color: 'text.secondary',
                fontSize: compact ? '0.65rem' : 'inherit'
              }}
            >
              {fData(size)}
            </Typography>
          }
        />

        <IconButton edge="end" size="small" onClick={onRemove} sx={{ padding: compact ? 0.5 : 'auto' }}>
          <Iconify icon="eva:close-fill" width={compact ? 16 : 24} height={compact ? 16 : 24} />
        </IconButton>
      </ItemComponent>
    </motion.div>
  );
}
