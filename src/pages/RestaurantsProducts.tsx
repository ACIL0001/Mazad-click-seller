//------------------------------------------------------------------------------
// <copyright file="products.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

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
import Page from '../components/Page';
import { useSnackbar } from 'notistack';
import MuiTable, { applySortFilter, getComparator } from '../components/Tables/MuiTable';
import ActionsMenu from '@/components/Tables/ActionsMenu';
import Breadcrumb from '@/components/Breadcrumbs';
import Label from '../components/Label';
import { useTheme } from '@mui/material/styles';
import { ProductAPI } from '@/api/product';
import { FoodCategory } from '@/types/Restaurant';
import { CategoryAPI } from '@/api/category';
import { RestaurantApi } from '@/api/restaurant';


const COLUMNS = [
    //{ id: '_id', label: 'ID', alignRight: false },
    { id: 'name', label: 'Nom', alignRight: false, searchable: true },
    { id: 'description', label: 'Déscription', alignRight: false, searchable: false },
    { id: 'restaurants', label: 'Restaurant', alignRight: false, searchable: false },
    { id: 'category', label: 'Catégorie', alignRight: false, searchable: false },
    { id: 'price', label: 'Prix', alignRight: false, searchable: false },
    { id: 'deleted', label: 'Disponible', alignRight: false, searchable: false },
    { id: 'createdAt', label: 'Crée le', alignRight: false, searchable: false },
    { id: 'updatedAt', label: 'A jour le', alignRight: false, searchable: false },
];



/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>


export default function Products({ restaurant }: any) {
    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
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
        get();
        getCategories();
        return () => { };
    }, []);


    /// <summary>
    /// Load products api.
    /// <Exception>throw UnauthorizedAccessException if access is denied</Exception>
    /// </summary>


    const get = () => {
        ProductAPI.findByRestaurant(restaurant._id)
            .then(({ data }) => {
                setProducts(data)
            })
    };

    const getCategories = () => {
        CategoryAPI.getCategories()
            .then(({ data }) => {
                setCategories(data)
            })
    };

    // const getRestaurants = () => {
    //     RestaurantApi.find()
    //         .then(({ data }) => {
    //             setRestaurants(data)
    //         })
    // };


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

    /// <summary>
    /// delete product
    /// <param name="product"> product</param>
    /// <Exception>none</Exception>
    /// </summary>

    // const onDelete = (product: any) => {
    //     var proceed = confirm("Êtes-vous sur de vouloir continuer?");

    //     if (proceed) {
    //         console.log(product);

    //         ProductAPI.delete(product)
    //             .then(({ data }) => {
    //                 enqueueSnackbar(`Supprimer avec succés!`, { variant: "success" });
    //                 get()
    //             })
    //             .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }))
    //     }
    // }

    /// <summary>
    /// Table body component, contain row cells.
    /// <Exception>throw UndefinedException if variables are undefined on component state</Exception>
    /// </summary>


    const TableBodyComponent = ({data = []}) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - products.length) : 0;
        let filtered = products;

        if (selectedCategory) {
            filtered = filtered.filter(product => product.category?._id === selectedCategory);
            console.log("filteredCategories", filtered);

        }

        if (selectedRestaurant) {
            filtered = filtered.filter(product => product.restaurant?._id === selectedRestaurant);
            console.log("filteredRestaurants", filtered);

        }


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
        <Page title="Restaurant">
            <Container>
                <Stack direction="row" justifyContent="space-between" mb={2} mt={2}>
                    <Typography variant="h5" gutterBottom>
                        Produits
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={2} mb={2}>
                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                    >
                        <MenuItem value="">Toutes les catégories</MenuItem>
                        {categories.map(item => (
                            <MenuItem key={item.category._id} value={item.category._id}>{item.category.name}</MenuItem>
                        ))}
                    </Select>
                </Stack>
                {products && (
                    <MuiTable
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
                        searchFields={['name']}
                    />
                )}
            </Container>
        </Page>
    );
}