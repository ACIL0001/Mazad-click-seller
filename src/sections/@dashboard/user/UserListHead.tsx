import * as PropTypes from 'prop-types'
// material
import { Box, Checkbox, TableRow, TableCell, TableHead, TableSortLabel } from '@mui/material';

// ----------------------------------------------------------------------

const visuallyHidden = {
    border: 0,
    margin: -1,
    padding: 0,
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    clip: 'rect(0 0 0 0)',
};

UserListHead.propTypes = {
    order: PropTypes.oneOf(['asc', 'desc']),
    orderBy: PropTypes.string,
    rowCount: PropTypes.number,
    headLabel: PropTypes.array,
    numSelected: PropTypes.number,
    onRequestSort: PropTypes.func,
    onSelectAllClick: PropTypes.func,
};

export default function UserListHead({
    order,
    orderBy,
    rowCount,
    headLabel,
    numSelected,
    onRequestSort,
    onSelectAllClick,
}) {
    const createSortHandler = (property, sortable) => (event) => {
        if (sortable) {
            onRequestSort(event, property);
        }
    };

    console.log(headLabel);
    

    return (
        <TableHead>
            <TableRow>
                {headLabel.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.alignRight ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{
                            cursor: headCell.sortable ? 'pointer' : 'default',
                            userSelect: 'none'
                        }}
                    >
                        <TableSortLabel
                            hideSortIcon={!headCell.sortable}
                            active={orderBy === headCell.id && headCell.sortable}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id, headCell.sortable)}
                            sx={{
                                cursor: headCell.sortable ? 'pointer' : 'default',
                                '& .MuiTableSortLabel-icon': {
                                    opacity: headCell.sortable ? 0.5 : 0
                                }
                            }}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box sx={{ ...visuallyHidden }}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}
