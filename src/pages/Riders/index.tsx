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
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Badge,
} from '@mui/material';
// components
import Page from '../../components/Page';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import Breadcrumb from '@/components/Breadcrumbs';
import useUsers from '@/hooks/useUsers';
import { RoleCode } from '@/types/Role';
import RidersVerified from './RidersVerified';
import RidersUnverified from './RidersUnverified';
import { UserAPI } from '@/api/user';

const COLUMNS = [
    { id: 'name', label: 'Nom', alignRight: false },
    // { id: 'isMale', label: 'Male', alignRight: false },
    { id: 'phone', label: 'Tel', alignRight: false },
    { id: 'details.vehicleType', label: 'Type de véhicule', alignRight: false },
    // { id: 'isActive', label: 'En ligne', alignRight: false },
    { id: 'verified', label: 'Vérifié', alignRight: false },
    { id: 'enabled', label: 'Activé', alignRight: false },
    { id: 'createdAt', label: 'Créé Le', alignRight: false },
    { id: '' },
];

/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>

export default function Riders() {
    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const [value, setValue] = useState(0);
    const [riders, setRiders] = useState([]);

    useEffect(() => {
        get();
        return () => {};
      }, []);

    const get = () => {
        UserAPI.getRiders()
            .then(({ data }) => {
                setRiders(data);
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

    const activeRiders = riders.filter((rider) => rider.verified);
    const unverifiedRiders = riders.filter((rider) => !rider.verified);
    
    const renderTabContent = () => {
        switch (value) {
          case 0:
            return <RidersVerified riders={activeRiders} enable={enable} disable={disable} />;
          case 1:
            return <RidersUnverified riders={unverifiedRiders} enable={enable} disable={disable} />;
          default:
            return <RidersVerified riders={activeRiders} enable={enable} disable={disable} />;
        }
    };

    const handleTabChange = (newValue: number) => {
        setValue(newValue);
    };

    return (
        <Page title="Restaurants">
            <Container>
                <Stack direction={'row'} justifyContent={'space-between'} mb={3}>
                <Typography variant="h4" gutterBottom>
                    Restaurants
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
                                <Typography variant="body2">Riders Actifs</Typography>
                            </Box>
                        }
                        onClick={() => handleTabChange(0)}
                    />
                    <Tab
                    label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <Badge
                                    badgeContent={unverifiedRiders.length}
                                    color="error"
                                    max={99}
                                    sx={{ marginRight: 1 }}
                                />
                                <Typography variant="body2">Riders Non Vérifiés</Typography>
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
