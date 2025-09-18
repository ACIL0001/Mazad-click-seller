//------------------------------------------------------------------------------
// <copyright file="Users.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { useState, useEffect } from 'react';

// material
import { Container, Box, Tabs, Tab, Stack, Typography, Badge } from '@mui/material';
// components
import Page from '../../components/Page';
import { useTheme } from '@mui/material/styles';

import ActiveRestaurantsContent from './ActiveRestaurants';
import UnverifiedRestaurantsContent from './UnverifiedRestaurants';
import Breadcrumb from '@/components/Breadcrumbs';
import { UserAPI } from '@/api/user';
import { useSnackbar } from 'notistack';
import { RestaurantApi } from '@/api/restaurant';
import IRestaurant from '@/types/Restaurant';
import User from '@/types/User';
import useUsers from '@/hooks/useUsers';
import { RoleCode } from '@/types/Role';

/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>

export default function Restaurant() {
  const { enqueueSnackbar } = useSnackbar();
  
  const {users, updateAllUsers} = useUsers();

  const [value, setValue] = useState(0);
  const [data, setData] = useState<any>([]);

  const handleTabChange = (newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    setData([{ title: 'Restaurants Actifs' }, { title: 'Restaurants Non Vérifiés' }]);
    updateAllUsers();
    return () => {};
  }, []);

    const changeActivity = (_id:string, activity:boolean) => {
      var proceed = confirm("Êtes-vous sur de vouloir l'activer?");
      if (proceed) {
        RestaurantApi.activity({ _id, activity })
          .then((res) => {
            enqueueSnackbar(`Restaurant ${activity ? 'activé' : 'désactivé'}.`, { variant: 'success' });
            updateAllUsers();
          })
          .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }))
          .finally(() => updateAllUsers());
      }
    };

    const restaurants = users.filter((user) => user.role === RoleCode.RESTAURANT);
    const unverifiedRestaurants = restaurants.filter((restaurant) => !restaurant.verified);


  const renderTabContent = () => {
    switch (value) {
      case 0:
        return <ActiveRestaurantsContent restaurants={restaurants} changeActivity={changeActivity} />;
      case 1:
        return <UnverifiedRestaurantsContent restaurants={restaurants} changeActivity={changeActivity} />;
      default:
        return <ActiveRestaurantsContent restaurants={restaurants} changeActivity={changeActivity} />;
    }
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
                        <Typography variant="body2">Restaurants Actifs</Typography>
                    </Box>
                }
                onClick={() => handleTabChange(0)}
              />
              <Tab
              label={
                    <Box display="flex" alignItems="center" gap={1}>
                        <Badge
                            badgeContent={unverifiedRestaurants.length}
                            color="error"
                            max={99}
                            sx={{ marginRight: 1 }}
                        />
                        <Typography variant="body2">Restaurants Non Vérifiés</Typography>
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
