import { useEffect, useState } from 'react';
// material
import { styled } from '@mui/material/styles';
import { Box, Drawer, Typography, Divider, Avatar, List, ListItem, ListItemAvatar, ListItemText, Badge } from '@mui/material';
import { UserAPI } from '../../api/user';
import { RoleCode } from '../../types/Role';
import useUsers from '@/hooks/useUsers';
import app from '../../config';
import useServerStats from '@/hooks/useServerStats';

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    transition: theme.transitions.create('width', {
      duration: theme.transitions.duration.complex
    })
  }
}));

const SectionStyle = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  '& + &': {
    borderTop: `1px solid ${theme.palette.divider}`
  }
}));

export const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

// ----------------------------------------------------------------------

type OnlineSidebarProps = {
  isOpenSidebar: boolean;
  onCloseSidebar: () => void;
};

interface User {
  _id: string;
  name: string;
  picture?: {
    filename: string;
  };
  email?: string;
}

export default function OnlineSidebar({ isOpenSidebar, onCloseSidebar }: OnlineSidebarProps) {

  const { online } = useServerStats();

  const renderContent = (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          Utilisateurs en ligne
        </Typography>
      </Box>
      
      <Divider />

      <SectionStyle>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
          Admins ({online.admin.length})
        </Typography>
        <List>
          {online.admin.map((admin) => (
            <ListItem key={admin.user._id}>
              <ListItemAvatar>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar alt={admin.user.name} src={admin.user.picture?.filename ? app.route + admin.user.picture.filename : undefined} />
                </StyledBadge>
              </ListItemAvatar>
              <ListItemText 
                primary={admin.user.name}
                secondary={admin.user.email}
                primaryTypographyProps={{ variant: 'subtitle2', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
              />
            </ListItem>
          ))}
        </List>
      </SectionStyle>

      <SectionStyle>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
          Restaurants ({online.restaurant.length})
        </Typography>
        <List>
          {online.restaurant.map((restaurant) => (
            <ListItem key={restaurant.user._id}>
              <ListItemAvatar>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar alt={restaurant.user.name} src={restaurant.user.picture?.filename ? app.route + restaurant.user.picture.filename : undefined} />
                </StyledBadge>
              </ListItemAvatar>
              <ListItemText 
                primary={restaurant.user.name}
                secondary={restaurant.user.email}
                primaryTypographyProps={{ variant: 'subtitle2', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
              />
            </ListItem>
          ))}
        </List>
      </SectionStyle>

      <SectionStyle>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
          Riders ({online.rider.length})
        </Typography>
        <List>
          {online.rider.map((rider) => (
            <ListItem key={rider.user._id}>
              <ListItemAvatar>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar alt={rider.user.name} src={rider.user.picture?.filename ? app.route + rider.user.picture.filename : undefined} />
                </StyledBadge>
              </ListItemAvatar>
              <ListItemText 
                primary={rider.user.name}
                secondary={rider.user.email}
                primaryTypographyProps={{ variant: 'subtitle2', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
              />
            </ListItem>
          ))}
        </List>
      </SectionStyle>

      <SectionStyle>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
          Clients ({online.client.length})
        </Typography>
        <List>
          {online.client.map((client) => (
            <ListItem key={client.user._id}>
              <ListItemAvatar>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar alt={client.user.name} src={client.user.picture?.filename ? app.route + client.user.picture.filename : undefined} />
                </StyledBadge>
              </ListItemAvatar>
              <ListItemText 
                primary={client.user.name}
                secondary={client.user.email}
                primaryTypographyProps={{ variant: 'subtitle2', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
              />
            </ListItem>
          ))}
        </List>
      </SectionStyle>
    </Box>
  );

  return (
    <RootStyle>
      <Drawer
        anchor="right"
        open={isOpenSidebar}
        onClose={onCloseSidebar}
        PaperProps={{
          sx: { width: DRAWER_WIDTH }
        }}
      >
        {renderContent}
      </Drawer>
    </RootStyle>
  );
}
