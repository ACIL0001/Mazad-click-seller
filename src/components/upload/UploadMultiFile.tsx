import { useDropzone, Accept } from 'react-dropzone';
import { styled } from '@mui/material/styles';
import { Box, List, Stack, Button, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import Iconify from '@/components/Iconify';
import MultiFilePreview from './MultiFilePreview';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div', {
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>(({ theme, compact }) => ({
  outline: 'none',
  padding: compact ? theme.spacing(1, 0.5) : theme.spacing(2, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px dashed ${theme.palette.grey[400]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
  minHeight: compact ? 'unset' : 120,
}));

// ----------------------------------------------------------------------

interface UploadMultiFileProps {
  error?: boolean;
  files: File[];
  showPreview?: boolean;
  onRemove: (file: File) => void;
  onRemoveAll: () => void;
  onUpload?: () => void;
  onDrop: (acceptedFiles: File[]) => void;
  helperText?: React.ReactNode;
  maxSize?: number;
  accept?: string | Accept;
  compact?: boolean;
}

export function UploadMultiFile({
  error,
  showPreview = false,
  files,
  onRemove,
  onRemoveAll,
  onUpload,
  onDrop,
  helperText,
  maxSize,
  accept,
  compact = false,
  ...other
}: UploadMultiFileProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxSize,
    accept: accept as Accept,
    ...other,
   
  });
  console.log('Images === ',files);
  

  return (
    <Box sx={{ width: '100%' }}>
      <DropZoneStyle
        {...getRootProps()}
        compact={compact}
        sx={{
          ...(isDragActive && { opacity: 0.72 }),
          ...((isDragReject || error) && {
            color: 'error.main',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
          }),
        }}
      >
        <input {...getInputProps()}  />

        <Stack
          direction="column"
          spacing={compact ? 0.5 : 2}
          justifyContent="center"
          alignItems="center"
          sx={{ height: '100%' }}
        >
          <Iconify 
            icon="eva:cloud-upload-fill" 
            width={compact ? 40 : 80} 
            height={compact ? 40 : 80} 
          />
          <Box sx={{ p: compact ? 0.5 : 2, textAlign: 'center' }}>
            <Typography gutterBottom variant={compact ? 'body1' : 'h5'}>
              Déposez ou Sélectionnez des fichiers
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: compact ? '0.75rem' : 'inherit' }}>
              {compact ? 'PDF, JPEG, PNG, GIF' : 'Déposez les fichiers ici ou cliquez pour parcourir'}
              {!compact && <br />}
              {!compact && 'Formats supportés: JPEG, PNG, GIF'}
            </Typography>
          </Box>
        </Stack>
      </DropZoneStyle>

      {helperText && helperText}

      <List disablePadding sx={{ ...(showPreview && { my: compact ? 1 : 3 }) }}>
        <AnimatePresence>
          {files.map((file) => (
            <MultiFilePreview 
              key={file.name} 
              file={file} 
              onRemove={() => onRemove(file)} 
              compact={compact}
            />
          ))}
        </AnimatePresence>
      </List>

      {files.length > 0 && (
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button 
            color="inherit" 
            size={compact ? "small" : "medium"} 
            onClick={onRemoveAll}
            sx={{ fontSize: compact ? '0.75rem' : 'inherit' }}
          >
            Tout Supprimer
          </Button>
          {onUpload && (
            <Button 
              size={compact ? "small" : "medium"} 
              variant="contained" 
              onClick={onUpload}
              sx={{ fontSize: compact ? '0.75rem' : 'inherit' }}
            >
              Télécharger les fichiers
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
}
