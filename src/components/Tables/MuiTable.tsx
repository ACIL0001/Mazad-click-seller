import {
  Card,
  Table,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  TextField,
  Box,
  InputAdornment,
  IconButton,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { alpha, useTheme } from '@mui/material/styles';
import { filter } from 'lodash';
import { useState } from 'react';

// components
import Scrollbar from '../Scrollbar';
import SearchNotFound from '../SearchNotFound';
import { UserListHead } from '../../sections/@dashboard/user';

export function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function applySortFilter(array: any[], comparator: (a: any, b: any) => number, query: string, searchFields: string[] = []) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  const sortedArray = stabilizedThis.map((el) => el[0]);

  if (query && searchFields.length > 0) {
    return filter(sortedArray, (obj) => {
      return searchFields.some(field => {
        const value = field.split('.').reduce((acc, part) => acc && acc[part], obj);
        if (value == null) return false;
        
        const stringValue = String(value).toLowerCase();
        const searchQuery = query.toLowerCase().trim();
        
        return stringValue.includes(searchQuery);
      });
    });
  }

  return sortedArray;
}

export default function MuiTable({
  data,
  columns,
  TableBody,
  page,
  setPage,
  order,
  setOrder,
  orderBy,
  setOrderBy,
  filterName,
  setFilterName,
  rowsPerPage,
  setRowsPerPage,
  searchFields = [],
  selected,
  setSelected
}) {
  const theme = useTheme();

  // Get searchable fields from columns
  const allSearchFields = columns
    .filter(col => col.searchable !== false)
    .map(col => col.id);

  const defaultSearchField = allSearchFields[0] || '';
  const [searchField, setSearchField] = useState(defaultSearchField);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
    setPage(0); // Reset to first page when filtering
  };

  const filteredData = applySortFilter(
    data, 
    getComparator(order, orderBy), 
    filterName, 
    searchFields.length > 0 ? searchFields : [searchField]
  );

  const isDataNotFound = filteredData.length === 0;

  return (
    <Card
      sx={{
        boxShadow: '0 4px 24px 0 rgba(34,41,47,.1)',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 6px 30px 0 rgba(34,41,47,.2)',
        }
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          gap: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          backgroundColor: theme.palette.mode === 'light' 
            ? alpha(theme.palette.primary.main, 0.04)
            : alpha(theme.palette.primary.main, 0.15),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 2, sm: 2 }} 
          alignItems="center" 
          flex={1}
          sx={{ width: '100%' }}
        >
          <TextField
            fullWidth
            value={filterName}
            onChange={handleFilterByName}
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { sm: 280, md: 320 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                transition: theme.transitions.create(['box-shadow', 'width']),
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                }
              }
            }}
          />
          <FormControl 
            sx={{ 
              minWidth: { xs: '100%', sm: 180, md: 200 },
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
              }
            }}
          >
            <InputLabel>Search in</InputLabel>
            <Select
              value={searchField}
              onChange={(e) => {
                setSearchField(e.target.value);
                setPage(0);
              }}
              label="Search in"
              sx={{
                height: '40px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            >
              {allSearchFields.map((field) => {
                const column = columns.find(col => col.id === field);
                return (
                  <MenuItem key={field} value={field}>
                    {column?.label || field.split('.')[0]}
                  </MenuItem>
                );
              })}
              
            </Select>
          </FormControl>
        </Stack>
      </Box> 

     

      <Scrollbar>
        <TableContainer sx={{ 
          minWidth: { xs: 600, sm: 800 },
          '& .MuiTableCell-head': {
            bgcolor: theme.palette.mode === 'light' 
              ? alpha(theme.palette.primary.main, 0.02)
              : alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.text.primary,
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            lineHeight: '1.5rem',
            padding: { xs: '8px 4px', sm: '12px 8px', md: '16px' },
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiTableCell-body': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '8px 4px', sm: '12px 8px', md: '16px' },
            color: theme.palette.text.secondary,
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiTableRow-root': {
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            },
            '&:last-child td, &:last-child th': {
              borderBottom: 0,
            },
          },
          '& .MuiTable-root': {
            borderCollapse: 'separate',
            borderSpacing: 0,
          }
        }}>
          
          <Table>
            <UserListHead
              order={order}
              orderBy={orderBy}
              headLabel={columns}
              rowCount={filteredData.length}
              onRequestSort={handleRequestSort}
            />
            {TableBody && <TableBody data={filteredData} />}

            {isDataNotFound && (
              <TableRow>
                <TableCell 
                  align="center" 
                  colSpan={columns.length} 
                  sx={{ py: 3 }}
                >
                  <SearchNotFound searchQuery={filterName} />
                </TableCell>
              </TableRow>
            )}
          </Table>
        </TableContainer>
      </Scrollbar>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '& .MuiTablePagination-select': {
            backgroundColor: theme.palette.background.paper,
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            color: theme.palette.text.secondary,
          }
        }}
      />
    </Card>
  );
}