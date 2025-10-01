// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/chart/BaseOptionChart';
import { SnackbarProvider } from 'notistack';
import { AxiosInterceptor } from './api/utils';
import RequestProvider from './contexts/RequestContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { useEffect } from 'react';
import useAuth from './hooks/useAuth';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SocketProvider from './contexts/SocketContext';
import { BidsCheck } from './api/checkBids';
import FloatingAdminChat from './components/FloatingAdminChat';
// i18n
import './i18n';
import { LanguageProvider } from './contexts/LanguageContext';
// styles
import './styles/rtl.css';
// ----------------------------------------------------------------------

export default function App() {
  const { initializeAuth , auth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, []);


  // ommented out checkBids functionality as the endpoint doesn't exist
  useEffect(()=>{
    if(!auth || !auth.user) return
    // checkBids()
     const y = setInterval(() => {
      checkBids()
     }, 5000);
     return  ()=>{
       clearInterval(y)
     }
  },[auth])


  async function checkBids() {
    if (!auth || !auth.user) return;
    const res =  await BidsCheck.checkBids({id : auth.user._id})
    console.log('Res Bid Check' , res  );
    
  }

  return (

    <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
        <RequestProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <SocketProvider>
              <LanguageProvider>
                {/* <StatsProvider> */}
                  {/* <UserProvider> */}
                    {/* <DeliveryProvider> */}
                      {/* <ProductProvider> */}
                          {/* <IdentityProvider> */}
                            <AxiosInterceptor>
                              <SettingsProvider>
                                <ThemeProvider>
                                  <ScrollToTop />
                                  <BaseOptionChartStyle />
                                  <Router />
                                  <FloatingAdminChat />
                                </ThemeProvider>
                              </SettingsProvider>
                            </AxiosInterceptor>
                          {/* </IdentityProvider> */}
                      {/* </ProductProvider> */}
                    {/* </DeliveryProvider> */}
                  {/* </UserProvider> */}
                {/* </StatsProvider> */}
              </LanguageProvider>
              </SocketProvider>
           
          </LocalizationProvider>
        </RequestProvider>
    </SnackbarProvider>
    
  );
}
