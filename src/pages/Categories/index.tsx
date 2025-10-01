//------------------------------------------------------------------------------
// <copyright file="categories.tsx" Author="Mohamed BOufenara">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// material
import {
  Stack,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Grid,
  Chip,
  Avatar,
  Card,
  CardMedia,
  CardContent,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';

// components
import Page from '../../components/Page';
import { useSnackbar } from 'notistack';
import MuiTable, { applySortFilter, getComparator } from '../../components/Tables/MuiTable';
import Breadcrumb from '@/components/Breadcrumbs';
import Label from '../../components/Label';
import { useTheme } from '@mui/material/styles';
import { CategoryAPI } from '@/api/category';
import ICategory, { CATEGORY_TYPE } from '@/types/Category';

// Category Detail Modal
interface CategoryDetailModalProps {
  open: boolean;
  onClose: () => void;
  category: ICategory | null;
}

function CategoryDetailModal({ open, onClose, category }: CategoryDetailModalProps) {
  const theme = useTheme();

  if (!category) return null;

  // Function to get image URL from the attachment
  const getImageUrl = (attachment: any): string => {
    console.log('Getting image URL for attachment:', attachment);

    // If no attachment provided
    if (!attachment) {
      return '';
    }

    // If it's a string (direct URL), return it
    if (typeof attachment === 'string') {
      return attachment;
    }

    // If it's an object but doesn't have expected properties,
    // try to get the first non-null value
    if (typeof attachment === 'object') {
      const value = Object.values(attachment).find(val => val !== null && val !== undefined);
      return String(value || '');
    }

    return '';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: theme.palette.background.default
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Category Details
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{
              bgcolor: 'background.neutral',
              borderRadius: 2,
              overflow: 'hidden',
              height: 200
            }}>
              {category.thumb ? (
                <Box
                  component="img"
                  src={getImageUrl(category.thumb)}
                  alt={category.name}
                  onError={(e: any) => {
                    console.error('Image failed to load:', e);
                    e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No image available
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Name
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {category.name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Attributes
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {category.attributes && category.attributes.length > 0 ? (
                    category.attributes.map((attr, index) => (
                      <Chip
                        key={index}
                        label={attr}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.primary.light,
                          color: theme.palette.primary.dark,
                          borderRadius: 1
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No attributes defined
                    </Typography>
                  )}
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default function Categories() {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const COLUMNS = [
    { id: '_id', label: 'ID', alignRight: false, searchable: false },
    { id: 'name', label: t('common.name'), alignRight: false, searchable: true },
    { id: 'attributes', label: t('common.attributes'), alignRight: false, searchable: false },
  ];

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchBy, setSearchBy] = useState('name');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);

  useEffect(() => {
    getCategories();
    return () => {};
  }, []);

  const getCategories = async () => {
    try {
      console.log('Fetching categories...');
      const result = await CategoryAPI.getCategories();
      console.log('Full API response:', result);

      if (result && result.data) {
        console.log('Categories data structure:', JSON.stringify(result.data, null, 2));
        // Convert Category[] to ICategory[]
        const convertedCategories: ICategory[] = result.data.map((category: any) => ({
          _id: category._id,
          name: category.name,
          type: category.type === 'PRODUCT' ? CATEGORY_TYPE.PRODUCT : CATEGORY_TYPE.SERVICE,
          thumb: category.thumb || { _id: '', url: '', filename: '' },
          attributes: category.attributes || []
        }));
        setCategories(convertedCategories);
      } else if (Array.isArray(result)) {
        console.log('Categories array structure:', JSON.stringify(result, null, 2));
        // Convert Category[] to ICategory[] for direct array response
        const convertedCategories: ICategory[] = result.map((category: any) => ({
          _id: category._id,
          name: category.name,
          type: category.type === 'PRODUCT' ? CATEGORY_TYPE.PRODUCT : CATEGORY_TYPE.SERVICE,
          thumb: category.thumb || { _id: '', url: '', filename: '' },
          attributes: category.attributes || []
        }));
        setCategories(convertedCategories);
      } else {
        console.error('Unexpected API response format:', result);
        enqueueSnackbar('Invalid data format received', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Failed to load categories', { variant: 'error' });
    }
  };

  const handleClick = (event, name) => {
    // select
    if (selected.includes(name)) setSelected(selected.filter((n) => n != name));
    // unselect
    else setSelected([...selected, name]);
  };

  const onMore = (category: ICategory) => {
    console.log('Opening category details:', JSON.stringify(category, null, 2));
    console.log('Category thumb data:', category.thumb);
    setSelectedCategory(category);
    setModalOpen(true);
  };

  // const onAdd = () => navigate('/dashboard/products/add');

  // const onDelete = (category: ICategory) => {
  //   var proceed = confirm('Êtes-vous sur de vouloir continuer?');

  //   if (!proceed) return;

  //   CategoryAPI.delete(category._id)
  //     .then(() => {
  //       enqueueSnackbar('Category a ete supprimé avec success', {variant: 'success'});
  //       updateCategory();
  //     })
  //     .catch(() => {});
  // };

  const TableBodyComponent = ({data = []}) => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - categories.length) : 0;

    return (
      <TableBody>
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
          const isItemSelected = selected.indexOf(row._id) !== -1;
          return (
            <TableRow
              hover
              key={row._id}
              tabIndex={-1}
              role="checkbox"
              selected={isItemSelected}
              aria-checked={isItemSelected}
            >
              <TableCell align="left">
                <Label variant="ghost" color="info">
                  {index + 1}
                </Label>
              </TableCell>
              <TableCell align="left">{row.name}</TableCell>
              <TableCell align="left">{row.attributes ? row.attributes.length : 0}</TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => onMore(row)}
                  sx={{
                    color: theme.palette.grey[600],
                    '&:hover': {
                      backgroundColor: theme.palette.grey[500]
                    }
                  }}
                >
                  <ArticleIcon fontSize="medium" />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
        {emptyRows > 0 && (
          <TableRow style={{ height: 53 * emptyRows }}>
            <TableCell colSpan={6} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <Page title={t('navigation.categories')}>
      <Container>
        <Stack direction={'row'} justifyContent={'space-between'} mb={3}>
          <Typography variant="h4" gutterBottom>
            {t('navigation.categories')}
          </Typography>
          <Button
            startIcon={<AddIcon />}
            size="medium"
            variant="contained"
            onClick={() => navigate('/dashboard/categories/add')}
          >
            {t('common.add')}
          </Button>
        </Stack>
        <Stack mb={3}>
          <Breadcrumb />
        </Stack>
        {categories && (
          <MuiTable
            data={categories}
            columns={COLUMNS}
            page={page}
            setPage={setPage}
            order={order}
            setOrder={setOrder}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            filterName={filterName}
            setFilterName={setFilterName}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            TableBody={TableBodyComponent}
            searchFields={['name']}
            selected={selected}
            setSelected={setSelected}
          />
        )}

        {/* Category Detail Modal */}
        <CategoryDetailModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          category={selectedCategory}
        />
      </Container>
    </Page>
  );
}
