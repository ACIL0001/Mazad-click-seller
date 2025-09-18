import { Chip, Stack, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import MuiTable, { applySortFilter, getComparator } from '../../components/Tables/MuiTable';
import { sentenceCase } from 'change-case';
import ActionsMenu from '../../components/Tables/ActionsMenu';
import { RestaurantApi } from '@/api/restaurant';
import Label from '../../components/Label';
import { useSnackbar } from 'notistack';
import { RoleCode } from '@/types/Role';
import { UserAPI } from '@/api/user';
import { Navigate, useNavigate } from 'react-router-dom';
import User from '@/types/User';
import Restaurant from '@/types/Restaurant';

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
  { id: 'enabled', label: 'Activé', alignRight: false, searchable: false },
  { id: 'createdAt', label: 'Créé Le', alignRight: false, searchable: false },
  { id: '', searchable: false },
];

interface ActiveRestaurantsContentProps {
  restaurants: User[];
  changeActivity: (id: string, active: boolean) => void;
}

export default function ActiveRestaurantsContent({ restaurants, changeActivity }: ActiveRestaurantsContentProps) {
  // const theme = useTheme();
  const navigate = useNavigate();
  // const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const activerestaurants = restaurants.filter((restaurant) => restaurant.verified);

  useEffect(() => {
    return () => {};
  }, []);

  const TableBodyComponent = ({ data = [] }) => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    const filteredUsers = applySortFilter(
      activerestaurants.filter((user: User) => user.role === RoleCode.RESTAURANT),
      getComparator(order, orderBy),
      filterName
    );

    const goToProfile = (user: User) => {
      navigate('/dashboard/account', {
        state: user,
      });
    };

    return (
      <TableBody>
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
          const { _id, name, isMale, phone, verified, enabled, createdAt, details } = row;
          const isItemSelected = selected.indexOf(name) !== -1;
          console.log({ row });
          return (
            <TableRow hover key={_id} tabIndex={-1} aria-checked={isItemSelected}>
              <TableCell align="left">
                <Label variant="ghost" color="info">
                  {index + 1}
                </Label>
              </TableCell>
              <TableCell component="th" scope="row" padding="none">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="subtitle2" noWrap>
                    <Chip
                      label={details?.name}
                      onClick={() => goToProfile(row)}
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
              <TableCell align="left">{details?.opensAt}</TableCell>
              <TableCell align="left">{details?.closeAt}</TableCell>
              <TableCell align="left">
                <Label variant="ghost" color={enabled ? 'success' : 'error'}>
                  {enabled ? 'Actif' : 'Inactif'}
                </Label>
              </TableCell>
              <TableCell align="left">{new Date(createdAt).toDateString()}</TableCell>
              <TableCell align="right">
                {enabled ? (
                  <ActionsMenu
                    _id={_id}
                    actions={[
                      {
                        label: 'Désactiver',
                        onClick: () => changeActivity(_id, false),
                        icon: 'mdi:user-block-outline',
                      },
                    ]}
                  />
                ) : (
                  <ActionsMenu
                    _id={_id}
                    actions={[
                      { label: 'Activer', onClick: () => changeActivity(_id, true), icon: 'mdi:user-check-outline' },
                    ]}
                  />
                )}
              </TableCell>
            </TableRow>
          );
        })}
        {emptyRows > 0 && (
          <TableRow style={{ height: 53 * emptyRows }}>
            <TableCell colSpan={10} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <div>
      {/* <Stack direction={'row'} justifyContent={'space-between'} mb={3}>
                <Typography variant="h4" gutterBottom>
                    Restaurants
                </Typography>
            </Stack>
            <Stack mb={3}>
                <Breadcrumb />
            </Stack> */}
      {activerestaurants && (
        <MuiTable
          data={activerestaurants}
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
    </div>
  );
}
