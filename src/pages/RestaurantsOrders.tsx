//------------------------------------------------------------------------------
// <copyright file="deliveries.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material
import {
  Stack,
  IconButton,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  Select,
  MenuItem,
  Button,
  ButtonGroup,
  Box,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

// components
import Page from '../components/Page';
import { useSnackbar } from 'notistack';
import MuiTable, { applySortFilter, getComparator } from '../components/Tables/MuiTable';
import Label from '../components/Label';
import { useTheme } from '@mui/material/styles';
import { OrderAPI } from '@/api/order';
import IOrder, { OrderStatus } from '@/types/Order';
import { CategoryAPI } from '@/api/category';
import { RemoveRedEye } from '@mui/icons-material';
import { DeliveryAPI } from '@/api/delivery';
import DeliveryDetails from '@/shared/modal/DeliveryDetails';
import Restaurant from '@/types/Restaurant';

const COLUMNS = [
  { id: '_id', label: 'ID', alignRight: false, searchable: true },
  // { id: 'order.orderId', label: 'ID', alignRight: false },
  // { id: 'end_address', label: 'à', alignRight: false },
  // { id: 'price', label: 'Prix', alignRight: false },
  // { id: 'restaurant', label: 'Restaurant', alignRight: false },
  { id: 'user', label: 'Client', alignRight: false, searchable: false },
  { id: 'totalAmount', label: 'Montant Total', alignRight: false, searchable: false },
  // { id: 'rider', label: 'Livreur', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false, searchable: false },
  { id: 'createdAt', label: 'le', alignRight: false, searchable: false },
  { id: 'more', label: 'Détails', alignRight: false, searchable: false },
];

/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

export default function Deliveries({ restaurant }: { restaurant: Restaurant }) {
  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [details, setDetails] = useState<IOrder | null>(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchBy, setSearchBy] = useState('end_address');
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveries, setDeliveries] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = (order) => {
    setOrderDetails(order);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const updateOrders = (statusFilter: any) => {
    setStatusFilter(statusFilter);
    console.log('statusFilter', statusFilter);

    OrderAPI.findByRestaurant(restaurant._id, statusFilter)
      .then(({ data }) => setOrders(data))
      .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }));
  };

  // const findDelivery = (id: string) => {
  //     handleModalOpen(deliveries)
  //     DeliveryAPI.findByOrder(id)
  //         .then(({ data }) => {
  //             setDeliveries(data)
  //             console.log(data)
  //         })
  // }

  const findOrder = (id: string) => {
    const order = orders.find((order) => order._id == id);
    if (order) {
      setDetails(order);
      handleModalOpen(order);
    }
    // console.log("ord", order);
  };


  useEffect(() => {
    updateOrders(statusFilter);
  }, [statusFilter]);

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

  const onMore = (order: any) => {
    navigate('/dashboard/order', {
      state: order,
    });
  };

  const TableBodyComponent = ({data = []}) => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orders.length) : 0;

    return (
      <TableBody>
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order: IOrder, index: number) => {
          const isItemSelected = selected.indexOf(order._id) !== -1;

          return (
            <TableRow
              hover
              key={order._id}
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
              <TableCell align="left"> {order.orderId}</TableCell>
              {/* <TableCell align="left">{end_address}</TableCell> */}
              {/* <TableCell align="left">{price} DA</TableCell> */}
              {/* <TableCell align="left">{restaurant.name} DA</TableCell> */}
              <TableCell align="left">{order.user.name}</TableCell>
              <TableCell align="left">{order.totalAmount} DA</TableCell>
              {/* <TableCell align="left">{order.rider?.name || '-'}</TableCell> */}
              <TableCell align="left">
                <Label variant="ghost" color="info">
                  {sentenceCase(order.status)}
                </Label>
              </TableCell>
              <TableCell align="left">{new Date(order.createdAt).toDateString()}</TableCell>
              <TableCell align="left">
                <IconButton
                  aria-label="delete"
                  size="medium"
                  onClick={() => {
                    findOrder(order._id);
                  }}
                >
                  <RemoveRedEye fontSize="inherit" />
                </IconButton>
              </TableCell>
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
    <Page title="Restaurant">
      <Container>
        <DeliveryDetails order={details} isModalOpen={isModalOpen} handleModalClose={handleModalClose} />

        <Stack direction="column" justifyContent="space-between" mb={3} mt={3}>
          <Typography variant="h5" gutterBottom>
            Commandes
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} mb={2}>
          <Select
            value={statusFilter}
            onChange={(e) => updateOrders(e.target.value)}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
          >
            <MenuItem value="">Toutes les statuts</MenuItem>
            {Object.values(OrderStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        {orders && (
          <MuiTable
            data={orders}
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
            searchFields={['_id']}
          />
        )}
      </Container>
    </Page>
  );
}
