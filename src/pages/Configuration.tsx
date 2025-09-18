//------------------------------------------------------------------------------
// <copyright file="Configuration.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>                                                                
//------------------------------------------------------------------------------


import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme, styled } from '@mui/material/styles';
// material
import {
  Card,
  Table,
  Button,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  IconButton,
  Typography,
  Container,
  Stack,
} from '@mui/material';
// @mui/icons-material
import Iconify from '../components/Iconify';
import Label from '../components/Label';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'company', label: 'Company', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'isVerified', label: 'Verified', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

const TABLE_DATA = [
  {
    id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
    name: 'Jayvion Simon',
    email: 'nannie_abernathy70@yahoo.com',
    avatarUrl: '/static/mock-images/avatars/avatar_1.jpg',
    company: 'Lueilwitz, Wisozk and Mueller',
    isVerified: true,
    status: 'Pending',
    role: 'Admin',
  },
  {
    id: '58a4b7d5-8a1b-4c0c-9c0c-9c0c9c0c9c0c',
    name: 'Lucian Obrien',
    email: 'ashlynn_ohara62@gmail.com',
    avatarUrl: '/static/mock-images/avatars/avatar_2.jpg',
    company: 'Fadel, Wuckert and Kling',
    isVerified: false,
    status: 'Banned',
    role: 'Admin',
  },
  {
    id: '58a4b7d5-8a1b-4c0c-9c0c-9c0c9c0c9c0d',
    name: 'Deja Brady',
    email: 'miguel.barrows@yahoo.com',
    avatarUrl: '/static/mock-images/avatars/avatar_3.jpg',
    company: 'Ledner, Rice and Wolff',
    isVerified: true,
    status: 'Active',
    role: 'Admin',
  },
  {
    id: '58a4b7d5-8a1b-4c0c-9c0c-9c0c9c0c9c0e',
    name: 'Harrison Stein',
    email: 'dcristin@yahoo.com',
    avatarUrl: '/static/mock-images/avatars/avatar_4.jpg',
    company: 'Abernathy Group',
    isVerified: true,
    status: 'Active',
    role: 'Admin',
  },
  {
    id: '58a4b7d5-8a1b-4c0c-9c0c-9c0c9c0c9c0f',
    name: 'Reece Chung',
    email: 'moshe_gulgowski@hotmail.com',
    avatarUrl: '/static/mock-images/avatars/avatar_5.jpg',
    company: 'Feeney, Langworth and Tremblay',
    isVerified: true,
    status: 'Active',
    role: 'Admin',
  },
];

const RootStyle = styled('div')(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.neutral,
  paddingTop: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(5),
  },
}));

// ----------------------------------------------------------------------

export default function Configuration() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Page title={t('pages.configuration.title')}>
      <RootStyle>
        <Container maxWidth={false}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2.5 }}>
            <Typography variant="h4">{t('pages.configuration.title')}</Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              {t('common.add')}
            </Button>
          </Stack>

          <Card>
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {TABLE_HEAD.map((headCell) => (
                        <TableCell key={headCell.id} align={headCell.alignRight ? 'right' : 'left'}>
                          {t(`common.${headCell.label.toLowerCase()}`)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {TABLE_DATA.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" noWrap>
                            {row.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{row.company}</TableCell>
                        <TableCell align="left">{row.role}</TableCell>
                        <TableCell align="left">
                          <Label
                            variant={theme.palette.mode === 'light' ? 'ghost' : 'soft'}
                            color={row.isVerified ? 'success' : 'error'}
                          >
                            {row.isVerified ? t('common.verified') : t('common.unverified')}
                          </Label>
                        </TableCell>
                        <TableCell align="left">
                          <Label
                            variant={theme.palette.mode === 'light' ? 'ghost' : 'soft'}
                            color={
                              (row.status === 'Active' && 'success') ||
                              (row.status === 'Pending' && 'warning') ||
                              'error'
                            }
                          >
                            {t(`common.${row.status.toLowerCase()}`)}
                          </Label>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={t('common.edit')}>
                            <IconButton>
                              <Iconify icon="eva:edit-fill" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>
        </Container>
      </RootStyle>
    </Page>
  );
}