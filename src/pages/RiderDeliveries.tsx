//------------------------------------------------------------------------------
// <copyright file="deliveries.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material
import { Stack, Checkbox, TableRow, TableBody, TableCell, Container, Typography, Select, MenuItem, Button, ButtonGroup, Box } from '@mui/material';

// components
import Page from '../components/Page';
import { useSnackbar } from 'notistack';
import MuiTable, { applySortFilter, getComparator } from '../components/Tables/MuiTable';
import ActionsMenu from '@/components/Tables/ActionsMenu';
import Breadcrumb from '@/components/Breadcrumbs';
import Label from '../components/Label';
import { useTheme } from '@mui/material/styles';
import { DeliveryAPI } from '@/api/delivery';
import IDelivery, { DeliveryStatus } from '@/types/Delivery';

const COLUMNS = [
    //{ id: '_id', label: 'ID', alignRight: false },
    { id: 'order.orderId', label: 'Order ID', alignRight: false, searchable: true },
    { id: 'end_address', label: 'à', alignRight: false, searchable: false },
    { id: 'price', label: 'Prix', alignRight: false, searchable: false },
    // { id: 'restaurant', label: 'Restaurant', alignRight: false },
    { id: 'user', label: 'Client', alignRight: false, searchable: false },
    { id: 'rider', label: 'Livreur', alignRight: false, searchable: false },
    { id: 'status', label: 'Status', alignRight: false, searchable: false },
    { id: 'createdAt', label: 'le', alignRight: false, searchable: false },
];

/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>


export default function Deliveries({ rider }: any) {

    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [deliveries, setDeliveries] = useState([]);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchBy, setSearchBy] = useState('end_address');
    const [statusFilter, setStatusFilter] = useState('');


    console.log("iddd =>", deliveries);
    
    const updateDeliveries = (riderId?: string, statusFilter?: string) => {
        setStatusFilter(statusFilter)

        console.log("aaaa", statusFilter);
        
        DeliveryAPI.findByRider(riderId)
            .then(({ data }) => setDeliveries(data))
            .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }));
    };

    useEffect(() => {
        updateDeliveries(rider._id, statusFilter);
    }, []);

    const onReportDriver = (_id) => {
        var proceed = confirm('Êtes-vous sur de vouloir continuer?');
        if (proceed) {
            // TODO: IMPLEMENT THE REPORT DRIVER
            // DeliveryAPI.reportDriver(_id)
            // .then(({ data }) => enqueueSnackbar(data.message, { variant:'success' }))
            // .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }));
        }
    };

    const handleClick = (event, name) => {
        // select
        if (selected.includes(name)) setSelected(selected.filter((n) => n != name));
        // unselect
        else setSelected([...selected, name]);
    };

    const onMore = (delivery: any) => {
        navigate('/dashboard/delivery', {
            state: delivery,
        });
    };

    const TableBodyComponent = ({data = []}) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - deliveries.length) : 0;

        return (
            <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((delivery: IDelivery, index: number) => {
                    const isItemSelected = selected.indexOf(delivery._id) !== -1;

                    return (
                        <TableRow
                            hover
                            key={delivery._id}
                            tabIndex={-1}
                        // role="checkbox"
                        // selected={isItemSelected}
                        // aria-checked={isItemSelected}
                        >
                            {/* <TableCell padding="checkbox">
                                <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, status)} />
                            </TableCell> */}
                            <TableCell align="left">
                                <Label variant="ghost" color="success">
                                    {index + 1}
                                </Label>
                            </TableCell>
                            <TableCell align="left"> {delivery.order.orderId}</TableCell>
                            <TableCell align="left">{delivery.end_address}</TableCell>
                            <TableCell align="left">{delivery.price} DA</TableCell>
                            {/* <TableCell align="left">{delivery.restaurant.name} DA</TableCell> */}
                            <TableCell align="left">{delivery.user.name}</TableCell>
                            <TableCell align="left">{delivery.rider?.name || '-'}</TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color="info">
                                    {sentenceCase(delivery.status)}
                                </Label>
                            </TableCell>
                            <TableCell align="left">{new Date(delivery.createdAt).toDateString()}</TableCell>

                            {/* <TableCell align="right">
                                <ActionsMenu
                                    _id={delivery._id}
                                // actions={[
                                //     { label: 'Voir plus', onClick: () => onMore(delivery), icon: 'icon-park-outline:more-one' },
                                //     { label: 'Report Driver', onClick: onReportDriver, icon: 'material-symbols:report-outline' },
                                //     // { label: 'confirm payment', onClick: onPaymentConfirm, icon: 'gis:flag-finish-b-o' },
                                // ]}
                                />
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
        <Page title="Livreur">
            <Container>
                <Stack direction="column" justifyContent="space-between" mb={3} mt={3}>
                    <Typography variant="h5" gutterBottom>
                        Livraisons
                    </Typography>
                </Stack>

                {deliveries && (
                    <MuiTable
                        data={deliveries}
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
                        // TableBody={(item) => <p>{item._id}</p>}
                        searchFields={['order.orderId']}
                    />
                )}
            </Container>
        </Page>
    );
}
