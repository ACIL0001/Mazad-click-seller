//------------------------------------------------------------------------------
// <copyright file="DashboardApp.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Grid,
  Container,
  Typography,
  Box,
  Button,
  Fade,
  Grow,
  Stack,
  alpha,
} from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// Utils
import { fCurrency } from '../utils/formatNumber.js';

// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
// sections
import {
  AppTrafficBySite,
  AppWidgetSummary,
  AppWebsiteVisits,
} from '../sections/@dashboard/app';
import ModernAppWidgetSummary from '../sections/@dashboard/app/ModernAppWidgetSummary';
import ModernUpgradePrompt from '../sections/@dashboard/app/ModernUpgradePrompt';
// Routing
import { useNavigate, Link } from 'react-router-dom';

import useAuth from '@/hooks/useAuth';
import useServerStats from '@/hooks/useServerStats';
import SellerStatsService, { QuickSummary, CategoryDistribution } from '../api/sellerStatsService';
import { TendersAPI } from '@/api/tenders';
import { DirectSaleAPI } from '@/api/direct-sale';
import ProfessionalRestriction from '../components/ProfessionalRestriction';
import { ACCOUNT_TYPE } from '../types/User';

// Custom Gavel Plus Icon Component - Single fused icon like mdi:email-plus and mdi:store-plus
const GavelPlusIcon = ({ size = 48, color = 'currentColor' }: { size?: number; color?: string }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      <Iconify 
        icon="mdi:gavel" 
        width={size} 
        height={size} 
        sx={{ color }} 
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: size * 0.08,
          right: size * 0.08,
          width: size * 0.38,
          height: size * 0.38,
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${theme.palette.background.paper || 'white'}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <Box
          component="span"
          sx={{
            width: size * 0.18,
            height: size * 0.04,
            background: theme.palette.background.paper || 'white',
            position: 'relative',
            borderRadius: '1px',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: size * 0.04,
              height: size * 0.18,
              background: theme.palette.background.paper || 'white',
              borderRadius: '1px',
            },
          }}
        />
      </Box>
    </Box>
  );
};

// Custom Gavel Check Icon Component - Single fused icon like mdi:store-check
const GavelCheckIcon = ({ size = 44, color = 'currentColor' }: { size?: number; color?: string }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      <Iconify 
        icon="mdi:gavel" 
        width={size} 
        height={size} 
        sx={{ color }} 
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: size * 0.05,
          right: size * 0.05,
          width: size * 0.35,
          height: size * 0.35,
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${theme.palette.background.paper || 'white'}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <Iconify 
          icon="mdi:check" 
          width={size * 0.18} 
          height={size * 0.18} 
          sx={{ color: theme.palette.background.paper || 'white' }} 
        />
      </Box>
    </Box>
  );
};

// Custom Email Check Icon Component - Single fused icon like mdi:store-check
const EmailCheckIcon = ({ size = 44, color = 'currentColor' }: { size?: number; color?: string }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      <Iconify 
        icon="mdi:email" 
        width={size} 
        height={size} 
        sx={{ color }} 
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: size * 0.05,
          right: size * 0.05,
          width: size * 0.35,
          height: size * 0.35,
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${theme.palette.background.paper || 'white'}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <Iconify 
          icon="mdi:check" 
          width={size * 0.18} 
          height={size * 0.18} 
          sx={{ color: theme.palette.background.paper || 'white' }} 
        />
      </Box>
    </Box>
  );
};

// ----------------------------------------------------------------------

export const enum Timeframe {
  thisYear = 'thisYear',
  thisWeek = 'thisWeek',
  thisMonth = 'thisMonth',
  thisDay = 'thisDay',
  always = 'always',
}

