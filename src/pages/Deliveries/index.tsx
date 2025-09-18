//------------------------------------------------------------------------------
// <copyright file="deliveries.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material
import { Stack, Checkbox, TableRow, TableBody, TableCell, Container, Typography, Select, MenuItem, Button, ButtonGroup, Box, IconButton } from '@mui/material';

// components
import Page from '../../components/Page';
import { useSnackbar } from 'notistack';
import MuiTable, { applySortFilter, getComparator } from '../../components/Tables/MuiTable';
import ActionsMenu from '@/components/Tables/ActionsMenu';
import Breadcrumb from '@/components/Breadcrumbs';
import Label from '../../components/Label';
import { useTheme } from '@mui/material/styles';
import { DeliveryAPI } from '@/api/delivery';
import IDelivery, { DeliveryStatus } from '@/types/Delivery';
import useDelivery from '@/hooks/useDelivery';
import { RemoveRedEye } from '@mui/icons-material';
import DeliveryPreviewModal from './DeliveryPreviewModal';

const COLUMNS = [
    //{ id: '_id', label: 'ID', alignRight: false },
    { id: 'order.orderId', label: 'ID', alignRight: false, searchable: true },
    { id: 'end_address', label: 'à', alignRight: false, searchable: false },
    { id: 'price', label: 'Prix', alignRight: false, searchable: false },
    { id: 'restaurant.name', label: 'Restaurant', alignRight: false, searchable: true },
    { id: 'user.name', label: 'Client', alignRight: false, searchable: true },
    { id: 'rider.name', label: 'Livreur', alignRight: false, searchable: true },
    { id: 'status', label: 'Status', alignRight: false, searchable: true },
    { id: 'createdAt', label: 'le', alignRight: false, searchable: false},
];

// Map display names to actual field paths for search
const SEARCH_FIELD_MAPPING = {
    'order.orderId': 'ID',
    'restaurant.name': 'Restaurant',
    'user.name': 'Client',
    'rider.name': 'Livreur',
    'status': 'Status'
};

/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>

export default function Deliveries() {

    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const {deliveries, updateDelivery} = useDelivery();
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('desc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchBy, setSearchBy] = useState('end_address');

    const [statusFilter, setStatusFilter] = useState('');
    const [selectedDelivery, setSelectedDelivery] = useState<IDelivery | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateDeliveries = (statusFilter?: string) => {
        setStatusFilter(statusFilter)
        updateDelivery()
    };

    useEffect(() => {
        updateDelivery();
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

    const onMore = (delivery: IDelivery) => {
        setSelectedDelivery(delivery);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDelivery(null);
    };

    const TableBodyComponent = ({ data = [] }) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

        return (
            <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((delivery: IDelivery, index: number) => {
                    const isItemSelected = selected.indexOf(delivery._id) !== -1;

                    return (
                        <TableRow
                            hover
                            key={delivery._id}
                            tabIndex={-1}
                        >
                            <TableCell align="left">
                                <Label variant="ghost" color="success">
                                    {index + 1}
                                </Label>
                            </TableCell>
                            <TableCell align="left">{delivery.order.orderId}</TableCell>
                            <TableCell align="left">{delivery.end_address}</TableCell>
                            <TableCell align="left">{delivery.price} DA</TableCell>
                            <TableCell align="left">{delivery.restaurant.name}</TableCell>
                            <TableCell align="left">{delivery.user.name}</TableCell>
                            <TableCell align="left">{delivery.rider?.name || '-'}</TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color="info">
                                    {sentenceCase(delivery.status)}
                                </Label>
                            </TableCell>
                            <TableCell align="left">{new Date(delivery.createdAt).toDateString()}</TableCell>

                            <TableCell align="left">
                                {new Date(delivery.createdAt).toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </TableCell>
                            <TableCell padding="checkbox">
                                <IconButton
                                    aria-label="delete"
                                    size="medium"
                                    onClick={() => {
                                        onMore(delivery);
                                    }}
                                >
                                    <RemoveRedEye fontSize="inherit" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    );
                })}
                {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={9} />
                    </TableRow>
                )}
            </TableBody>
        );
    };

    /// <devdoc>
    ///    <para>order page components.</para>
    /// </devdoc>


    return (
        <Page title="Livraisons">
            <Container>
                <Stack direction="column" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        Livraisons
                    </Typography>
                </Stack>
                <Stack mb={3}>
                    <Breadcrumb />
                </Stack>
                <Stack direction="row" spacing={2} mb={2}>
                    <Typography variant="h4">Deliveries</Typography>
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
                        searchFields={['order.orderId', 'restaurant.name', 'user.name', 'rider.name', 'status']}
                    />
                )}
                <DeliveryPreviewModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    delivery={selectedDelivery}
                />
            </Container>
        </Page>
    );
}
