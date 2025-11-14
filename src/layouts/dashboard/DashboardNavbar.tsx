import * as PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next';
// material
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton, Badge, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
// components
import Iconify from '../../components/Iconify';
//
import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
import LanguagePopover from './LanguagePopover';
import NotificationsPopover from './NotificationsPopover';
import MessagesPopover from './MessagesPopover';
import LinearLoader from '@/components/LinearLoader';
import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import useServerStats from '@/hooks/useServerStats';
import { StyledBadge } from './OnlineSidebar';
import useNotification from '@/hooks/useNotification';
// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_DESKTOP = 300;
const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const RootStyle = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'isRTL',
})<{ isRTL?: boolean }>(({ theme, isRTL }) => ({
    boxShadow: 'none',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
    backgroundColor: alpha(theme.palette.background.default, 0.72),
    [theme.breakpoints.up('lg')]: {
        width: `calc(100% - ${DRAWER_WIDTH + 1}px)`,
        right: isRTL ? DRAWER_WIDTH : 'auto',
        left: isRTL ? 'auto' : DRAWER_WIDTH,
    },
    [theme.breakpoints.up('xl')]: {
        width: `calc(100% - ${DRAWER_WIDTH_DESKTOP + 1}px)`,
        right: isRTL ? DRAWER_WIDTH_DESKTOP : 'auto',
        left: isRTL ? 'auto' : DRAWER_WIDTH_DESKTOP,
    },
}));

const ToolbarStyle = styled(Toolbar, {
    shouldForwardProp: (prop) => prop !== 'isRTL',
})<{ isRTL?: boolean }>(({ theme, isRTL }) => ({
    minHeight: APPBAR_MOBILE,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    padding: theme.spacing(0, 1),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(0, 2),
    },
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(0, 3),
    },
    [theme.breakpoints.up('lg')]: {
        minHeight: APPBAR_DESKTOP,
        padding: theme.spacing(0, 5),
    },
    [theme.breakpoints.up('xl')]: {
        padding: theme.spacing(0, 6),
    },
}));

// ----------------------------------------------------------------------

DashboardNavbar.propTypes = {
    onOpenSidebar: PropTypes.func,
    onOpenRightSidebar: PropTypes.func,
};

export default function DashboardNavbar({ onOpenSidebar, onOpenRightSidebar }) {
    const { notifications, loading, markAsRead, markAllAsRead } = useNotification();
    const { isLogged } = useAuth();
    const { isRTL } = useLanguage();
    const theme = useTheme();
    const {online} = useServerStats();
    const navigate = useNavigate();
    const { t } = useTranslation();

    /// <summary>
    /// initialize notifications
    /// </summary>

    const InitNotifications = () => {
        const lastSeenAt = localStorage.getItem("NotificationSeenAt") || new Date();
        if (!lastSeenAt) localStorage.setItem("NotificationSeenAt", new Date().toString());
    };

    // Create navbar items that will be reordered based on RTL
    const navbarItems = [
        {
            type: 'component',
            order: isRTL ? 4 : 1,
            component: <LanguagePopover />
        },
        {
            type: 'component',
            order: isRTL ? 3 : 2,
            component: <MessagesPopover />
        },
        {
            type: 'component',
            order: isRTL ? 2 : 3,
            component: (
                <NotificationsPopover
                    notifications={notifications}
                    loading={loading}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                />
            )
        },
        {
            type: 'component',
            order: isRTL ? 1 : 4,
            component: isLogged ? <AccountPopover /> : null
        }
    ];

    // Filter out null components
    const filteredItems = navbarItems.filter(item => item.component !== null);

    console.log('🔧 Navbar Debug:', {
        isRTL,
        originalItems: filteredItems.length,
        itemOrder: filteredItems.map((item, index) => `${index}: ${item.type} (order: ${item.order})`)
    });

    return (
        <RootStyle isRTL={isRTL}>
            <LinearLoader />
            <ToolbarStyle isRTL={isRTL}>
                <IconButton 
                    onClick={onOpenSidebar} 
                    sx={{ 
                        mr: isRTL ? 0 : 1, 
                        ml: isRTL ? 1 : 0,
                        color: 'text.primary', 
                        display: { lg: 'none' } 
                    }}
                >
                    <Iconify icon="eva:menu-2-fill" sx={{}} />
                </IconButton>
                {/* <Searchbar /> */}
                {/* Mobile-only user dropdown (left-aligned on phones) */}
                <Box sx={{ display: { xs: 'flex', sm: 'none' }, ml: 1 }}>
                    <AccountPopover />
                </Box>
                <Box sx={{ flexGrow: 1 }} />

                {/* Desktop/Tablet navbar items */}
                <Box
                    sx={{
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        gap: { sm: 1, md: 1.2, lg: 1.5 },
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        width: '100%',
                        justifyContent: isRTL ? 'flex-start' : 'flex-end',
                        flexWrap: { sm: 'nowrap' },
                        '& > *': {
                            flexShrink: 0,
                        }
                    }}
                >
                    {filteredItems.map((item, index) => (
                        <Box 
                            key={index} 
                            sx={{ 
                                order: item.order,
                                display: 'flex'
                            }}
                        >
                            {item.component}
                        </Box>
                    ))}
                </Box>
            </ToolbarStyle>
        </RootStyle>
    );
}
