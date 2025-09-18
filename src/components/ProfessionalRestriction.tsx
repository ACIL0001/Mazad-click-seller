import React from 'react';
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
  Fade,
  Grow,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Iconify from './Iconify';
import Page from './Page';

interface ProfessionalRestrictionProps {
  userType: string;
  userName: string;
}

export default function ProfessionalRestriction({ userType, userName }: ProfessionalRestrictionProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleUpgradeAccount = () => {
    navigate('/identity-verification');
  };

  return (
    <Page title={t('navigation.dashboard')}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={800}>
          <Box>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {t('dashboard.professional_required.title')}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                  {t('dashboard.professional_required.subtitle')}
                </Typography>
              </Box>
            </motion.div>

            {/* Main Content */}
            <Grow in timeout={1000}>
              <Card
                sx={{
                  maxWidth: 800,
                  mx: 'auto',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={4} alignItems="center">
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    >
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `2px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        }}
                      >
                        <Iconify 
                          icon="mdi:account-lock" 
                          sx={{ 
                            fontSize: 60, 
                            color: theme.palette.warning.main,
                          }} 
                        />
                      </Box>
                    </motion.div>

                    {/* Current Account Status */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {t('dashboard.professional_required.current_account')}
                      </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      Welcome, {userName}!
                    </Typography>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        }}
                      >
                        <Iconify icon="mdi:account" sx={{ fontSize: 20, color: 'info.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.dark' }}>
                          Account Type: {userType}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Restriction Message */}
                    <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
                        {t('dashboard.professional_required.restriction_title')}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {t('dashboard.professional_required.restriction_message')}
                      </Typography>
                    </Box>

                    {/* Benefits List */}
                    <Box sx={{ width: '100%', maxWidth: 500 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                        {t('dashboard.professional_required.benefits_title')}
                      </Typography>
                      <Stack spacing={2}>
                        {[
                          'dashboard.professional_required.benefit_1',
                          'dashboard.professional_required.benefit_2',
                          'dashboard.professional_required.benefit_3',
                          'dashboard.professional_required.benefit_4',
                        ].map((benefit, index) => (
                          <motion.div
                            key={benefit}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.light, 0.02)} 100%)`,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                              }}
                            >
                              <Iconify 
                                icon="mdi:check-circle" 
                                sx={{ 
                                  fontSize: 24, 
                                  color: 'success.main',
                                  flexShrink: 0,
                                }} 
                              />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {t(benefit)}
                              </Typography>
                            </Box>
                          </motion.div>
                        ))}
                      </Stack>
                    </Box>

                    {/* Action Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={handleUpgradeAccount}
                          startIcon={<Iconify icon="mdi:account-arrow-up" />}
                          sx={{
                            px: 6,
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
                          {t('dashboard.professional_required.upgrade_button')}
                        </Button>
                      </Box>
                    </motion.div>

                    {/* Additional Info */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('dashboard.professional_required.verification_note')}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grow>
          </Box>
        </Fade>
      </Container>
    </Page>
  );
}
