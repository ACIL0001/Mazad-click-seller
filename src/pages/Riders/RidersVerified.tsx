//------------------------------------------------------------------------------
// <copyright file="Users.tsx" Author="Abdelhamid Larachi">
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
} from '@mui/material';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import { useSnackbar } from 'notistack';
import MuiTable, { applySortFilter, getComparator } from '../../components/Tables/MuiTable';
import ActionsMenu from '@/components/Tables/ActionsMenu';
import { UserListToolbar } from '../../components/user/user-list-toolbar';
import { useTheme } from '@mui/material/styles';
import { UserAPI } from '@/api/user';
import User from '@/types/User';

const COLUMNS = [
    { id: 'name', label: 'Nom', alignRight: false, searchable: true },
    // { id: 'isMale', label: 'Male', alignRight: false },
    { id: 'phone', label: 'Tel', alignRight: false, searchable: false },
    { id: 'details.vehicleType', label: 'Type de véhicule', alignRight: false, searchable: false },
    // { id: 'isActive', label: 'En ligne', alignRight: false },
    { id: 'verified', label: 'Vérifié', alignRight: false, searchable: false },
    { id: 'enabled', label: 'Activé', alignRight: false, searchable: false },
    { id: 'createdAt', label: 'Créé Le', alignRight: false, searchable: false },
    { id: '' },
];

export default function ActivatingRider({ riders, enable, disable }) {
    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const goToProfile = (user) => {
        navigate('/dashboard/account', {
            state: user,
        });
    };


    const TableBodyComponent = ({ data = [] }) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - riders.length) : 0;
        
        return (
            <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const { _id, name, isMale, tel, verified, details, enabled, createdAt } = row;
                    const isItemSelected = selected.indexOf(name) !== -1;

                    return (
                        <TableRow
                            hover
                            key={_id}
                            tabIndex={-1}
                            // role="checkbox"
                            // selected={isItemSelected}
                            aria-checked={isItemSelected}
                        >
                            {/* <TableCell padding="checkbox">
                                <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, name)} />
                            </TableCell> */}
                            <TableCell align="left">
                                <Label variant="ghost" color="info">
                                    {index + 1}
                                </Label>
                            </TableCell>
                            <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="subtitle2" noWrap>
                                        <Chip onClick={() => goToProfile(row)} label={name} component="a" href="#basic-chip" clickable />
                                    </Typography>
                                </Stack>
                            </TableCell>

                            {/* <TableCell align="center">{isMale ? "Homme" : 'Femme'}</TableCell> */}
                            <TableCell align="left">0{tel}</TableCell>
                            {/* <TableCell align="left">0{VehicleType}</TableCell> */}
                            {/* <TableCell align="left">{rating.value} ★</TableCell> */}
                            <TableCell align="left">
                                <Label variant="ghost" color="info">
                                    {sentenceCase(details.vehicleType)}
                                </Label>
                            </TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={verified ? 'success' : 'error'}>
                                    {sentenceCase(verified ? 'Compte Valide' : 'En Attente')}
                                </Label>
                            </TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={enabled ? 'success' : 'error'}>
                                    {sentenceCase(enabled ? 'Actif' : 'Inactif')}
                                </Label>
                            </TableCell>
                            <TableCell align="left">{new Date(createdAt).toDateString()}</TableCell>
                            {/* <TableCell align="right">
                                {enabled ? <ActionsMenu _id={_id} disable={disable} /> : <ActionsMenu _id={_id} enable={enable} />}
                            </TableCell> */}
                            <TableCell align="right">
                                {!enabled ?
                                    <ActionsMenu
                                        _id={_id}
                                        actions={[
                                            { label: 'Activer', onClick: enable, icon: 'mdi:user-check-outline' },
                                        ]}
                                    /> :
                                    <ActionsMenu
                                        _id={_id}
                                        actions={[
                                            { label: 'Désactiver', onClick: disable, icon: 'mdi:user-block-outline' },
                                        ]}
                                    />}
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
    ///    <para>User page components.</para>
    /// </devdoc>

    return (
        <Page title="Riders">
            <Container>
                <UserListToolbar />
                {riders && (
                    <MuiTable
                        data={riders}
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
                    />
                )}
            </Container>
        </Page>
    );
}
