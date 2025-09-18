import {
    Box,
    Button,
    Card,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantApi } from '@/api/restaurant';
import { UserAPI } from '@/api/user';
import Breadcrumb from '@/components/Breadcrumbs';
import Label from '@/components/Label';
import Page from '@/components/Page';
import MuiTable, { applySortFilter, getComparator } from '@/components/Tables/MuiTable';
import { RoleCode } from '@/types/Role';
import User from '@/types/User';
import useUsers from '@/hooks/useUsers';

const COLUMNS = [
    { id: 'details.name', label: 'Restaurant', alignRight: false, searchable: true },
    { id: 'name', label: 'Nom', alignRight: false, searchable: true },
    // { id: 'isMale', label: 'Male', alignRight: false },
    { id: 'mobile', label: 'Tel', alignRight: false, searchable: false },
    // { id: 'rating', label: 'Rating', alignRight: false },
    { id: 'details.address', label: 'Addresse', alignRight: false, searchable: true },
    { id: 'details.opensAt', label: 'Ouvre à', alignRight: false, searchable: false },
    { id: 'details.closeAt', label: 'Ferme à', alignRight: false, searchable: false },
    // { id: 'verified', label: 'Vérifié', alignRight: false },
    // { id: 'enabled', label: 'Activé', alignRight: false },
    { id: 'verified', label: 'Vérifié', alignRight: false, searchable: false },
    { id: 'createdAt', label: 'Créé Le', alignRight: false, searchable: false },
    { id: '', searchable: false },
];

interface ActiveRestaurantsContentProps {
    restaurants: User[];
    changeActivity: (id: string, active: boolean) => void;
}

export default function UnverifiedRestaurantsContent({ restaurants, changeActivity }: ActiveRestaurantsContentProps) {

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const {updateAllUsers} = useUsers();

    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);

    const unverifiedRestaurants = restaurants.filter((restaurant) => !restaurant.verified);
    const activerestaurants = restaurants.filter((restaurant) => restaurant.verified);

    useEffect(() => {
        updateAllUsers();
        return () => { };
    }, []);

    const goToProfile = (user: User) => {
        navigate('/dashboard/account', {
            state: user,
        });
    };

    const filteredUsers = applySortFilter(
        unverifiedRestaurants,
        getComparator(order, orderBy),
        filterName
    );

    const handleOpenDialog = (user: User) => {
        setSelectedUser(user);
    };

    const handleVerify = (user: User) => {
        // console.log(user);
        RestaurantApi.verify(user._id)
            .then(() => {
                enqueueSnackbar('Restaurant verifier', { variant: 'success' });
                updateAllUsers();
                handleCloseDialog();
            })
            .catch((err) => {
                console.log(err);
                enqueueSnackbar("Couldn't verify Restaurant", { variant: 'error' });
            });
    };

    const handleCloseDialog = () => {
        setSelectedUser(null);
    };

    const verify = () => {
        return (
            <Dialog open={selectedUser !== null} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>Détails de l'utilisateur</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <>
                            <Typography variant="body1">
                                <span style={{ fontWeight: 'bold' }}>Nom: </span>
                                {selectedUser.name}
                            </Typography>
                            <Typography variant="body1">
                                <span style={{ fontWeight: 'bold' }}>Email: </span>
                                {selectedUser.email}
                            </Typography>
                            <Typography variant="body1">
                                <span style={{ fontWeight: 'bold' }}>Téléphone: </span>
                                {selectedUser.tel}
                            </Typography>
                            <Typography variant="body1">
                                <span style={{ fontWeight: 'bold' }}>Nom de restaurant: </span>
                                {selectedUser.details.name}
                            </Typography>
                            <Typography variant="body1">
                                <span style={{ fontWeight: 'bold' }}>Addresse: </span>
                                {selectedUser.details.address}
                            </Typography>
                            <Typography variant="body1">
                                <span style={{ fontWeight: 'bold' }}>Ouvert à: </span>
                                {selectedUser.details.opensAt}:00 h
                            </Typography>
                            <Typography variant="body1">
                                <span style={{ fontWeight: 'bold' }}>Fermé à: </span>
                                {selectedUser.details.closeAt}:00 h
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-around', px: 1 }}>
                    <Button
                        color="primary"
                        variant="contained"
                        sx={{
                            width: '40%',
                            left: 10,
                        }}
                        onClick={() => handleVerify(selectedUser)}
                    >
                        Vérifier ce compte
                    </Button>
                    <Button
                        color="secondary"
                        variant="outlined"
                        sx={{ width: '40%', left: 10, color: '#222' }}
                        onClick={handleCloseDialog}
                    >
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };


    const TableBodyComponent = ({ data = [] }) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;
        
      return (
            <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const { _id, name, details, tel, verified, role, enabled, createdAt } = row;
                    console.log('user', row);

                    const isItemSelected = selected.indexOf(name) !== -1;

                    return (
                        <TableRow
                            hover
                            key={_id}
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
                                        <Chip
                                            onClick={() => goToProfile(row)}
                                            label={details?.name}
                                            component="a"
                                            href="#basic-chip"
                                            clickable
                                        />
                                    </Typography>
                                </Stack>
                            </TableCell>
                            <TableCell align="left">{name}</TableCell>
                            <TableCell align="left">{details?.mobile}</TableCell>
                            <TableCell align="left">{details?.address}</TableCell>
                            <TableCell align="left">{details?.opensAt} h<span style={{ marginRight: "35px" }}></span></TableCell>
                            <TableCell align="left">{details?.closeAt} h<span style={{ marginRight: "35px" }}></span></TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={verified ? 'success' : 'error'}>
                                    {verified ? 'Compte Valide' : 'En Attente'}
                                </Label>
                            </TableCell>
                         
                            <TableCell align="left">{new Date(createdAt).toDateString()}</TableCell>
                            <TableCell align="left">
                                <Button sx={{ p: 1.8 }} onClick={() => handleOpenDialog(row)}>
                                    Verifié
                                </Button>
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
        <>
            <Card sx={{ width: '95%', position: 'relative', mb: 5, mx: 3 }}>
                <Box
                    sx={{ display: 'flex', justifyContent: 'center', py: 1.5, px: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Typography fontWeight="bold">Informations sur le statut des restaurants</Typography>
                </Box>
                <Box sx={{ py: 3, px: 3 }}>
                    <Typography variant="body1">
                        <span style={{ fontWeight: '600' }}>Nombre de restaurants non vérifiés:</span>{' '}
                        {unverifiedRestaurants.filter((restaurant) => !restaurant.verified).length}
                    </Typography>
                    <Typography variant="body1">
                        <span style={{ fontWeight: '600' }}>Nombre de restaurants vérifiés:</span>{' '}
                        {activerestaurants.filter((user) => user.role === RoleCode.RESTAURANT).length}
                    </Typography>
                    <Typography variant="body1">
                        <span style={{ fontWeight: '600' }}>Nombre de restaurants</span>{' '}
                        {restaurants.filter((user) => user.role === RoleCode.RESTAURANT).length}
                    </Typography>
                </Box>
            </Card>
            {verify()}
            <Page title="Users">
                <Container>
                    {restaurants && (
                        <MuiTable
                            data={unverifiedRestaurants}
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
                            searchFields={['details.name', 'name', 'phone', 'details.address']}
                        />
                    )}
                </Container>
            </Page>
        </>
    );
}
