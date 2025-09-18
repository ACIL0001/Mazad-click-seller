//------------------------------------------------------------------------------
// <copyright file="Reviews.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Iconify from '../components/Iconify';

// material
import {
    Stack,
    Checkbox,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    Chip,
    Rating,
} from '@mui/material';


// components
import Page from '../components/Page';
import { useSnackbar } from 'notistack';
import MuiTable, { applySortFilter, getComparator } from '../components/Tables/MuiTable';
import ActionsMenu from '@/components/Tables/ActionsMenu';
import Breadcrumb from '@/components/Breadcrumbs';
import Label from '../components/Label';
import { useTheme } from '@mui/material/styles';
import { ReviewService as ReviewAPI } from '@/api/review';


/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>


export default function Review() {
    const { t } = useTranslation();
    const theme = useTheme();
    
    const COLUMNS = [
        //{ id: '_id', label: 'ID', alignRight: false },
        { id: 'rating', label: t('common.rating'), alignRight: false, searchable: false },
        { id: 'comment', label: t('common.comment'), alignRight: false, searchable: false },
        { id: 'user.name', label: t('common.by'), alignRight: false , searchable: true},
        { id: 'createdBy', label: t('common.for'), alignRight: false , searchable: false},
        { id: 'createdAt', label: t('common.createdAt'), alignRight: false, searchable: false },
    ];

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchBy, setSearchBy] = useState('comment');


    /// <summary>
    /// Set reviews data, gets updated on reviews state change
    /// <Returns> returns cleanup function</Returns>
    /// </summary>


    useEffect(() => {
        get();
        return () => { };
    }, []);


    /// <summary>
    /// Load reviews api.
    /// <Exception>throw UnauthorizedAccessException if access is denied</Exception>
    /// </summary>


    const get = () => {
        ReviewAPI.find()
            .then(({ data }) => setReviews(data))
            .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }))
    };



    /// <summary>
    /// remove review
    /// <param name="id"> string review id</param>
    /// <Exception>throw UnauthorizedAccessException if access is denied</Exception>
    /// <Exception>throw NotFoundException if product not found</Exception>
    /// </summary>


    const remove = (_id) => {

        ReviewAPI.remove(_id)
            .then(res => {
                setReviews(reviews.filter(b => b._id != _id))
                enqueueSnackbar("Avis supprimé", { variant: 'success' });
            })
            .catch((e) => {
                //enqueueSnackbar(e.response.data.message, { variant: 'error' });
            });

    }


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
    /// navigate to user
    /// <param name="user"> user</param>
    /// <Exception>none</Exception>
    /// </summary>

    const findUser = (user: any) => {
        navigate('/dashboard/account', {
            state: user,
        });
    }


    /// <summary>
    /// Table body component, contain row cells.
    /// <Exception>throw UndefinedException if variables are undefined on component state</Exception>
    /// </summary>


    const TableBodyComponent = ({data = []}) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - reviews.length) : 0;

        return (
            <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { _id, rating, comment, user, createdBy, createdAt } = row;
                    const isItemSelected = selected.indexOf(_id) !== -1;

                    return (
                        <TableRow
                            hover
                            key={_id}
                            tabIndex={-1}
                            role="checkbox"
                            selected={isItemSelected}
                            aria-checked={isItemSelected}
                        >
                            <TableCell padding="checkbox">
                                <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, name)} />
                            </TableCell>

                            <TableCell align="left" >
                                <Rating name="read-only" value={rating} readOnly />
                            </TableCell>
                            <TableCell align="left" >{comment}</TableCell>
                            <TableCell onClick={() => findUser(user)} align="left">
                                <Label variant="ghost" color="info">
                                    {sentenceCase(user.name)}
                                </Label>
                            </TableCell>
                            <TableCell onClick={() => findUser(createdBy)} align="left">
                                <Label variant="ghost" color="info">
                                    {sentenceCase(createdBy.name)}
                                </Label>
                            </TableCell>
                            <TableCell align="left">{new Date(createdAt).toDateString()}</TableCell>
                            {/* <TableCell align="right">
                <ActionsMenu _id={_id} remove={remove} />
              </TableCell> */}
                            <TableCell align="right">
                                <ActionsMenu
                                    _id={row}
                                    actions={[
                                        { label: 'Supprimer', onClick: remove, icon: 'eva:trash-2-outline' },
                                    ]}
                                />
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

    /// <devdoc>
    ///    <para>order page components.</para>
    /// </devdoc>

    return (
        <Page title={t('navigation.reviews')}>
            <Container>
                <Stack direction="column" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        {t('navigation.reviews')}
                    </Typography>
                </Stack>
                <Stack mb={3}>
                    <Breadcrumb />
                </Stack>
                {reviews && (
                    <MuiTable
                        data={reviews}
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
                        searchFields={['user.name']}
                    />
                )}
            </Container>
        </Page>
    );
}
