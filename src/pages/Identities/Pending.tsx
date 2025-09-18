//------------------------------------------------------------------------------
// <copyright file="identities.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// material
import {
    Stack,
    Avatar,
    Button,
    Checkbox,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    Chip,
    Icon
} from '@mui/material';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import { useSnackbar } from 'notistack';
import MuiTable, { applySortFilter, getComparator } from '../../components/Tables/MuiTable';
import ActionsMenu from '@/components/Tables/ActionsMenu';
import { useTheme } from '@mui/material/styles';
import { IdentityAPI } from '@/api/identity';
import { UserListToolbar } from '@/sections/@dashboard/user';
import UserVerificationModal from '@/shared/modal/UserVerificationModal';
import Breadcrumb from '@/components/Breadcrumbs';
import { verify } from 'crypto';
import IconButton from '@mui/material/IconButton';
import Iconify from '@/components/Iconify';
import useIdentity from '@/hooks/useIdentity';

const COLUMNS = [
    { id: 'user.name', label: 'Utilisateur', alignRight: false, searchable: true },
    { id: 'documentType', label: 'Documment', alignRight: false, searchable: true },
    { id: 'vehicleType.name', label: 'Vehicule', alignRight: false, searchable: true },
    { id: 'status', label: 'Statut', alignRight: false, searchable: true },
    { id: 'createdAt', label: 'Crée le', alignRight: false, searchable: false },
    { id: 'updatedAt', label: 'Modifié le', alignRight: false, searchable: false },
    { id: 'verify', label: 'Vérifier', alignRight: false, searchable: false },
    { id: '' },
];


const STATUS = {
    PENDING: "warning",
    FAILED: "error",
    ACCEPTED: "success"
}


const DOCUMENT_TYPE = {
    PASSPORT: "Passport",
    DRIVING_LICENCE: "Permis de conduire",
    NATIONAL_CARD: "Carte Nationale"
}

/// <devdoc>
///    <para>  identity Page for identities management. </para>
/// </devdoc>

export default function Pending({ pendingRiders }) {
    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const {identities, updateIdentity}= useIdentity();
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchBy, setSearchBy] = useState('name');
    const [open, setOpen] = useState(undefined);

    useEffect(() => {
        updateIdentity();
        return () => { };
    }, []);

    const goToProfile = (identity) => {
        navigate('/dashboard/account', {
            state: identity,
        });
    };

        
    const loadIdentity = (row) => {
        setOpen(row)
    };

    const accept = ({ _id: id }) => {
        var proceed = confirm("Êtes-vous sur de vouloir l'accepter?");
        if (proceed) {
            IdentityAPI.update({ id, status: 'ACCEPTED' })
                .then((res) => {
                    enqueueSnackbar('Identité accepter.', { variant: 'success' });
                    updateIdentity();
                    setOpen(undefined)
                })
                .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }));
        }
    };
    
    const decline = ({ _id: id }) => {

        var proceed = confirm('Êtes-vous sur de vouloir la décliner?');
        if (proceed) {
            IdentityAPI.update({ id, status: 'FAILED' })
                .then((res) => {
                    enqueueSnackbar('Identité décliné.', { variant: 'success' });
                    updateIdentity();
                    setOpen(undefined)
                })
                .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }));
        }
    };

    const TableBodyComponent = ({data = []}) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - pendingRiders.length) : 0;
        
        return (
            <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const { _id, user, type, status, createdAt, updatedAt } = row;
                    // row.name = row.user.name;
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
                            <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="subtitle2" noWrap>
                                        <Chip onClick={() => goToProfile(row.user)} label={user?.name} component="a" href="#basic-chip" clickable />
                                    </Typography>
                                </Stack>
                            </TableCell>

                            <TableCell align="left">{DOCUMENT_TYPE[row.documentType]}</TableCell>
                            <TableCell align="left">{row.vehicleType}</TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={STATUS[row.status]}>
                                    {sentenceCase(row.status)}
                                </Label>
                            </TableCell>
                            <TableCell align="left">{new Date(row.createdAt).toDateString()}</TableCell>
                            <TableCell align="left">{new Date(row.updatedAt).toDateString()}</TableCell>
                            {/* <TableCell align="right">
                                <ActionsMenu _id={row} verify={loadIdentity} enable={accept} disable={decline} />
                            </TableCell> */}
                            <TableCell align="right">
                                {/* <ActionsMenu
                                    _id={row}
                                    actions={[
                                        { label: 'Activer', onClick: accept, icon: 'mdi:user-check-outline' },
                                        { label: 'Désactiver', onClick: decline, icon: 'mdi:user-block-outline' },
                                        { label: 'Voir documents', onClick: loadIdentity, icon: 'majesticons:scan-user-line' },
                                    ]}
                                /> */}
                                <IconButton onClick={() => loadIdentity(row)}>
                                    <Iconify icon={'majesticons:scan-user-line'} width={24} height={24} />
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
        <Page title="Identités">
            <Container>
                {pendingRiders && (
                    <MuiTable
                        data={pendingRiders}
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
                        searchFields={['user.name', 'documentType', 'vehicleType.name', 'status']}
                    />
                )}
            </Container>
            <UserVerificationModal open={open} setOpen={setOpen} accept={accept} decline={decline} />
        </Page>
    );
}
