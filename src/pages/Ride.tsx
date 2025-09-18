import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { RideDetails } from '@/components/ride/ride-details';
import { RidePassengers } from '@/components/ride/ride-passengers';
import { RideCreator } from '@/components/ride/ride-creator';



export default function Ride() {
  const location = useLocation();
  const [ride, setRide] = useState<any>(location.state)
  const navigate = useNavigate();

  useEffect(() => {
    if (!ride) navigate('/404');
    return () => { }
  }, [ride])


  return ride && <>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <Typography
          sx={{ mb: 3 }}
          variant="h4"
        >
          Ride
        </Typography>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            lg={6}
            md={6}
            xs={6}
          >
            <RideDetails ride={ride} />
          </Grid>
          <Grid
            item
            lg={6}
            md={6}
            xs={6}
          >
            <RidePassengers ride={ride} />
            <RideCreator ride={ride} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  </>
};
