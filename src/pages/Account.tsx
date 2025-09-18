import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Card, Container, Grid, Tab, Tabs, Typography } from '@mui/material';
import { AccountProfile } from '../components/account/account-profile';
import { Device } from '../components/account/device';
import { AccountProfileDetails } from '../components/account/account-profile-details';
import { useState, useEffect } from 'react';
import Order from '@/types/Order';
import { StatsAPI } from '@/api/stats';
import { useSnackbar } from 'notistack';
import { BillAPI } from '@/api/bill';
import Products from './RestaurantsProducts';
import Deliveries from './RiderDeliveries';
import Orders from './RestaurantsOrders';
import app from '@/config';
import Page from '@/components/Page';
import RestaurantsBills from './RestaurantsBills';
import Restaurant from '@/types/Restaurant';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface IStatsInfo {
  title?: string;
  startDate?: string;
  endDate?: string;
  orderCount?: number;
  totalSaleAmount?: number;
  restaurantFee?: number;
  clientFee?: number;
  totalFeeAmount?: number;
  orders?: Order[];
}

export default function Account() {
  const location = useLocation();
  const [user, setUser] = useState<any>(location.state);
  const [unpayedFee, setUnpayedFee] = useState<IStatsInfo>();
  const [value, setValue] = useState(0);
  const [data, setData] = useState<{ title: String }[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) navigate('/404');

    if (user!.role == 'Restaurant') retrieveUnpayedFees();
    setData([
      { title: t('navigation.products') }, 
      { title: t('navigation.orders') }, 
      { title: t('navigation.bills') }
    ]);
    return () => {};
  }, [user, t]);

  const retrieveUnpayedFees = async () => {
    try {
      const { data } = await BillAPI.getUnpayedFee(user.details._id);

      setUnpayedFee(data);
    } catch (error) {
      enqueueSnackbar('error: couldnt retrieve unpayed fees', { variant: 'error' });
    }
  };

  const handleTabChange = (newValue: number) => {
    setValue(newValue);
  };

  const renderTabContent = () => {
    switch (value) {
      case 0:
        return <Products restaurant={user.details} />;
      case 1:
        return <Orders restaurant={user.details} />;
      case 2:
        return <RestaurantsBills restaurant_ID={user.details._id} />;
      default:
        return <Products restaurant={user.details} />;
    }
  };

  return (
    user && (
      <>
        <Page title={t('pages.account.title')}>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              py: 3,
            }}
          >
            <Container maxWidth="lg">
              <Typography variant="h4" sx={{ mb: 5 }}>
                {t('pages.account.title')}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <AccountProfileDetails user={user} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <AccountProfile />
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <Tabs
                      allowScrollButtonsMobile
                      variant="scrollable"
                      scrollButtons="auto"
                      value={value}
                      onChange={(e, newValue) => handleTabChange(newValue)}
                      sx={{ px: 2, bgcolor: 'background.neutral' }}
                    >
                      {data.map((item, index) => (
                        <Tab disableRipple key={index} label={item.title} />
                      ))}
                    </Tabs>

                    <Box sx={{ mb: 3 }} />

                    {renderTabContent()}
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Page>
      </>
    )
  );
}
