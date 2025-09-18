
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
import ActionsMenu from '../../components/Tables/ActionsMenu';
import { UserListToolbar } from '../../components/user/user-list-toolbar';
import { useTheme } from '@mui/material/styles';
import { UserAPI } from '@/api/user';

const COLUMNS = [
    { id: 'name', label: 'Nom', alignRight: false, searchable: true },
    { id: 'phone', label: 'Tel', alignRight: false, searchable: false },
    { id: 'verified', label: 'Vérifié', alignRight: false, searchable: false },
    { id: 'enabled', label: 'Activé', alignRight: false, searchable: false },
    { id: 'createdAt', label: 'Créé Le', alignRight: false, searchable: false },
    { id: '', searchable: false },
];

export default function User() {
    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        get();
        return () => { };
    }, []);

    const get = () => {
        UserAPI.getClients()
            .then(({ data }) => {
                setUsers(data);
                // console.log("users", data);
            })
            .catch((e) => enqueueSnackbar('Chargement échoué.', { variant: 'error' }));
    };

    const enable = (id) => {
        var proceed = confirm("Êtes-vous sur de vouloir l'activer?");
        if (proceed) {
            UserAPI.enable(id)
                .then((res) => {
                    enqueueSnackbar('Utilisateur activé.', { variant: 'success' });
                    get();
                })
                .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }));
        }
    };

    const disable = (id) => {
        var proceed = confirm('Êtes-vous sur de vouloir le désactiver?');
        if (proceed) {
            UserAPI.disable(id)
                .then((res) => {
                    enqueueSnackbar('Utilisateur désactivé.', { variant: 'success' });
                    get();
                })
                .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }));
        }
    };




    const handleClick = (event, name) => {
        if (selected.includes(name)) setSelected(selected.filter((n) => n != name));
        else setSelected([...selected, name]);
    };

 


    const goToProfile = (user) => {
        navigate('/dashboard/account', {
            state: user,
        });
    };


    const TableBodyComponent = ({ data = [] }) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

        return (
            <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const { _id, name, isMale, tel, verified, role, enabled, createdAt } = row;
                    const isItemSelected = selected.indexOf(name) !== -1;

                    return (
                        <TableRow
                            hover
                            key={_id}
                            tabIndex={-1}
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
                                        <Chip onClick={() => goToProfile(row)} label={name} component="a" href="#basic-chip" clickable />
                                    </Typography>
                                </Stack>
                            </TableCell>
                            <TableCell align="left">0{tel}</TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={verified ? 'success' : 'error'}>
                                    {sentenceCase(verified ? "Compte Valide" : 'Compte Non Valide')}
                                </Label>
                            </TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={enabled ? 'success' : 'error'}>
                                    {sentenceCase(enabled ? 'Actif' : 'Inactif')}
                                </Label>
                            </TableCell>
                            <TableCell align="left">{new Date(createdAt).toDateString()}</TableCell>
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
                        <TableCell colSpan={7} />
                    </TableRow>
                )}
            </TableBody>
        );
    };

    return (
        <Page title="Users">
            <Container>
                <UserListToolbar />
                {users && (
                    <MuiTable
                        data={users}
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
                        searchFields={['name', 'phone']}
                    />
                )}
            </Container>
        </Page>
    );
}
