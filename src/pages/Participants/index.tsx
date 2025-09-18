import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
} from '@mui/material';
// components
import Page from '../../components/Page';
import { useSnackbar } from 'notistack';
import MuiTable from '../../components/Tables/MuiTable';
import { useTheme } from '@mui/material/styles';
import Breadcrumb from '@/components/Breadcrumbs';
import { ParticipantsAPI } from '@/api/participants';
import { Participant } from '@/types/Participant';

// ----------------------------------------------------------------------

const COLUMNS = [
  { id: 'buyer', label: 'Utilisateur', alignRight: false, searchable: true, sortable: true },
  { id: 'tel', label: 'Téléphone', alignRight: false, searchable: true, sortable: true },
  { id: 'bidTitle', label: 'Enchère', alignRight: false, searchable: true, sortable: true },
  { id: 'createdAt', label: 'Date', alignRight: false, searchable: false, sortable: true },
  { id: 'actions', label: '', alignRight: true, searchable: false }
];

// ----------------------------------------------------------------------

export default function Participants() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    get();
  }, []);

  const get = () => {
    setLoading(true);
    ParticipantsAPI.getParticipants()
        .then((response) => {
            if (response && Array.isArray(response)) {
                setParticipants(response);
                console.log("participants", response);
            } else if (response && response.data && Array.isArray(response.data)) {
                setParticipants(response.data);
                console.log("participants", response.data);
            } else {
                console.error("Unexpected response format:", response);
                enqueueSnackbar('Format de réponse inattendu.', { variant: 'error' });
            }
        })
        .catch((e) => {
            console.error("Error fetching participants:", e);
            enqueueSnackbar('Chargement échoué.', { variant: 'error' });
        })
        .finally(() => setLoading(false));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const TableBodyComponent = ({ data = [] }) => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    return (
      <TableBody>
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
          const { _id, buyer, createdAt, bid } = row;

          return (
            <TableRow
              hover
              key={_id}
              tabIndex={-1}
            >
              <TableCell component="th" scope="row" padding="none" sx={{ pl: 2 }}>
                <Typography variant="subtitle2" noWrap>
                  {buyer?.firstName} {buyer?.lastName}
                </Typography>
              </TableCell>
              <TableCell align="left">{buyer?.phone || 'N/A'}</TableCell>
              <TableCell align="left">{bid?.title || 'N/A'}</TableCell>
              <TableCell align="left">{formatDate(createdAt)}</TableCell>
              <TableCell align="right">
                <Button
                  component={RouterLink}
                  to={`/dashboard/auctions/${bid?._id}`}
                  size="small"
                  variant="outlined"
                >
                  Voir l'enchère
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
        {emptyRows > 0 && (
          <TableRow style={{ height: 53 * emptyRows }}>
            <TableCell colSpan={4} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <Page title="Participants">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Participants aux Enchères
          </Typography>
        </Stack>

        <Stack mb={3}>
          <Breadcrumb />
        </Stack>

        {participants && (
          <MuiTable
            data={participants}
            columns={COLUMNS}
            page={page}
            setPage={setPage}
            order={order}
            setOrder={setOrder}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            filterName={filterName}
            setFilterName={setFilterName}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            TableBody={TableBodyComponent}
            searchFields={['buyer.firstName', 'buyer.lastName', 'buyer.phone', 'bid.title']}
            selected={selected}
            setSelected={setSelected}
          />
        )}
      </Container>
    </Page>
  );
}