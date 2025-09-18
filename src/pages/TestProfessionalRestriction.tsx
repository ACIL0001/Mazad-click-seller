import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import Iconify from '../components/Iconify';
import Page from '../components/Page';
import DashboardApp from './DashboardApp';
import { ACCOUNT_TYPE } from '../types/User';

// Mock user data for testing
const mockUsers = [
  {
    _id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    type: ACCOUNT_TYPE.CLIENT,
  },
  {
    _id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    type: ACCOUNT_TYPE.PROFESSIONAL,
  },
  {
    _id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    type: ACCOUNT_TYPE.RESELLER,
  },
];

export default function TestProfessionalRestriction() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState(mockUsers[0]);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleUserSwitch = (user: typeof mockUsers[0]) => {
    setCurrentUser(user);
    setShowDashboard(false);
  };

  const handleViewDashboard = () => {
    setShowDashboard(true);
  };

  if (showDashboard) {
    // Mock the auth context for testing
    const mockAuth = {
      auth: {
        user: currentUser,
        tokens: { accessToken: 'test-token' }
      }
    };

    // Override the useAuth hook for testing
    const originalUseAuth = require('../hooks/useAuth').default;
    require('../hooks/useAuth').default = () => mockAuth;

    return <DashboardApp />;
  }

  return (
    <Page title="Test Professional Restriction">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Professional Restriction Test
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Test the professional account restriction functionality
            </Typography>
          </Box>

          <Card
            sx={{
              maxWidth: 600,
              mx: 'auto',
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4}>
                {/* Current User Display */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Current Test User
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 3,
                      py: 2,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <Iconify icon="mdi:account" sx={{ fontSize: 24, color: 'primary.main' }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {currentUser.firstName} {currentUser.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentUser.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={currentUser.type}
                      color={currentUser.type === ACCOUNT_TYPE.PROFESSIONAL ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* User Selection */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Switch User Type
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                    {mockUsers.map((user) => (
                      <Button
                        key={user._id}
                        variant={currentUser._id === user._id ? 'contained' : 'outlined'}
                        onClick={() => handleUserSwitch(user)}
                        startIcon={<Iconify icon="mdi:account" />}
                        sx={{
                          flex: '1 1 auto',
                          minWidth: 150,
                          borderRadius: 2,
                        }}
                      >
                        {user.firstName} ({user.type})
                      </Button>
                    ))}
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleViewDashboard}
                    startIcon={<Iconify icon="mdi:view-dashboard" />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    View Dashboard
                  </Button>
                </Box>

                {/* Instructions */}
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.light, 0.02)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    <strong>Instructions:</strong>
                    <br />
                    1. Select a user type above
                    <br />
                    2. Click "View Dashboard" to see the dashboard
                    <br />
                    3. Only PROFESSIONAL users will see the full dashboard
                    <br />
                    4. Other users will see the restriction component with upgrade button
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Page>
  );
}
