import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillAPI } from '@/api/bill';
import Bill, { IUnpayedStates } from '@/types/Bill';
import MuiTable, { applySortFilter, getComparator } from '../components/Tables/MuiTable';
import Restaurant from '@/types/Restaurant';
import {
  alpha,
  Box,
  Card,
  Container,
  Grid,
  IconButton,
  Paper,
  Stack,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Button,
  Theme,
} from '@mui/material';
import Label from '@/components/Label';
import Page from '@/components/Page';
import { RemoveRedEye } from '@mui/icons-material';
import BillDetailsModal from '@/shared/modal/BillDetailsModal';
import { title } from 'process';
import Iconify from '@/components/Iconify';
import { useTheme } from '@emotion/react';
import CardLabelValue from '@/components/account/CardLabelValue';

const COLUMNS = [
  // { id: '_id', label: 'ID', alignRight: false },
  { id: 'bill_id', label: 'ID', searchable: true },
  { id: 'orderCount', label: 'Commande', searchable: false },
  { id: 'totalFee', label: 'Total', searchable: false },
  { id: 'startDate', label: 'De', searchable: false },
  { id: 'paymentDate', label: 'paye le', searchable: false },
];

export default function RestaurantsBills({ restaurant_ID }: { restaurant_ID: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();

  const [unpayedFees, setUnpayedFee] = useState<IUnpayedStates>();

  const [bills, setBills] = useState([]);
  const [details, setDetails] = useState<Bill | null>(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchBy, setSearchBy] = useState('bill_id');
  const [statusFilter, setStatusFilter] = useState('');
  const [billDetails, setBillDetails] = useState<Bill>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = (bill: Bill) => {
    setBillDetails(bill);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const CashOut = async () => {
    if (!confirm(`Are you sure to cash out ?`)) return;

    try {
      const { data: payedBill } = await BillAPI.cashOut(restaurant_ID);
      console.log({ payedBill });

      handleModalOpen(payedBill);
      retrieveBills();
      enqueueSnackbar('Restaurant Cashed Out successfully!', { variant: 'success' });
    } catch (error) {
      // enqueueSnackbar(error.response.data.message || "un problème est survenu", {variant: "error"})
    }
  };

  const retrieveBills = () => {
    BillAPI.getBills(restaurant_ID).then(({ data }) => {
      setBills(data);
    });

    BillAPI.getUnpayedFee(restaurant_ID).then(({ data }) => {
      console.log('unpayed fee', data);

      setUnpayedFee(data);
    });
  };
  useEffect(() => {
    retrieveBills();
  }, [restaurant_ID]);

  const TableBodyComponent = ({ data = [] }) => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - bills.length) : 0;

    return (
      <TableBody>
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((bill: Bill, index: number) => {
          return (
            <TableRow hover key={index} tabIndex={-1}>
              <TableCell align="left">
                <Label variant="ghost" color="success">
                  {index + 1}
                </Label>
              </TableCell>
              <TableCell align="left">{bill.bill_id.toString().padStart(5, '0')}</TableCell>
              <TableCell align="left">{bill.orderCount}</TableCell>
              <TableCell align="left">{bill.totalFee.toFixed(2)} DZD</TableCell>
              <TableCell align="left">
                {new Date(bill.startDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell align="left">
                {new Date(bill.paymentDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell align="left">
                <IconButton
                  aria-label="info"
                  size="medium"
                  onClick={() => {
                    handleModalOpen(bill);
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
            <TableCell colSpan={6} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <Page title="Facteur">
      {billDetails && (
        <BillDetailsModal bill={billDetails} isModalOpen={isModalOpen} handleModalClose={handleModalClose} />
      )}
      <Container>
        <Stack direction="column" justifyContent="space-between" mb={3} mt={3} divider>
          <Typography variant="h5" gutterBottom>
            Non Paye
          </Typography>
        </Stack>

        {unpayedFees && (
          <Container sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <CardLabelValue label="De" value={new Date(unpayedFees.startDate).toUTCString().substring(0, 16)} />
            <CardLabelValue label="Order Count" value={unpayedFees.orderCount.toFixed(2) + 'DZD'} />
            <CardLabelValue label="Total Vente" value={unpayedFees.totalSaleAmount.toFixed(2) + 'DZD'} />
            <CardLabelValue label="Frais Client" value={unpayedFees.clientFee.toFixed(2) + 'DZD'} />
            <CardLabelValue label="Total Vente" value={unpayedFees.restaurantFee.toFixed(2) + 'DZD'} />
            <CardLabelValue
              label="Total a payer"
              value={(unpayedFees.totalFee?.toFixed(2) || 'a') + 'DZD'}
              sx={{
                bgcolor: (theme: Theme) => theme.palette.primary.main,
                color: (theme: Theme) => theme.palette.primary.contrastText,
              }}
            />
          </Container>
        )}
        <Button
          sx={{ mt: 2, py: 2 }}
          fullWidth
          variant="contained"
          onClick={CashOut}
          disabled={unpayedFees?.totalFee == 0}
        >
          <Typography variant="h6">Cash Out</Typography>
        </Button>

        <Stack direction="column" justifyContent="space-between" mb={3} mt={3} divider>
          <Typography variant="h5" gutterBottom>
            Facteur
          </Typography>
        </Stack>

        {bills && (
          <MuiTable
            data={bills}
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
            searchFields={['bill_id']}
          />
        )}
      </Container>
    </Page>
  );
}
