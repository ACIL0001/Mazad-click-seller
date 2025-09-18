//------------------------------------------------------------------------------
// <copyright file="rides.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import { RideAPI } from '@/api/ride';

const COLUMNS = [
    //{ id: '_id', label: 'ID', alignRight: false },
    { id: 'start_address', label: 'de', alignRight: false, searchable: false },
    { id: 'end_address', label: 'à', alignRight: false, searchable: false },
    { id: 'distance', label: 'Distance', alignRight: false, searchable: false },
    { id: 'duration', label: 'Durée', alignRight: false, searchable: false },
    { id: 'datetime', label: 'Départ', alignRight: false, searchable: false },
    { id: 'price', label: 'Prix', alignRight: false, searchable: false },
    { id: 'status', label: 'Status', alignRight: false, searchable: true },
    //{ id: 'createdBy', label: 'Crée par', alignRight: false },
    { id: 'createdAt', label: 'le', alignRight: false, searchable: false },
];



/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>


export default function Review() {
    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [rides, setRides] = useState([]);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchBy, setSearchBy] = useState('end_address');


    /// <summary>
    /// Set rides data, gets updated on rides state change
    /// <Returns> returns cleanup function</Returns>
    /// </summary>


    useEffect(() => {
        get();
        return () => { };
    }, []);


    /// <summary>
    /// Load rides api.
    /// <Exception>throw UnauthorizedAccessException if access is denied</Exception>
    /// </summary>


    const get = () => {
        RideAPI.findAll()
            .then(({ data }) => setRides(data))
            .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }))
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
    /// navigate to ride details
    /// <param name="ride"> ride</param>
    /// <Exception>none</Exception>
    /// </summary>

    const seeMore = (ride: any) => {
        navigate('/dashboard/ride', {
            state: ride,
        });
    }

    /// <summary>
    /// Table body component, contain row cells.
    /// <Exception>throw UndefinedException if variables are undefined on component state</Exception>
    /// </summary>


    const TableBodyComponent = ({data = []}) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rides.length) : 0;

        return (
            <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { _id, start_address, end_address, distance, duration, datetime, price, plateNumber, status, passengers, seats, createdBy, createdAt } = row;
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
                            <TableCell align="left"> {start_address}</TableCell>
                            <TableCell align="left" >{end_address}</TableCell>
                            <TableCell align="left">{distance.text}</TableCell>
                            <TableCell align="left">{duration.text}</TableCell>
                            <TableCell align="left">{new Date(datetime).toDateString()}</TableCell>
                            <TableCell align="left">{price} DA</TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color="info">
                                    {sentenceCase(status)}
                                </Label>
                            </TableCell>
                            {/*
              <TableCell onClick={() => findUser(createdBy)} align="left">
                <Label variant="ghost" color="info">
                  {sentenceCase(createdBy.name)}
                </Label>
              </TableCell>
          */}
                            <TableCell align="left">{new Date(createdAt).toDateString()}</TableCell>

                            {/* <TableCell align="right">
                <ActionsMenu _id={row} more={seeMore} />
              </TableCell> */}
                            <TableCell align="right">
                                <ActionsMenu
                                    _id={row}
                                    actions={[
                                        { label: 'Voir plus', onClick: seeMore, icon: 'ic:round-read-more' },
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
        <Page title="Trajets">
            <Container>
                <Stack direction="column" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        Trajets
                    </Typography>
                </Stack>
                <Stack mb={3}>
                    <Breadcrumb />
                </Stack>
                {rides && (
                    <MuiTable
                        data={rides}
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
                        searchFields={['status']}
                    />
                )}
            </Container>
        </Page>
    );
}
