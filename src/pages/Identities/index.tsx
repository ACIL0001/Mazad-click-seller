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
    Icon,
    Box,
    Tabs,
    Tab,
    Badge
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
import AcceptedRiders from './Accepted';
import PendingRiders from './Pending';
import { IdentityStatus } from '@/types/Identity';

const COLUMNS = [
    { id: 'user', label: 'Utilisateur', alignRight: false },
    { id: 'documentType', label: 'Documment', alignRight: false },
    { id: 'vehicleType', label: 'Vehicule', alignRight: false },
    { id: 'status', label: 'Statut', alignRight: false },
    { id: 'createdAt', label: 'Crée le', alignRight: false },
    { id: 'updatedAt', label: 'Modifié le', alignRight: false },
    { id: 'verify', label: 'Vérifier', alignRight: false },
    { id: '' },
];


const STATUS = {
    PENDING: "PENDING",
    FAILED: "error",
    ACCEPTED: "ACCEPTED"
}


const DOCUMENT_TYPE = {
    PASSPORT: "Passport",
    DRIVING_LICENCE: "Permis de conduire",
    NATIONAL_CARD: "Carte Nationale"
}

/// <devdoc>
///    <para>  identity Page for identities management. </para>
/// </devdoc>

export default function Identity() {
    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const {identities, updateIdentity}= useIdentity();
    const [value, setValue] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchBy, setSearchBy] = useState('name');
    const [open, setOpen] = useState(undefined);

    const handleTabChange = (newValue: number) => {
        setValue(newValue);
      };

    useEffect(() => {
        updateIdentity();
        return () => { };
    }, []);


    const acceptedRiders = identities.filter((identity) => identity.status === IdentityStatus.ACCEPTED);
    const pendingAndFaildRiders = identities.filter((identity) => 
    identity.status === IdentityStatus.PENDING || identity.status === IdentityStatus.FAILED);

    const renderTabContent = () => {
        switch (value) {
          case 0:
            return <AcceptedRiders 
                acceptedRiders={acceptedRiders}
            />;
          case 1:
            return <PendingRiders 
                pendingRiders={pendingAndFaildRiders} 
            />;
          default:
            return <AcceptedRiders 
                acceptedRiders={acceptedRiders}
            />;
        }
      };
      return (
        <Page title="Identities">
        <Container>
            <Stack direction={'row'} justifyContent={'space-between'} mb={3}>
            <Typography variant="h4" gutterBottom>
                Identities
            </Typography>
            </Stack>
            <Stack mb={3}>
            <Breadcrumb />
            </Stack>
            <Box mb={3} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} aria-label="basic tabs example">
                <Tab
                label={
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">Livreurs acceptés</Typography>
                        </Box>
                    }
                    onClick={() => handleTabChange(0)}
                />
                <Tab
                label={
                        <Box display="flex" alignItems="center" gap={1}>
                            <Badge
                                badgeContent={pendingAndFaildRiders.length}
                                color="error"
                                max={99}
                                sx={{ marginRight: 1 }}
                            />
                            <Typography variant="body2">Livreurs en attente</Typography>
                        </Box>
                    }
                    onClick={() => handleTabChange(1)}
                />
            </Tabs>
            </Box>
            {renderTabContent()}
        </Container>
        </Page>
    );
}
