import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import app from '@/config';
import useAuth from '@/hooks/useAuth';
import useRequest from '@/hooks/useRequest';
import { AuthAPI } from './auth';

const instance = axios.create({
  baseURL: app.baseURL,
  timeout: app.timeout,
  headers: { 'x-access-key': app.apiKey },
  withCredentials: true,
});

const response = (res: AxiosResponse) => res.data;

export const requests = {
  get: (url: string) => instance.get(url).then(response),
  post: (url: string, body: {}, returnFullResponse = false) =>
    returnFullResponse ? instance.post(url, body) : instance.post(url, body).then(response),
  put: (url: string, body: {}) => instance.put(url, body).then(response),
  delete: (url: string) => instance.delete(url).then(response),
};

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

// add a subscriber to the queue
const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const AxiosInterceptor = ({ children }: any) => {
  const { isLoading, setLoading } = useRequest();
  const { auth, isLogged, clear, set } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // @request interceptor
    const onRequest = (req: any) => {
      console.log(req.url);
      setLoading(true);

      // client preferred language
      req.headers['accept-language'] = auth.user?.preference?.language || 'FR';

      // Do NOT add Authorization header for public endpoints
      const publicEndpoints = [
        '/otp/confirm-phone',
        '/otp/resend/confirm-phone',
        // add other public endpoints here if needed
      ];
      if (
        isLogged &&
        auth.tokens &&
        !publicEndpoints.some((endpoint) => req.url.includes(endpoint))
      ) {
        if (!req.headers.Authorization) {
          req.headers.Authorization = 'Bearer ' + auth.tokens.accessToken;
          console.log('🔐 AxiosInterceptor - Added Authorization header for:', req.url);
          console.log('🔐 AxiosInterceptor - Token preview:', auth.tokens.accessToken ? auth.tokens.accessToken.substring(0, 20) + '...' : 'none');
        }
      } else {
        console.log('🔐 AxiosInterceptor - No auth token available for:', req.url);
      }

      return req;
    };

    // @response interceptor
    const onReponse = (res: any) => {
      setLoading(false);
      return res;
    };

    // @error interceptor
    const onError = async (error: any) => {
      setLoading(false);
      const originalRequest = error.config;

      // If access token expired and it's not already being refreshed

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;


        if (!isRefreshing) {
          isRefreshing = true;

          try {
            if (!isLogged) {
              isRefreshing = false;
              throw error;
            }


            const refreshToken = auth.tokens.refreshToken;

            const { data: tokens } = await AuthAPI.refresh(refreshToken);

            set({ ...auth, tokens });

            isRefreshing = false;
            onRefreshed(tokens.acessToken); // Notify waiting requests
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return instance(originalRequest); // Retry the original request
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);

            isRefreshing = false;
            onRefreshed(null); // Notify waiting requests of failure

            // Don't clear auth if we're on auth pages or waiting for verification to prevent disrupting login flow
            const isOnAuthPage = typeof window !== 'undefined' && (
              window.location.pathname.includes('/login') ||
              window.location.pathname.includes('/register') ||
              window.location.pathname.includes('/otp-verification') ||
              window.location.pathname.includes('/reset-password') ||
              window.location.pathname.includes('/identity-verification') ||
              window.location.pathname.includes('/subscription-plans') ||
              window.location.pathname.includes('/waiting-for-verification')
            );
            
            if (!isOnAuthPage) {
              clear(); // Log out the user only if not on auth pages
            } else {
              console.log('Token refresh failed during auth flow, not clearing auth to prevent disrupting login');
            }
            
            throw refreshError; // Reject the original request with the error
          }
        }
      }

      // Handle different types of errors
      if (error.response?.status !== 401) {
        console.log('API Error:', error.response);
        
        // Show user-friendly error message
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'un problème est survenu';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        // Network/connection errors
        console.log('Network Error:', error.message);
        enqueueSnackbar('Impossible de se connecter au serveur. Vérifiez votre connexion.', { variant: 'error' });
      }

      // Log error details safely
      if (error.response) {
        console.log('\nStatus : ' + error.response.status + '\n Body : ');
        console.log(error.response.data);
      } else {
        console.log('\nNetwork Error:', error.message);
      }
      
      return Promise.reject(error);

    };

    const responseInterceptor = instance.interceptors.response.use(onReponse, onError);
    const requestInterceptor = instance.interceptors.request.use(onRequest, onError);

    return () => {
      instance.interceptors.response.eject(responseInterceptor);
      instance.interceptors.request.eject(requestInterceptor);
    };

  }, [auth, isLogged]);

  return children;
};

export { AxiosInterceptor };