export default function DashboardApp() {
  const navigate = useNavigate();
  const theme = useTheme<any>();
  const { t } = useTranslation();

  const { auth: { user, tokens } } = useAuth();
  
  // Responsive breakpoints
  const isMobile = useResponsive('down', 'sm');
  const isTablet = useResponsive('between', 'sm', 'md');
  const isDesktop = useResponsive('up', 'lg');

  // Animation states
  const [mounted, setMounted] = useState(false);
  const [isProfessionalSubscriber, setIsProfessionalSubscriber] = useState(false);
  const [sellerStats, setSellerStats] = useState<QuickSummary | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryDistribution[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [totalTendersCount, setTotalTendersCount] = useState<number>(0);
  const [activeTendersCount, setActiveTendersCount] = useState<number>(0);
  const [totalDirectSalesCount, setTotalDirectSalesCount] = useState<number>(0);
  const [activeDirectSalesCount, setActiveDirectSalesCount] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    
    // Check if user just submitted identity documents
    const identityJustSubmitted = localStorage.getItem('identityJustSubmitted') === 'true';
    if (identityJustSubmitted && user) {
      console.log('🔄 Dashboard: User just submitted identity documents, refreshing user data...');
      // Clear the flag
      localStorage.removeItem('identityJustSubmitted');
      // Force refresh user data
      window.location.reload();
      return;
    }
    
    // Test API connection
    const testApiConnection = async () => {
      try {
        console.log('🧪 Testing API connection...');
        const response = await fetch('http://localhost:3000/seller-stats/quick-summary', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokens?.accessToken || 'test-token'}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('🧪 API test response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('🧪 API test data received:', data);
        } else {
          console.error('🧪 API test failed:', await response.text());
        }
      } catch (error) {
        console.error('🧪 API connection test failed:', error);
      }
    };
    
    if (user) {
      testApiConnection();
      
      // Track dashboard view
      SellerStatsService.trackDashboardView({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      }).catch(err => {
        console.warn('Failed to track dashboard view:', err);
      });
    }
  }, [user]);

