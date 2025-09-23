import { Navigate, useRoutes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from './hooks/useAuth';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Users from './pages/Users';
import Restaurants from './pages/Restaurants/index';
import Deliveries from './pages/Deliveries/index';
import Products from './pages/Products/index';
import Clients from './pages/Clients/index';
import Riders from './pages/Riders/index';
import Login from './pages/Login';
import NotFound from './pages/Page404';
import Register from './pages/Register';
import OtpVerification from './pages/OtpVerification';
import ResetPassword from './pages/ResetPassword';
import DashboardApp from './pages/DashboardApp';
import Account from './pages/Account';
import Reviews from './pages/Reviews';
import Rides from './pages/Rides';
import Ride from './pages/Ride';
import Reports from './pages/Reports';
import Configuration from './pages/Configuration';
import Profile from './pages/Profile';
import Identity from './pages/Identities';
import Categories from './pages/Categories';
import AddCategory from './pages/Categories/AddCategory';
import UpdateCategory from './pages/Categories/UpdateCategory';
import Notification from './pages/Communication/Notification'
import Sms from './pages/Communication/Sms'
import Email from './pages/Communication/Email'
import Auctions from './pages/Auctions';
import CreateAuction from './pages/Auctions/CreateAuction';
import AuctionDetail from './pages/Auctions/AuctionDetail';
import Offers from './pages/Offers';
import Participants from './pages/Participants';
import Tenders from './pages/Tenders';
import CreateTender from './pages/Tenders/CreateTender';
import TenderDetail from './pages/Tenders/TenderDetail';
import TenderBids from './pages/TenderBids';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import IdentityVerification from './pages/IdentityVerification';
import WaitingForVerification from './pages/WaitingForVerification';
import SubscriptionPlans from './pages/SubscriptionPlans';
// import PaymentMethodSelection from './pages/PaymentMethodSelection';
// import PaymentSuccess from './pages/PaymentSuccess';
import { PaymentMethodSelection, SuccessPage as PaymentSuccess } from './pages/PaymentPages';




import Allchat from './pages/chat/Allchat';
import Chat from './pages/chat/Chat';

import RequireIdentityVerification from './components/RequireIdentityVerification';
import RequirePhoneVerification from './components/RequirePhoneVerification';
import SouCategories from './pages/SouCategories/SouCategories';
import AddSouCategory from './pages/SouCategories/AddSouCategories';

// Root redirect component that checks verification status
function RootRedirect() {
    const { isLogged, auth, isReady } = useAuth();
    const [loading, setLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState('/login');

    useEffect(() => {
        const checkVerificationStatus = () => {
            console.log('🔄 RootRedirect - Checking verification status:', { isReady, isLogged, auth });
            
            // Wait for auth to be ready
            if (!isReady) {
                console.log('⏳ RootRedirect - Auth not ready yet, waiting...');
                return;
            }

            if (!isLogged || !auth?.user) {
                // Not logged in, redirect to login
                console.log('🚪 RootRedirect - User not logged in, redirecting to login');
                setRedirectPath('/login');
                setLoading(false);
                return;
            }

            // Check if user is verified
            const isVerified = auth.user.isVerified === true || 
                            (auth.user.isVerified !== false && auth.user.isVerified !== 0);
            
            console.log('🔐 RootRedirect - User verification status:', { isVerified, user: auth.user });
            
            if (isVerified) {
                // User is verified, redirect to dashboard
                console.log('✅ RootRedirect - User is verified, redirecting to dashboard');
                setRedirectPath('/dashboard/app');
            } else {
                // User is not verified, redirect to waiting for verification page instead of login
                console.log('⏳ RootRedirect - User is not verified, redirecting to waiting page');
                setRedirectPath('/waiting-for-verification');
            }
            
            setLoading(false);
        };

        checkVerificationStatus();
    }, [isLogged, auth?.user, isReady]);

    if (loading) {
        // Could add a loading spinner here if needed
        return null;
    }

    return <Navigate to={redirectPath} />;
}

// ----------------------------------------------------------------------

export default function Router() {
    return useRoutes([
        {
            path: '/',
            element: <LogoOnlyLayout />,
            children: [
                { path: '/', element: <RootRedirect /> },
                { path: 'login', element: <Login /> },
                { path: 'register', element: <Register /> },
                { path: 'otp-verification', element: <OtpVerification /> },
                { path: 'reset-password', element: <ResetPassword /> },
                { path: 'identity-verification', element: <IdentityVerification /> },
                { path: 'subscription-plans', element: <SubscriptionPlans /> },
                { path: 'payment-method-selection', element: <PaymentMethodSelection /> },
                { path: 'subscription/payment/success', element: <PaymentSuccess /> },
                { path: 'payment-success', element: <PaymentSuccess /> },
                { path: 'waiting-for-verification', element: <WaitingForVerification /> },
                { path: '404', element: <NotFound /> },
                { path: '*', element: <Navigate to="/404" /> },
            ],
        },
        {
            path: '/dashboard',
            element: <DashboardLayout />,
            children: [
                { path: 'app', element: <RequirePhoneVerification><RequireIdentityVerification><DashboardApp /></RequireIdentityVerification></RequirePhoneVerification> },
                { path: 'users', element: <RequirePhoneVerification><Users /></RequirePhoneVerification> },
                { path: 'restaurants', element: <RequirePhoneVerification><Restaurants /></RequirePhoneVerification> },
                { path: 'deliveries', element: <RequirePhoneVerification><Deliveries /></RequirePhoneVerification> },
                { path: 'products', element: <RequirePhoneVerification><Products /></RequirePhoneVerification> },
                { path: 'clients', element: <RequirePhoneVerification><Clients /></RequirePhoneVerification> },
                { path: 'riders', element: <RequirePhoneVerification><Riders /></RequirePhoneVerification> },
                { path: 'account', element: <RequirePhoneVerification><Account /></RequirePhoneVerification> },
                { path: 'reviews', element: <RequirePhoneVerification><Reviews /></RequirePhoneVerification> },
                { path: 'rides', element: <RequirePhoneVerification><Rides /></RequirePhoneVerification> },
                { path: 'ride/:id', element: <RequirePhoneVerification><Ride /></RequirePhoneVerification> },
                { path: 'reports', element: <RequirePhoneVerification><Reports /></RequirePhoneVerification> },
                { path: 'configuration', element: <RequirePhoneVerification><Configuration /></RequirePhoneVerification> },
                { path: 'profile', element: <RequirePhoneVerification><Profile /></RequirePhoneVerification> },
                { path: 'identities', element: <RequirePhoneVerification><Identity /></RequirePhoneVerification> },
                { path: 'categories', element: <RequirePhoneVerification><Categories /></RequirePhoneVerification> },
                { path: 'sou-categories', element: <RequirePhoneVerification><SouCategories /></RequirePhoneVerification> },
                { path: 'categories/add', element: <RequirePhoneVerification><AddCategory /></RequirePhoneVerification> },
                { path: 'sou-categories/add', element: <RequirePhoneVerification><AddSouCategory /></RequirePhoneVerification> },
                { path: 'categories/update/:id', element: <RequirePhoneVerification><UpdateCategory /></RequirePhoneVerification> },
                { path: 'communication/notification', element: <RequirePhoneVerification><Notification /></RequirePhoneVerification> },
                { path: 'communication/sms', element: <RequirePhoneVerification><Sms /></RequirePhoneVerification> },
                { path: 'communication/email', element: <RequirePhoneVerification><Email /></RequirePhoneVerification> },
                { path: 'auctions', element: <RequirePhoneVerification><Auctions /></RequirePhoneVerification> },
                { path: 'auctions/create', element: <RequirePhoneVerification><CreateAuction /></RequirePhoneVerification> },
                { path: 'auctions/:id', element: <RequirePhoneVerification><AuctionDetail /></RequirePhoneVerification> },
                { path: 'offers', element: <RequirePhoneVerification><Offers /></RequirePhoneVerification> },
                { path: 'participants', element: <RequirePhoneVerification><Participants /></RequirePhoneVerification> },
                { path: 'tenders', element: <RequirePhoneVerification><Tenders /></RequirePhoneVerification> },
                { path: 'tenders/create', element: <RequirePhoneVerification><CreateTender /></RequirePhoneVerification> },
                { path: 'tenders/:id', element: <RequirePhoneVerification><TenderDetail /></RequirePhoneVerification> },
                { path: 'tender-bids', element: <RequirePhoneVerification><TenderBids /></RequirePhoneVerification> },
                { path: 'notifications', element: <RequirePhoneVerification><NotificationsPage /></RequirePhoneVerification> },
                { path: 'chat', element: <RequirePhoneVerification><Allchat/></RequirePhoneVerification> },
                { path: 'chat/:id', element: <RequirePhoneVerification><Chat /></RequirePhoneVerification> },
                { path: 'payment-method-selection', element: <PaymentMethodSelection /> },
                { path: 'payment-success', element: <PaymentSuccess /> },
                { path: '*', element: <Navigate to="/404" /> },
            ],
        },
        { path: '*', element: <Navigate to="/404" replace /> },
    ]);
}
