import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
} from '@mui/material';
import Iconify from './Iconify';
import NotificationIcon from './NotificationIcon';
import { useSocket } from '../contexts/SocketContext';

export default function HeaderWithNotifications() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { unread, setUnread } = useSocket();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Function to mark notifications as read
  const handleNotificationClick = () => {
    setUnread(0);
    // Optionally: call API to mark notifications as read on the server
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MazadClick
        </Typography>
        {/* Notification Icon with Badge */}
        <Badge 
          badgeContent={unread} 
          color="error" 
          sx={{ 
            '& .MuiBadge-badge': { 
              fontSize: '10px', 
              minWidth: '20px',
              height: '20px' 
            } 
          }}
          onClick={handleNotificationClick}
        >
          <NotificationIcon />
        </Badge>
        {/* User Menu */}
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <Avatar sx={{ width: 32, height: 32 }}>
            <Iconify icon="mdi:account" width={20} height={20} />
          </Avatar>
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My account</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
} 