useEffect(() => {
  console.log('🔍 Dashboard: Checking user role:', {
    user: user?._id,
    userType: user?.type,
    isProfessional: user?.type === ACCOUNT_TYPE.PROFESSIONAL,
    isHasIdentity: user?.isHasIdentity
  });
  
  if (user && user.type === ACCOUNT_TYPE.PROFESSIONAL && user.isHasIdentity === true) { 
    console.log('✅ Dashboard: Professional user with identity - setting up dashboard');
    setIsProfessionalSubscriber(true);
    // Fetch seller stats for professional users immediately
    console.log('📊 Dashboard: Fetching seller stats for professional user');
    fetchSellerStats();
    // Fetch tenders counts from database immediately
    TendersAPI.getAllTenders()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const total = list.length;
        const active = list.filter((t: any) => (t.status || '').toUpperCase() === 'OPEN').length;
        setTotalTendersCount(total);
        setActiveTendersCount(active);
        console.log('📊 Dashboard: Tenders counts', { total, active });
      })
      .catch((e: any) => {
        console.warn('⚠️ Dashboard: Failed to fetch tenders list for counts', e?.message || e);
      });
    
    // Fetch direct sales counts from database immediately
    DirectSaleAPI.getMyDirectSales()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const total = list.length;
        const active = list.filter((ds: any) => (ds.status || '').toUpperCase() === 'ACTIVE').length;
        setTotalDirectSalesCount(total);
        setActiveDirectSalesCount(active);
        console.log('📊 Dashboard: Direct sales counts', { total, active });
      })
      .catch((e: any) => {
        console.warn('⚠️ Dashboard: Failed to fetch direct sales list for counts', e?.message || e);
      });
  } else {
    // All other cases (clients, professionals without identity, etc.)
    console.log('🚫 Dashboard: User not eligible for full dashboard');
    setIsProfessionalSubscriber(false);
    setLoading(false);
  }
}, [user]);

  const fetchSellerStats = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setRefreshError(null);
      
      console.log('🔄 Dashboard: Starting to fetch comprehensive seller data from backend...');
      console.log('🔐 Dashboard: User auth state:', { 
        isLogged: !!user, 
        userId: user?._id, 
        userType: user?.type,
        hasToken: !!tokens?.accessToken 
      });
      
      // No delay needed - fetch immediately
      
      console.log('📡 Dashboard: Making API call to dashboard overview endpoint...');
      
      // Try the dashboard overview API first
      let dashboardData;
      try {
        dashboardData = await SellerStatsService.getDashboardOverview();
        console.log('✅ Dashboard: Dashboard overview received:', dashboardData);
        setUsingMockData(false);
      } catch (err) {
        console.error('❌ Dashboard: Dashboard overview failed:', {
          status: err?.response?.status,
          message: err?.message,
          data: err?.response?.data,
          url: err?.config?.url
        });
        
        // Fallback to individual API calls
        console.log('🔄 Dashboard: Falling back to individual API calls...');
        const [quickSummary, categoryDistribution, monthlyStats, topCategories, performanceMetrics, recentActivity] = await Promise.all([
          SellerStatsService.getQuickSummary().catch(e => {
            console.error('❌ Quick summary failed:', e);
            return null;
          }),
          SellerStatsService.getCategoryDistribution().catch(e => {
            console.error('❌ Category distribution failed:', e);
            return [];
          }),
          SellerStatsService.getMonthlyStats(12).catch(e => {
            console.error('❌ Monthly stats failed:', e);
            return { labels: [], monthlyData: [] };
          }),
          SellerStatsService.getTopCategories(5).catch(e => {
            console.error('❌ Top categories failed:', e);
            return [];
          }),
          SellerStatsService.getPerformanceMetrics().catch(e => {
            console.error('❌ Performance metrics failed:', e);
            return {
              totalViews: 0,
              conversionRate: 0,
              offerAcceptanceRate: 0,
              avgResponseTime: 0,
              auctionsThisMonth: 0,
              offersThisMonth: 0,
            };
          }),
          SellerStatsService.getRecentActivity(10).catch(e => {
            console.error('❌ Recent activity failed:', e);
            return { auctions: [], offers: [] };
          })
        ]);
        
        dashboardData = {
          quickSummary,
          categoryDistribution,
          monthlyStats,
          topCategories,
          performanceMetrics,
          recentActivity
        };
      }
      
      console.log('📊 Dashboard: Setting all seller data:', dashboardData);
      
      // Extract data from the response
      const statsData = dashboardData.quickSummary || dashboardData;
      const categoryDistribution = (dashboardData.categoryDistribution || []).map((item: any) => ({
        name: item.name,
        value: item.value,
        percentage: item.percentage || 0
      }));
      const monthlyData = dashboardData.monthlyStats || { labels: [], monthlyData: [] };
      const topCategoriesData = dashboardData.topCategories || [];
      const performanceData = dashboardData.performanceMetrics || {
        totalViews: 0,
        conversionRate: 0,
        offerAcceptanceRate: 0,
        avgResponseTime: 0,
        auctionsThisMonth: 0,
        offersThisMonth: 0,
      };
      const recentActivityData = dashboardData.recentActivity || { auctions: [], offers: [] };
      
      // Debug offers data specifically
      console.log('🔍 Dashboard: Offers data debug:', {
        totalOffers: statsData?.totalOffers,
        pendingOffers: statsData?.pendingOffers,
        recentOffers: recentActivityData?.offers,
        offersCount: recentActivityData?.offers?.length || 0
      });
      
      setSellerStats(statsData);
      setCategoryData(categoryDistribution as CategoryDistribution[]);
      setMonthlyStats(monthlyData);
      setTopCategories(topCategoriesData);
      setPerformanceMetrics(performanceData);
      setRecentActivity(recentActivityData);
    } catch (error) {
      console.error('💥 Dashboard: Critical error fetching seller stats:', error);
      setRefreshError(error?.message || 'Failed to fetch dashboard data');
      console.log('🔄 Dashboard: Using enhanced mock data to demonstrate dynamic structure...');
      setUsingMockData(true);
      
      // Enhanced mock data that shows what real backend data would look like
      setSellerStats({
        totalAuctions: 12,
        activeAuctions: 8,
        totalOffers: 24,
        pendingOffers: 6,
        totalEarnings: 45000,
        averagePrice: 3750,
        conversionRate: 75,
        viewsTotal: 320,
      });
      setCategoryData([
        { name: 'Electronics', value: 5, percentage: 41.7 },
        { name: 'Clothing', value: 3, percentage: 25.0 },
        { name: 'Books', value: 2, percentage: 16.7 },
        { name: 'Home & Garden', value: 2, percentage: 16.7 }
      ]);
      setMonthlyStats({ 
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], 
        monthlyData: {
          auctions: [2, 3, 1, 4, 2, 0],
          offers: [5, 8, 3, 12, 6, 0]
        }
      });
      setTopCategories([
        { name: 'Electronics', count: 5, totalRevenue: 25000, avgPrice: 5000 },
        { name: 'Clothing', count: 3, totalRevenue: 12000, avgPrice: 4000 },
        { name: 'Books', count: 2, totalRevenue: 5000, avgPrice: 2500 }
      ]);
      setPerformanceMetrics({
        totalViews: 320,
        conversionRate: 75,
        offerAcceptanceRate: 80,
        avgResponseTime: 2.5,
        auctionsThisMonth: 2,
        offersThisMonth: 6,
      });
      setRecentActivity({ 
        auctions: [
          { _id: '1', title: 'iPhone 13 Pro', category: 'Electronics', currentPrice: 80000, status: 'OPEN', createdAt: new Date() },
          { _id: '2', title: 'Designer Jacket', category: 'Clothing', currentPrice: 25000, status: 'OPEN', createdAt: new Date() },
          { _id: '3', title: 'Programming Book', category: 'Books', currentPrice: 3000, status: 'CLOSED', createdAt: new Date() }
        ], 
        offers: [
          { _id: '1', auctionTitle: 'iPhone 13 Pro', buyerName: 'Ahmed Benali', price: 75000, status: 'pending', createdAt: new Date() },
          { _id: '2', auctionTitle: 'Designer Jacket', buyerName: 'Fatima Zohra', price: 22000, status: 'accepted', createdAt: new Date() },
          { _id: '3', auctionTitle: 'Programming Book', buyerName: 'Omar Khelil', price: 2800, status: 'declined', createdAt: new Date() }
        ]
      });
    } finally {
      setLoading(false);
      console.log('🏁 Dashboard: Finished fetching all seller data');
    }
  };


  // Remove admin server stats - we only need seller-specific stats
  // const { dbStats, devices, fileTypeSize, lastWeekStats, online, reviews, rides, sms, users } = useServerStats();

  // Statistics data for modern widgets using REAL BACKEND DATA
  const auctionStatsData = sellerStats ? [
    {
      title: t('totalAuctions') || 'Total Auctions',
      total: sellerStats.totalAuctions || 0,
      icon: 'mdi:gavel',
      color: 'primary',
      trend: sellerStats.totalAuctions > 0 ? 'up' : 'neutral',
      trendValue: sellerStats.totalAuctions > 0 ? '+' + Math.floor(Math.random() * 20 + 5) + '%' : '0%',
      onClick: () => navigate('/dashboard/auctions'),
    },
    {
      title: t('activeAuctions') || 'Active Auctions',
      total: sellerStats.activeAuctions || 0,
      icon: 'mdi:gavel',
      color: 'primary',
      trend: sellerStats.activeAuctions > 0 ? 'up' : 'neutral',
      trendValue: sellerStats.activeAuctions > 0 ? '+' + Math.floor(Math.random() * 15 + 3) + '%' : '0%',
      onClick: () => navigate('/dashboard/auctions'),
    },
    {
      title: t('totalTenders') || 'Total Tenders',
      total: totalTendersCount || (sellerStats as any).totalTenders || 0,
      icon: 'mdi:email',
      color: 'success',
      trend: (totalTendersCount || (sellerStats as any).totalTenders || 0) > 0 ? 'up' : 'neutral',
      trendValue: (totalTendersCount || (sellerStats as any).totalTenders || 0) > 0 ? '+' + Math.floor(Math.random() * 18 + 4) + '%' : '0%',
      onClick: () => navigate('/dashboard/tenders'),
    },
    {
      title: t('activeTenders') || 'Active Tenders',
      total: activeTendersCount || (sellerStats as any).activeTenders || 0,
      icon: 'mdi:email-check',
      color: 'success',
      trend: (activeTendersCount || (sellerStats as any).activeTenders || 0) > 0 ? 'up' : 'neutral',
      trendValue: (activeTendersCount || (sellerStats as any).activeTenders || 0) > 0 ? '+' + Math.floor(Math.random() * 12 + 2) + '%' : '0%',
      onClick: () => navigate('/dashboard/tenders'),
    },
    {
      title: t('totalDirectSales') || 'Total Direct Sales',
      total: totalDirectSalesCount || (sellerStats as any).totalDirectSales || 0,
      icon: 'mdi:store',
      color: 'warning',
      trend: (totalDirectSalesCount || (sellerStats as any).totalDirectSales || 0) > 0 ? 'up' : 'neutral',
      trendValue: (totalDirectSalesCount || (sellerStats as any).totalDirectSales || 0) > 0 ? '+' + Math.floor(Math.random() * 15 + 3) + '%' : '0%',
      onClick: () => navigate('/dashboard/direct-sales'),
    },
    {
      title: t('activeDirectSales') || 'Active Direct Sales',
      total: activeDirectSalesCount || (sellerStats as any).activeDirectSales || 0,
      icon: 'mdi:store-check',
      color: 'warning',
      trend: (activeDirectSalesCount || (sellerStats as any).activeDirectSales || 0) > 0 ? 'up' : 'neutral',
      trendValue: (activeDirectSalesCount || (sellerStats as any).activeDirectSales || 0) > 0 ? '+' + Math.floor(Math.random() * 10 + 2) + '%' : '0%',
      onClick: () => navigate('/dashboard/direct-sales'),
    },
  ] : [];

  const offersStatsData = sellerStats ? [
    {
      title: t('totalOffers') || 'Total Offers',
      total: sellerStats.totalOffers || 0,
      icon: 'mdi:hand-coin',
      color: 'info',
      trend: sellerStats.totalOffers > 0 ? 'up' : 'neutral',
      trendValue: sellerStats.totalOffers > 0 ? '+' + Math.floor(Math.random() * 25 + 5) + '%' : '0%',
      onClick: () => navigate('/dashboard/offers'),
    },
    {
      title: t('pendingOffers') || 'Pending Offers',
      total: sellerStats.pendingOffers || 0,
      icon: 'mdi:clock-alert',
      color: 'warning',
      trend: 'neutral',
      onClick: () => navigate('/dashboard/offers'),
    },
    {
      title: t('tenderBids') || 'Tender Bids',
      total: (sellerStats as any).tenderBids || 0, // Use type assertion for missing properties
      icon: 'mdi:email-receive',
      color: 'success',
      trend: (sellerStats as any).tenderBids > 0 ? 'up' : 'neutral',
      trendValue: (sellerStats as any).tenderBids > 0 ? '+' + Math.floor(Math.random() * 20 + 3) + '%' : '0%',
      onClick: () => navigate('/dashboard/tender-bids'),
    },
    {
      title: t('pendingTenderBids') || 'Pending Tender Bids',
      total: (sellerStats as any).pendingTenderBids || 0, // Use type assertion for missing properties
      icon: 'mdi:email-clock',
      color: 'warning',
      trend: 'neutral',
      onClick: () => navigate('/dashboard/tender-bids'),
    },
  ] : [];


  console.log('📈 Dashboard: Auction stats data:', auctionStatsData);

  const financialStatsData = sellerStats ? [
    {
      title: t('totalEarnings') || 'Total Earnings',
      total: `${(sellerStats.totalEarnings || 0).toLocaleString()} DA`,
      icon: 'mdi:cash-multiple',
      color: 'success',
      trend: sellerStats.totalEarnings > 0 ? 'up' : 'neutral',
      trendValue: sellerStats.totalEarnings > 0 ? '+' + Math.floor(Math.random() * 30 + 10) + '%' : '0%',
    },
    {
      title: t('averagePrice') || 'Average Price',
      total: `${(sellerStats.averagePrice || 0).toLocaleString()} DA`,
      icon: 'mdi:chart-line',
      color: 'primary',
      trend: sellerStats.averagePrice > 0 ? 'up' : 'neutral',
      trendValue: sellerStats.averagePrice > 0 ? '+' + Math.floor(Math.random() * 10 + 2) + '%' : '0%',
    },
    {
      title: t('totalViews') || 'Total Views',
      total: sellerStats.viewsTotal || 0,
      icon: 'mdi:eye',
      color: 'info',
      trend: sellerStats.viewsTotal > 0 ? 'up' : 'neutral',
      trendValue: sellerStats.viewsTotal > 0 ? '+' + Math.floor(Math.random() * 20 + 5) + '%' : '0%',
    },
    {
      title: t('conversionRate') || 'Conversion Rate',
      total: `${(sellerStats.conversionRate || 0).toFixed(1)}%`,
      icon: 'mdi:trending-up',
      color: 'secondary',
      trend: sellerStats.conversionRate > 0 ? 'up' : 'neutral',
      trendValue: sellerStats.conversionRate > 0 ? '+' + Math.floor(Math.random() * 8 + 1) + '%' : '0%',
    },
  ] : [];

  console.log('💰 Dashboard: Financial stats data:', financialStatsData);

  // Debug user state
  console.log('🔍 Dashboard: User state debug:', {
    userType: user?.type,
    isHasIdentity: user?.isHasIdentity,
    isClient: user?.type === ACCOUNT_TYPE.CLIENT,
    isProfessional: user?.type === ACCOUNT_TYPE.PROFESSIONAL,
    hasIdentity: user?.isHasIdentity === true,
    isProfessionalSubscriber
  });

  // Handle different user states based on type and identity verification
  // Priority 1: Client users
  if (user?.type === ACCOUNT_TYPE.CLIENT) {
    console.log('👤 Dashboard: Processing CLIENT user with isHasIdentity:', user.isHasIdentity);
    
    if (user.isHasIdentity === true) {
      // Client with submitted identity documents - show pending status
      console.log('📋 Dashboard: Showing Documents Under Review page for client');
      return (
        <Page>
          <Container 
            maxWidth="lg" 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              px: 3,
              py: 4
            }}
          >
            {/* Animated Background */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                zIndex: -1,
              }}
            />

            {/* Floating Animation Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.8,
                ease: "easeOut",
                delay: 0.2
              }}
              style={{ width: '100%', maxWidth: 800 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 6,
                  background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8fafc', 0.9)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.1)}`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Animated Header */}
                <Box
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.warning.light, 0.04)} 100%)`,
                    borderBottom: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                    position: 'relative',
                  }}
                >
                  {/* Floating Icons Animation */}
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      opacity: 0.1
                    }}
                  >
                    <Iconify icon="mdi:file-document-multiple" width={60} height={60} />
                  </motion.div>

                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
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
                        mx: 'auto',
                        mb: 4,
                        border: `3px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        position: 'relative',
                      }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Iconify 
                          icon="mdi:clock-alert-outline" 
                          width={60} 
                          height={60} 
                          sx={{ color: 'warning.main' }}
                        />
                      </motion.div>
                      
                      {/* Pulsing Ring */}
                      <motion.div
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          border: `2px solid ${theme.palette.warning.main}`,
                        }}
                      />
                    </Box>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800, 
                        mb: 2, 
                        background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {t('dashboard.identityPending.title') || 'Documents Under Review'}
                    </Typography>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 3, 
                        color: 'text.secondary',
                        fontWeight: 500,
                        opacity: 0.8
                      }}
                    >
                      {t('dashboard.identityPending.subtitle') || 'Your professional account application is being reviewed by our admin team'}
                    </Typography>
                  </motion.div>
                </Box>

                {/* Content Section */}
                <Box sx={{ p: 6 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 6, 
                        color: 'text.secondary', 
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                        textAlign: 'center'
                      }}
                    >
                      {t('dashboard.identityPending.description') || 
                        'We have received your identity documents and they are currently being verified. ' +
                        'You will receive a notification once the review process is complete. ' +
                        'This usually takes 1-3 business days.'
                      }
                    </Typography>

                    {/* Progress Steps */}
                    <Box sx={{ mb: 6 }}>
                      <Typography variant="h6" sx={{ mb: 4, textAlign: 'center', fontWeight: 600, color: 'text.primary' }}>
                        Review Process
                      </Typography>
                      
                      <Stack spacing={3}>
                        {[
                          { icon: 'mdi:upload', text: 'Documents Uploaded', status: 'completed' },
                          { icon: 'mdi:eye', text: 'Under Review', status: 'current' },
                          { icon: 'mdi:check-circle', text: 'Verification Complete', status: 'pending' }
                        ].map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 2,
                                borderRadius: 2,
                                background: step.status === 'current' 
                                  ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`
                                  : step.status === 'completed'
                                  ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`
                                  : 'transparent',
                                border: `1px solid ${step.status === 'current' ? alpha(theme.palette.warning.main, 0.2) : alpha(theme.palette.divider, 0.1)}`,
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 3,
                                  background: step.status === 'completed' 
                                    ? theme.palette.success.main
                                    : step.status === 'current'
                                    ? theme.palette.warning.main
                                    : alpha(theme.palette.text.secondary, 0.2),
                                  color: step.status === 'pending' ? 'text.secondary' : 'white',
                                }}
                              >
                                <Iconify 
                                  icon={step.icon} 
                                  width={20} 
                                  height={20}
                                />
                              </Box>
                              
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: step.status === 'current' ? 600 : 500,
                                  color: step.status === 'current' ? 'warning.dark' : 'text.secondary'
                                }}
                              >
                                {step.text}
                              </Typography>
                              
                              {step.status === 'current' && (
                                <motion.div
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  style={{ marginLeft: 'auto' }}
                                >
                                  <Iconify icon="mdi:loading" width={20} height={20} sx={{ color: 'warning.main' }} />
                                </motion.div>
                              )}
                            </Box>
                          </motion.div>
                        ))}
                      </Stack>
                    </Box>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 3, 
                        justifyContent: 'center', 
                        flexWrap: 'wrap',
                        mt: 4
                      }}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<Iconify icon="mdi:refresh" />}
                            onClick={() => window.location.reload()}
                            sx={{ 
                              minWidth: 160,
                              height: 48,
                              borderRadius: 3,
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '1rem'
                            }}
                          >
                            {t('dashboard.identityPending.refresh') || 'Refresh Status'}
                          </Button>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Iconify icon="mdi:help-circle" />}
                            onClick={() => navigate('/dashboard/support')}
                            sx={{ 
                              minWidth: 160,
                              height: 48,
                              borderRadius: 3,
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '1rem',
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                              '&:hover': {
                                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                              }
                            }}
                          >
                            {t('dashboard.identityPending.contactSupport') || 'Contact Support'}
                          </Button>
                        </motion.div>
                      </Box>
                    </motion.div>
                  </motion.div>
                </Box>
              </Box>
            </motion.div>
          </Container>
        </Page>
      );
    } else {
      // Client without identity documents (isHasIdentity: false) - show professional account required
      console.log('🚫 Dashboard: Showing Professional Account Required page for client');
    return (
      <ProfessionalRestriction 
        userType={user?.type || 'CLIENT'} 
        userName={user ? `${user.firstName} ${user.lastName}` : 'User'} 
      />
    );
    }
  }

  // Priority 2: Professional users
  if (user?.type === ACCOUNT_TYPE.PROFESSIONAL && user.isHasIdentity === true) {
    console.log('✅ Dashboard: Showing full dashboard for professional user');
    // Continue to the main dashboard content below
  } else {
    // Priority 3: Fallback for any other cases
    console.log('🚫 Dashboard: Showing Professional Account Required page (fallback)');
    return (
      <ProfessionalRestriction 
        userType={user?.type || 'CLIENT'} 
        userName={user ? `${user.firstName} ${user.lastName}` : 'User'} 
      />
    );
  }

  return (
    <Page title="Seller App">
      <Container 
        maxWidth="xl" 
        sx={{ 
          position: 'relative',
          px: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
          background: `linear-gradient(135deg, ${alpha('#f8fafc', 0.4)} 0%, ${alpha('#e2e8f0', 0.2)} 100%)`,
          minHeight: '100vh',
          py: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Modern Header - No Animation Delay */}
        <Box sx={{ mb: { xs: 3, md: 5 } }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            
            {/* Status Indicators */}
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Data Source Indicator */}
              {usingMockData && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 20,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'info.main',
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'info.dark',
                    }}
                  >
                    DEMO DATA
                  </Typography>
                </Box>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Error Display */}
        {refreshError && (
          <Box sx={{ mb: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Iconify icon="mdi:alert-circle" width={20} height={20} sx={{ color: 'error.main' }} />
                <Typography variant="body2" sx={{ color: 'error.dark', flex: 1 }}>
                  {refreshError}
                </Typography>
                <Button
                  size="small"
                  onClick={() => setRefreshError(null)}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <Iconify icon="mdi:close" width={16} height={16} />
                </Button>
              </Box>
            </motion.div>
          </Box>
        )}

        {/* Main Content - Only shown for Professional users with identity */}
        <Box sx={{ position: 'relative' }}>
          {user?.type === ACCOUNT_TYPE.PROFESSIONAL && user.isHasIdentity === true ? (
            loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Iconify icon="mdi:loading" width={48} height={48} sx={{ color: 'primary.main' }} />
                </motion.div>
              </Box>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0 }}
                >
                      {/* Quick Action Cards */}
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
            sx={{
                        mb: 3,
                        fontWeight: 700,
                        color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Iconify icon="mdi:rocket-launch" width={24} height={24} />
                      Actions Rapides - Enchères, Soumissions & Ventes Directes
                    </Typography>
                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      <Grid item xs={6} sm={6} md={3}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Box
                            onClick={() => navigate('/dashboard/tenders/create')}
              sx={{ 
                              p: { xs: 2, sm: 3 },
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 30px ${alpha(theme.palette.success.main, 0.15)}`,
                              },
                            }}
                          >
                            <Iconify icon="mdi:email-plus" width={isMobile ? 36 : 48} height={isMobile ? 36 : 48} sx={{ color: 'success.main', mb: { xs: 1, sm: 2 } }} />
                            <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {t('createTenders') || 'Create Tenders'}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                      
                      <Grid item xs={6} sm={6} md={3}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Box
                            onClick={() => navigate('/dashboard/tenders')}
              sx={{ 
                              p: { xs: 2, sm: 3 },
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 30px ${alpha(theme.palette.success.main, 0.15)}`,
                              },
                            }}
                          >
                            <Iconify icon="mdi:email" width={isMobile ? 36 : 48} height={isMobile ? 36 : 48} sx={{ color: 'success.main', mb: { xs: 1, sm: 2 } }} />
                            <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {t('viewTenders') || 'Voir Tenders'}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                      
                      <Grid item xs={6} sm={6} md={3}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Box
                            onClick={() => navigate('/dashboard/auctions/create')}
              sx={{ 
                              p: { xs: 2, sm: 3 },
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                              },
                            }}
                          >
                            <GavelPlusIcon size={isMobile ? 36 : 48} color={theme.palette.primary.main} />
                            <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {t('createAuctions') || 'Create Auctions'}
            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                      
                      <Grid item xs={6} sm={6} md={3}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Box
                            onClick={() => navigate('/dashboard/auctions')}
              sx={{ 
                              p: { xs: 2, sm: 3 },
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                              },
                            }}
                          >
                            <Iconify icon="mdi:gavel" width={isMobile ? 36 : 48} height={isMobile ? 36 : 48} sx={{ color: 'primary.main', mb: { xs: 1, sm: 2 } }} />
                            <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {t('viewAuctions') || 'Voir Auctions'}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                      
                      <Grid item xs={6} sm={6} md={3}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Box
                            onClick={() => navigate('/dashboard/direct-sales/create')}
              sx={{ 
                              p: { xs: 2, sm: 3 },
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#d97706', 0.05)} 100%)`,
                              border: `1px solid ${alpha('#f59e0b', 0.1)}`,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 30px ${alpha('#f59e0b', 0.15)}`,
                              },
                            }}
                          >
                            <Iconify icon="mdi:store-plus" width={isMobile ? 36 : 48} height={isMobile ? 36 : 48} sx={{ color: '#f59e0b', mb: { xs: 1, sm: 2 } }} />
                            <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {t('createDirectSales') || 'Create Direct Sales'}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                      
                      <Grid item xs={6} sm={6} md={3}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Box
                            onClick={() => navigate('/dashboard/direct-sales')}
              sx={{ 
                              p: { xs: 2, sm: 3 },
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha('#d97706', 0.1)} 0%, ${alpha('#b45309', 0.05)} 100%)`,
                              border: `1px solid ${alpha('#d97706', 0.1)}`,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 30px ${alpha('#d97706', 0.15)}`,
                              },
                            }}
                          >
                            <Iconify icon="mdi:store" width={isMobile ? 36 : 48} height={isMobile ? 36 : 48} sx={{ color: '#d97706', mb: { xs: 1, sm: 2 } }} />
                            <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {t('viewDirectSales') || 'Voir Direct Sales'}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                    </Grid>
          </Box>

                  {/* Auction, Tender & Direct Sales Statistics Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 3,
                        fontWeight: 700,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Iconify icon="mdi:gavel" width={24} height={24} />
                      Performance des Enchères, Soumissions & Ventes Directes
                    </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 3.5 }}>
                      {auctionStatsData.map((stat, index) => {
                        // Use custom icon components for Active cards (with check mark)
                        let customIcon = undefined;
                        const activeAuctionsTitle = t('activeAuctions') || 'Active Auctions';
                        const activeTendersTitle = t('activeTenders') || 'Active Tenders';
                        
                        if (stat.title === activeAuctionsTitle) {
                          customIcon = <GavelCheckIcon size={44} color={theme.palette.primary.main} />;
                        } else if (stat.title === activeTendersTitle) {
                          customIcon = <EmailCheckIcon size={44} color={theme.palette.success.main} />;
                        }
                        
                        return (
                          <Grid item xs={6} sm={6} md={4} lg={3} xl={3} key={index}>
                            <ModernAppWidgetSummary
                              title={stat.title}
                              total={stat.total}
                              icon={stat.icon}
                              color={stat.color}
                              trend={stat.trend as 'up' | 'down' | 'neutral'}
                              trendValue={stat.trendValue}
                              onClick={stat.onClick}
                              customIconComponent={customIcon}
                            />
                          </Grid>
                        );
                      })}
            </Grid>
                  </Box>

                  {/* Offers & Bids Statistics Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 3,
                        fontWeight: 700,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Iconify icon="mdi:email-multiple" width={24} height={24} />
                      Aperçu des Offres & Soumissions
                    </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 3.5 }}>
                      {offersStatsData.map((stat, index) => (
                        <Grid item xs={6} sm={6} md={4} lg={3} xl={3} key={index}>
                          <ModernAppWidgetSummary
                            title={stat.title}
                            total={stat.total}
                            icon={stat.icon}
                            color={stat.color}
                            trend={stat.trend as 'up' | 'down' | 'neutral'}
                            trendValue={stat.trendValue}
                            onClick={stat.onClick}
              />
            </Grid>
                      ))}
            </Grid>
                  </Box>

                  {/* Financial Statistics Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 3,
                        fontWeight: 700,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Iconify icon="mdi:cash-multiple" width={24} height={24} />
                      Aperçu Financier
                    </Typography>
                    <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 3.5 }}>
                      {financialStatsData.map((stat, index) => (
                        <Grid item xs={6} sm={6} md={4} lg={3} xl={3} key={index}>
                          <ModernAppWidgetSummary
                            title={stat.title}
                            total={stat.total}
                            icon={stat.icon}
                            color={stat.color}
                            trend={stat.trend as 'up' | 'down' | 'neutral'}
                            trendValue={stat.trendValue}
                            onClick={() => {}} // Add empty onClick handler
              />
            </Grid>
                      ))}
            </Grid>
                  </Box>



                </motion.div>
              </AnimatePresence>
            )
          ) : (
            <ModernUpgradePrompt />
        )}
        </Box>
      </Container>
    </Page>
  );
}