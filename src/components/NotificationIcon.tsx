import React, { useState } from 'react';
import { IconButton, Badge, Box } from '@mui/material';
import Iconify from './Iconify';
import useNotification from '@/hooks/useNotification';
import NotificationList from './NotificationList';

export default function NotificationIcon() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { unreadCount } = useNotification();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Iconify icon="mdi:bell" width={24} height={24} />
        </Badge>
      </IconButton>

      <NotificationList
        anchorEl={anchorEl}
        onClose={handleClose}
      />
    </Box>
  );
}