import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@mui/material';
import Iconify from '../../components/Iconify';
import useMessageNotifications from '../../hooks/useMessageNotifications';

// ----------------------------------------------------------------------

const getIcon = (name: string, badgeContent?: number | null) => {
  const icon = <Iconify icon={name} width={22} height={22} />;
  
  if (badgeContent !== null && badgeContent !== undefined && badgeContent > 0) {
    return (
      <Badge
        badgeContent={badgeContent}
        color="error"
        max={99}
        sx={{ marginRight: 1 }}
      >
        {icon}
      </Badge>
    );
  }
  return icon;
};

const useNavConfig = () => {
  const { t } = useTranslation();
  const { totalUnreadCount: messageNotificationCount } = useMessageNotifications();

  return [
    {
      title: t('navigation.dashboard'),
      path: '/dashboard/app',
      icon: getIcon('typcn:chart-pie'),
    },
    {
      title: t('navigation.users'),
      path: '/dashboard/users',
      icon: getIcon('mdi:user-online'),
      children: [
        {
          title: t('navigation.clients'),
          path: '/dashboard/users/clients',
          icon: getIcon('mdi:account'),
        },
        {
          title: t('navigation.restaurants'),
          path: '/dashboard/users/restaurants',
          icon: getIcon('mdi:food'),
        },
        {
          title: t('navigation.riders'),
          path: '/dashboard/users/riders',
          icon: getIcon('mdi:bike'),
        },
      ],
    },
    {
      title: t('navigation.auctions'),
      path: '/dashboard/auctions',
      icon: getIcon('mdi:gavel'),
      children: [
        {
          title: t('navigation.auctions'),
          path: '/dashboard/auctions',
          icon: getIcon('mdi:list-box'),
        },
        {
          title: t('navigation.addAuction'),
          path: '/dashboard/auctions/create',
          icon: getIcon('mdi:plus-circle'),
        },
        {
          title: t('navigation.offers'),
          path: '/dashboard/offers',
          icon: getIcon('mdi:hand-coin'),
        },
      ],
    },
    {
      title: 'Appels d\'Offres',
      path: '/dashboard/tenders',
      icon: getIcon('mdi:file-document-multiple'),
      children: [
        {
          title: 'Mes Appels d\'Offres',
          path: '/dashboard/tenders',
          icon: getIcon('mdi:file-document-multiple-outline'),
        },
        {
          title: 'Nouvel Appel d\'Offres',
          path: '/dashboard/tenders/create',
          icon: getIcon('mdi:file-document-plus'),
        },
        {
          title: 'Offres Reçues',
          path: '/dashboard/tender-bids',
          icon: getIcon('mdi:email-receive'),
        },
      ],
    },
    {
      title: t('navigation.deliveries'),
      path: '/dashboard/deliveries',
      icon: getIcon('mdi:bike-fast'),
    },
    {
      title: t('navigation.products'),
      path: '/dashboard/products',
      icon: getIcon('mdi:burger'),
    },
    {
      title: t('navigation.categories'),
      path: '/dashboard/categories',
      icon: getIcon('material-symbols:category'),
    },
    {
      title: t('navigation.identities'),
      path: '/dashboard/identities',
      icon: getIcon('ph:user-focus-bold'),
    },
    {
      title: t('navigation.configuration'),
      path: '/dashboard/configuration',
      icon: getIcon('eva:settings-fill'),
    },
    {
      title: t('navigation.communication'),
      path: '/dashboard/communication',
      icon: getIcon('mdi:message'),
      children: [
        {
          title: t('navigation.notification'),
          path: '/dashboard/communication/notification',
          icon: getIcon('mdi:bell'),
        },
        {
          title: t('navigation.sms'),
          path: '/dashboard/communication/sms',
          icon: getIcon('mdi:message'),
          description: 'Coming Soon',
          disabled: true,
        },
        {
          title: t('navigation.email'),
          path: '/dashboard/communication/email',
          icon: getIcon('mdi:email'),
        },
      ],
    },
    {
      title: t('navigation.chat'),
      path: '/dashboard/chat',
      icon: getIcon('material-symbols:chat', messageNotificationCount > 0 ? messageNotificationCount : null),
    },
    {
      title: t('navigation.notifications'),
      path: '/dashboard/notifications',
      icon: getIcon('mdi:bell'),
    },
    {
      title: t('navigation.reports'),
      path: '/dashboard/reports',
      icon: getIcon('clarity:alert-solid'),
      disabled: true,
    },
    {
      title: t('navigation.reviews'),
      path: '/dashboard/reviews',
      icon: getIcon('material-symbols:reviews-rounded'),
      disabled: true,
    },
  ];
};

export default useNavConfig;
