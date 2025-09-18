//------------------------------------------------------------------------------
// <copyright file="reports.tsx" Author="Abdelhamid Larachi">
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
import { ReportAPI } from '@/api/report';


/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>


export default function Report() {
    const { t } = useTranslation();
    const theme = useTheme();
    
    const COLUMNS = [
        //{ id: '_id', label: 'ID', alignRight: false },
        { id: 'subject', label: t('common.subject'), alignRight: false, searchable: true },
        { id: 'closed', label: t('common.processed'), alignRight: false, searchable: false },
        { id: 'user', label: t('common.reported'), alignRight: false, searchable: false },
        { id: 'createdBy', label: t('common.by'), alignRight: false, searchable: false},
        { id: 'createdAt', label: t('common.createdAt'), alignRight: false, searchable: false },
    ];

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchBy, setSearchBy] = useState('name');


    /// <summary>
    /// Set reports data, gets updated on reports state change
    /// <Returns> returns cleanup function</Returns>
    /// </summary>


    useEffect(() => {
        get();
        return () => { };
    }, []);


    /// <summary>
    /// Load reports api.
    /// <Exception>throw UnauthorizedAccessException if access is denied</Exception>
    /// </summary>


    const get = () => {
        ReportAPI.get()
            .then(({ data }) => {
                const reports_ = data.map(r => { return { ...r, name: r.user.name } })
                setReports(reports_)
            })
            .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }))
    };



    /// <summary>
    /// remove review
    /// <param name="id"> string review id</param>
    /// <Exception>throw UnauthorizedAccessException if access is denied</Exception>
    /// <Exception>throw NotFoundException if product not found</Exception>
    /// </summary>


    const close = (_id) => {
        ReportAPI.close(_id)
            .then(res => {
                enqueueSnackbar("Réclamation Archivé", { variant: 'success' });
                get();
            })
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


    const TableBodyComponent = ({ data = [] }) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - reports.length) : 0;

        return (
            <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { _id, subject, closed, user, createdBy, createdAt, name } = row;
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
                                <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, _id)} />
                            </TableCell>

                            <TableCell align="left" >{subject}</TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={closed ? 'success' : 'error'}>
                                    {sentenceCase("")}
                                </Label>
                            </TableCell>
                            <TableCell onClick={() => findUser(user)} align="left">
                                <Label variant="ghost" color="info">
                                    {sentenceCase(name)}
                                </Label>
                            </TableCell>
                            <TableCell onClick={() => findUser(createdBy)} align="left">
                                <Label variant="ghost" color="info">
                                    {sentenceCase(createdBy.name)}
                                </Label>
                            </TableCell>

                            <TableCell align="left">{new Date(createdAt).toDateString()}</TableCell>
                            {/* <TableCell align="right">
                                <ActionsMenu _id={_id} close={close} />
                            </TableCell> */}
                            <TableCell align="right">
                                <ActionsMenu
                                    _id={row}
                                    actions={[
                                        { label: 'Archiver', onClick: close, icon: 'mdi:archive-lock-outline' },
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
        <Page title={t('navigation.reports')}>
            <Container>
                <Stack direction="column" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        {t('navigation.reports')}
                    </Typography>
                </Stack>
                <Stack mb={3}>
                    <Breadcrumb />
                </Stack>
                {reports && (
                    <MuiTable
                        data={reports}
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
                        searchFields={['subject']}
                    />
                )}
            </Container>
        </Page>
    );
}
