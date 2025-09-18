import { Box, Card, CardHeader, Container, Grid, Stack, TextField, Typography, Chip, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Form, useFormik, FormikProvider } from 'formik';
import Breadcrumb from '@/components/Breadcrumbs';
import Iconify from '@/components/Iconify';
import Page from '@/components/Page';
import { CategoryAPI } from '@/api/category';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { UploadMultiFile } from '@/components/upload/UploadMultiFile';
import { CATEGORY_TYPE } from '@/types/Category';

// Add enum at the top of the file


export default function AddSouCategory() {
    const [categoryImage, setCategoryImage] = useState<File | null>(null);
    const { enqueueSnackbar } = useSnackbar();
    const [categories,setCategories] = useState([])
    const [namecategory, setNamecategory] = useState<string>('de')
    const navigate = useNavigate();

    useEffect(()=>{
        getCategories()
    },[])


      const getCategories = async () => {
    try {
      console.log('Fetching categories...');
      const result = await CategoryAPI.getCategories();
      console.log('Full API response: sou ) ', result);

      if (result && result.data) {
        console.log('Categories data structure:', JSON.stringify(result.data, null, 2));
        setCategories(result.data);
      } else if (Array.isArray(result)) {
        console.log('Categories array structure:', JSON.stringify(result, null, 2));
        setCategories(result);
      } else {
        console.error('Unexpected API response format:', result);
        enqueueSnackbar('Invalid data format received', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Failed to load categories', { variant: 'error' });
    }
  };

  
    const CategorySchema = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Le nom doit contenir au moins 2 caractères !')
            .max(50, 'Le nom est trop long !')
            .required('Le nom est requis !'),
            category: Yup.string()
            // .oneOf([CATEGORY_TYPE.PRODUCT, CATEGORY_TYPE.SERVICE], 'Le type doit être produit ou service')
            .required('Le type est requis !'),
        attributes: Yup.array().of(Yup.string()),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            category: '',
            attributes: [],
        },
        validationSchema: CategorySchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                let response;

                console.log('Vl ) ',values);
                 
                
                    // Create form data to include the image
                    const formData = new FormData();

                    const dataPayload = {
                        name: values.name,
                        category: values.category,
                        attributes: values.attributes || [],
                        Namecategory : namecategory
                    };
                    formData.append('data', JSON.stringify(dataPayload)); // All structured data
                    formData.append('image', categoryImage); // The file

                    console.log('Sending category data with image');
                    response = await CategoryAPI.createSouCat(formData);
            

                console.log('Category creation response:', response);

                enqueueSnackbar('Sou-Catégorie créée avec succès !', { variant: 'success' });
                navigate(-1);
            } catch (error) {
                console.error('Error creating category:', error);
                if (error.response?.data?.message) {
                    const errorMessage = Array.isArray(error.response.data.message)
                        ? error.response.data.message.join(', ')
                        : error.response.data.message;
                    enqueueSnackbar(errorMessage, { variant: 'error' });
                } else {
                    enqueueSnackbar('Échec de la création de la catégorie', { variant: 'error' });
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    const { errors, touched, isSubmitting, handleSubmit, getFieldProps, setFieldValue, values } = formik;

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setCategoryImage(acceptedFiles[0]);
        }
    };

    const handleRemove = () => {
        setCategoryImage(null);
    };

    const handleRemoveAll = () => {
        setCategoryImage(null);
    };

    return (
        <Page title="Créer une Catégorie">
            <Container>
                <Stack direction="row" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        Créer une Nouvelle Catégorie OUU
                    </Typography>
                </Stack>
                <Stack mb={3}>
                    <Breadcrumb />
                </Stack>

                <Card>
                    <CardHeader
                        title="Détails de la Nouvelle Catégorie"
                        subheader="Créez une nouvelle catégorie pour vos produits ou services"
                        action={<Iconify width={40} height={40} icon="mdi:shape-outline" />}
                    />
                    <Box sx={{ p: 4 }}>
                        <FormikProvider value={formik}>
                            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Nom de la sou-Catégorie"
                                            {...getFieldProps('name')}
                                            error={Boolean(touched.name && errors.name)}
                                            helperText={touched.name && errors.name}
                                        />
                                    </Grid>

                                    {/* <Grid item xs={12}>
                                        <FormControl fullWidth error={Boolean(touched.type && errors.type)}>
                                            <InputLabel>Type de Catégorie</InputLabel>
                                            <Select
                                                label="Type de Catégorie"
                                                {...getFieldProps('type')}
                                            >
                                                <MenuItem value={CATEGORY_TYPE.PRODUCT}>Produit</MenuItem>
                                                <MenuItem value={CATEGORY_TYPE.SERVICE}>Service</MenuItem>
                                            </Select>
                                            {touched.type && errors.type && (
                                                <Typography variant="caption" color="error">
                                                    {errors.type}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid> */}


                                     <Grid item xs={12} md={6}>
                                                                    <TextField
                                                                        select
                                                                        fullWidth
                                                                        label="choose the category"
                                                                        
                                                                        // onChange={(e) => {setFieldValue('type', e.target.value);}}
                                                                        value={namecategory}
                                                                        error={Boolean(touched.category && errors.category)}
                                                                        // helperText={touched.cat ? getErrorMessage(errors.cat) : undefined}
                                                                    >
                                                                        {categories.map((ti) => (
                                                                            <MenuItem key={ti._id} onClick={(e)=> {{
                                                                                setFieldValue('category',ti._id)  
                                                                                setNamecategory(ti.name)
                                                                            }}} value={ti.name}>
                                                                                {ti.name}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </TextField>
                                                                </Grid>


                                    

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Attributs"
                                            placeholder="Ajouter un attribut et appuyer sur Entrée"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.target as HTMLInputElement;
                                                    const value = input.value.trim();

                                                    if (value && !values.attributes.includes(value)) {
                                                        const newAttributes = [...values.attributes, value];
                                                        setFieldValue('attributes', newAttributes);
                                                        input.value = '';
                                                    }
                                                }
                                            }}
                                            error={Boolean(touched.attributes && errors.attributes)}
                                            helperText={touched.attributes && errors.attributes ?
                                                (typeof errors.attributes === 'string' ? errors.attributes : 'Format invalide') :
                                                'Ajoutez des attributs et appuyez sur Entrée'}
                                        />

                                        {values.attributes.length > 0 && (
                                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {values.attributes.map((attribute, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={attribute}
                                                        onDelete={() => {
                                                            const newAttributes = values.attributes.filter((_, i) => i !== index);
                                                            setFieldValue('attributes', newAttributes);
                                                        }}
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{ mb: 1 }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                                                Image de la Catégorie
                                            </Typography>
                                            <UploadMultiFile
                                                showPreview
                                                files={categoryImage ? [categoryImage] : []}
                                                onDrop={handleDrop}
                                                onRemove={handleRemove}
                                                onRemoveAll={handleRemoveAll}
                                                accept={{
                                                    'image/*': ['.jpeg', '.jpg', '.png', '.gif']
                                                }}
                                            />
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <LoadingButton
                                            fullWidth
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            loading={isSubmitting}
                                        >
                                            Créer la Catégorie
                                        </LoadingButton>
                                    </Grid>
                                </Grid>
                            </Form>
                        </FormikProvider>
                    </Box>
                </Card>
            </Container>
        </Page>
    );
}
