//------------------------------------------------------------------------------
// <copyright file="products.tsx" Author="Abdelhamid Larachi">
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
    Select,
    MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// components
import Page from '../../components/Page';
import { useSnackbar } from 'notistack';
import ResponsiveTable from '../../components/Tables/ResponsiveTable';
import ActionsMenu from '@/components/Tables/ActionsMenu';
import Breadcrumb from '@/components/Breadcrumbs';
import Label from '../../components/Label';
import { useTheme } from '@mui/material/styles';
import { ProductAPI } from '@/api/product';
import { FoodCategory } from '@/types/Restaurant';
import { CategoryAPI } from '@/api/category';
import { RestaurantApi } from '@/api/restaurant';
import useCategory from '@/hooks/useCategory';
import useProduct from '@/hooks/useProduct';


/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>


export default function Products() {
    const { t } = useTranslation();
    const theme = useTheme();
    
    const COLUMNS = [
        //{ id: '_id', label: 'ID', alignRight: false },
        { id: 'name', label: t('common.name'), alignRight: false, searchable: true },
        { id: 'description', label: t('common.description'), alignRight: false, searchable: false },
        { id: 'restaurant.name', label: t('navigation.restaurants'), alignRight: false, searchable: true },
        { id: 'category.name', label: t('common.category'), alignRight: false, searchable: true },
        { id: 'price', label: t('common.price'), alignRight: false, searchable: false },
        { id: 'deleted', label: t('common.available'), alignRight: false, searchable: false },
        { id: 'createdAt', label: t('common.createdAt'), alignRight: false, searchable: false },
        { id: 'updatedAt', label: t('common.updatedAt'), alignRight: false, searchable: false },
    ];

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const {products, updateProduct} = useProduct();
    const {categories, updateCategory} = useCategory();
    const [restaurants, setRestaurants] = useState([]);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchBy, setSearchBy] = useState('name');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState('');

    /// <summary>
    /// Set products data, gets updated on products state change
    /// <Returns> returns cleanup function</Returns>
    /// </summary>


    useEffect(() => {
        updateCategory()
        updateProduct()
        getRestaurants();
        return () => { };
    }, []);

    const getRestaurants = () => {
        RestaurantApi.find()
            .then(({ data }) => {
                setRestaurants(data)
            })
    };

    /// <summary>
    /// on table row click, toggle order selection (checkbox)
    /// <param name="event"> object click event</param>
    /// <param name="name"> string order name</param>
    /// <Exception>none</Exception>
    /// </summary>

    const handleClick = (event, name) => {
        // select
        if (selected.includes(name)) setSelected(selected.filter((n) => n != name));
        // unselect
        else setSelected([...selected, name]);
    };

    /// <summary>
    /// navigate to product details
    /// <param name="product"> product</param>
    /// <Exception>none</Exception>
    /// </summary>

    const onMore = (product: any) => {
        navigate('/dashboard/product', {
            state: product,
        });
    }

    /// <summary>
    /// navigate to product form
    /// <Exception>none</Exception>
    /// </summary>

    const onAdd = () =>
        navigate('/dashboard/products/add');


    const TableBodyComponent = ({ data = [] }) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - products.length) : 0;

        return (
            <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const { _id, name, description, restaurant, category, price, deleted, createdAt, updatedAt } = row;
                    const isItemSelected = selected.indexOf(_id) !== -1;
                    return (
                        <TableRow
                            hover
                            key={_id}
                            tabIndex={-1}
                        // role="checkbox"
                        // selected={isItemSelected}
                        // aria-checked={isItemSelected}
                        >
                            {/* <TableCell padding="checkbox">
                                <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, name)} />
                            </TableCell> */}
                            <TableCell align="left">
                                <Label variant="ghost" color="success">
                                    {index + 1}
                                </Label>
                            </TableCell>
                            <TableCell align="left"> {name}</TableCell>
                            <TableCell align="left" >{description}</TableCell>
                            <TableCell align="left" >{restaurant.name}</TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={'warning'}>
                                    {sentenceCase(category.name)}
                                </Label>
                            </TableCell>
                            <TableCell align="left">{price} DA</TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={deleted ? 'error' : 'success'}>
                                    {sentenceCase(' ')}
                                </Label>
                            </TableCell>
                            <TableCell align="left">{new Date(createdAt).toDateString()}</TableCell>
                            <TableCell align="left">{new Date(updatedAt).toDateString()}</TableCell>
                            {/* <TableCell align="right">
                                <ActionsMenu _id={_id} actions={[
                                    // { label: 'Voir plus', onClick: onMore, icon: 'icon-park-outline:more-one' },
                                    // { label: 'Modifier', onClick: onMore, icon: 'basil:edit-outline' },
                                    { label: 'Supprimer', onClick: onDelete, icon: 'fluent:delete-24-filled' },
                                ]} />
                            </TableCell> */}

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

    /// <devdoc>
    ///    <para>order page components.</para>
    /// </devdoc>

    return (
        <Page title={t('navigation.products')}>
            <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
                <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    mb={{ xs: 2, sm: 3 }}
                    alignItems="center"
                >
                    <Typography 
                        variant="h4" 
                        gutterBottom
                        sx={{ 
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                            textAlign: { xs: 'center', sm: 'left' }
                        }}
                    >
                        {t('navigation.products')}
                    </Typography>
                </Stack>
                <Stack mb={3}>
                    <Breadcrumb />
                </Stack>
                {products && (
                    <ResponsiveTable
                        data={products}
                        columns={COLUMNS}
                        page={page}
                        setPage={setPage}
                        order={order}
                        setOrder={setOrder}
                        orderBy={orderBy}
                        setOrderBy={setOrderBy}
                        selected={selected}
                        setSelected={setSelected}
                        filterName={filterName}
                        setFilterName={setFilterName}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        TableBody={TableBodyComponent}
                        searchFields={['name', 'restaurant.name', 'category.name']}
                        onRowClick={(row) => onMore(row)}
                    />
                )}
            </Container>
        </Page>
    );
}