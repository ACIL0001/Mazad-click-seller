import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import app from '@/config';
import useAuth from '@/hooks/useAuth';
import useRequest from '@/hooks/useRequest';
import { AuthAPI } from './auth';
import { authStore } from '@/contexts/authStore';

const instance = axios.create({
  baseURL: app.baseURL,
  timeout: app.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// CRITICAL: Global request interceptor that ALWAYS runs before any request
instance.interceptors.request.use(
  (config) => {
    // Get the LATEST auth state directly from the store
    const state = authStore.getState();
    const { auth, isLogged } = state;
    
    console.log('🔍 Request Interceptor:', {
      url: config.url,
      method: config.method,
      isLogged,
      hasToken: !!auth?.tokens?.accessToken,
      tokenPreview: auth?.tokens?.accessToken ? auth.tokens.accessToken.substring(0, 20) + '...' : 'none'
    });
    
    // Public endpoints that don't need auth (with specific HTTP methods)
    const publicEndpoints = [
      { path: '/auth/signin', methods: ['POST'] },
      { path: '/auth/signup', methods: ['POST'] },
      { path: '/auth/refresh', methods: ['PUT'] },
      { path: '/auth/exists', methods: ['GET'] },
      { path: '/auth/2factor', methods: ['GET', 'POST'] },
      { path: '/auth/reset-password', methods: ['POST'] },
      { path: '/otp/confirm-phone', methods: ['POST'] },
      { path: '/otp/resend/confirm-phone', methods: ['POST'] },
      { path: '/tender', methods: ['GET'] }, // Only GET is public for browsing tenders
      { path: '/terms/public', methods: ['GET'] },
      { path: '/terms/latest', methods: ['GET'] },
    ];

    // Normalize URL to pathname for robust matching regardless of baseURL or absolute/relative usage
    const getPathname = (u?: string) => {
      if (!u) return '';
      try {
        // If it's a full URL, URL() will parse it; otherwise, fall back to building with baseURL
        const full = u.startsWith('http') ? new URL(u) : new URL(u, app.baseURL);
        return full.pathname;
      } catch {
        return u; // best effort fallback
      }
    };
    const pathname = getPathname(config.url);
    const method = config.method?.toUpperCase();
    const isPublicEndpoint = publicEndpoints.some((endpoint) => 
      pathname === endpoint.path && 
      endpoint.methods.includes(method || 'GET')
    );
    
    // Add API key for ALL requests (required by SellerGuard)
    // Use lowercase header name to match server expectations
    if (app.apiKey) {
      config.headers['x-access-key'] = app.apiKey;
      console.log('✅ API Key attached to:', config.url, {
        headerName: 'x-access-key',
        hasKey: !!app.apiKey,
        keyPreview: app.apiKey ? app.apiKey.substring(0, 10) + '...' : 'none'
      });
    } else {
      console.warn('⚠️ No API key configured for request:', config.url);
    }
    
    // Add token for ALL requests except public endpoints
    if (!isPublicEndpoint) {
      if (isLogged && auth?.tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${auth.tokens.accessToken}`;
        console.log('✅ Token attached to:', config.url);
      } else {
        console.warn('⚠️ No token available for:', config.url, {
          isLogged,
          hasToken: !!auth?.tokens?.accessToken
        });
      }
    }
    
    // Set language header
    if (auth?.user?.preference?.language) {
      config.headers['accept-language'] = auth.user.preference.language;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

const response = (res: AxiosResponse) => res.data;

// Updated requests utility to support headers and config
export const requests = {
  get: (url: string, config?: any) => instance.get(url, config).then(response),
  post: (url: string, body: {}, returnFullResponse = false, config?: any) =>
    returnFullResponse ? instance.post(url, body, config) : instance.post(url, body, config).then(response),
  put: (url: string, body: {}, config?: any) => instance.put(url, body, config).then(response),
  delete: (url: string, config?: any) => instance.delete(url, config).then(response),
};

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

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
    const onRequest = (req: any) => {
      console.log('📤', req.url);
      setLoading(true);
      return req;
    };

    const onResponse = (res: any) => {
      setLoading(false);
      return res;
    };

    const onError = async (error: any) => {
      setLoading(false);
      const originalRequest = error.config;

      // === START FIX: Define pathname and public endpoints with methods ===
      const reqUrl = originalRequest?.url as string | undefined;
      const getPathname = (u?: string) => {
        if (!u) return '';
        try {
          const full = u.startsWith('http') ? new URL(u) : new URL(u, app.baseURL);
          return full.pathname;
        } catch {
          return u;
        }
      };
      const pathname = getPathname(reqUrl);
      const method = originalRequest?.method?.toUpperCase();
      
      const publicEndpoints = [
        { path: '/auth/signin', methods: ['POST'] },
        { path: '/auth/signup', methods: ['POST'] },
        { path: '/auth/refresh', methods: ['PUT'] },
        { path: '/auth/exists', methods: ['GET'] },
        { path: '/auth/2factor', methods: ['GET', 'POST'] },
        { path: '/auth/reset-password', methods: ['POST'] },
        { path: '/otp/confirm-phone', methods: ['POST'] },
        { path: '/otp/resend/confirm-phone', methods: ['POST'] },
        { path: '/tender', methods: ['GET'] }, // Only GET is public for browsing tenders
        { path: '/terms/public', methods: ['GET'] },
        { path: '/terms/latest', methods: ['GET'] },
      ];
      const isPublicEndpoint = publicEndpoints.some((endpoint) => 
        pathname === endpoint.path && 
        endpoint.methods.includes(method || 'GET')
      );
      // === END FIX ===

      // Only log non-network errors to reduce console spam
      if (error.code !== 'ERR_NETWORK') {
        const isTermsEndpoint = pathname.startsWith('/terms/'); // Use pathname from above
        const is404 = error.response?.status === 404;
        // Suppress console error for expected 404 on public terms endpoints
        if (!(isTermsEndpoint && is404)) {
          console.error('❌ Response error:', {
            url: reqUrl,
            status: error.response?.status,
            message: error.message
          });
        }
      }

      // === START FIX: Modified 401 check with method-aware public endpoints ===
      // Handle 401 Unauthorized - token refresh
      // Only retry if it's 401, not already retried, AND not a public endpoint
      if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      // === END FIX ===
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            // Get fresh state from store
            const currentState = authStore.getState();
            const { auth: currentAuth, isLogged: currentIsLogged } = currentState;
            
            if (!currentIsLogged || !currentAuth.tokens?.refreshToken) {
              console.log('❌ No refresh token available');
              isRefreshing = false;
              throw error;
            }

            console.log('🔄 Attempting token refresh...');
            const refreshToken = currentAuth.tokens.refreshToken;
            const newTokens = await AuthAPI.refresh(refreshToken);

            // Update auth store with new tokens
            set({ ...currentAuth, tokens: newTokens });

            isRefreshing = false;
            onRefreshed(newTokens.accessToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            console.log('✅ Token refreshed, retrying request');
            return instance(originalRequest);
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            isRefreshing = false;
            onRefreshed(null);

            // Check if we're on auth pages
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
              clear();
              enqueueSnackbar('Session expired. Please login again.', { variant: 'warning' });
            }
            
            throw refreshError;
          }
        } else {
          // Wait for ongoing refresh
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((token: string | null) => {
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(instance(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }
      }

      // Handle timeout errors - only log to console, no snackbar
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('⏰ Request timeout (15000ms):', error.message);
        console.error('Request URL:', error.config?.url);
        console.error('Request method:', error.config?.method);
        // No snackbar for timeout errors - only console logging
        return Promise.reject(error);
      }

      // Handle other errors
      if (error.response?.status === 500) {
        console.error('🚨 Internal Server Error:', error.response.data);
        enqueueSnackbar('Erreur interne du serveur. Veuillez réessayer plus tard.', { variant: 'error' });
      } else if (error.response?.status === 404) {
        // Check if it's a terms endpoint - these are expected to return 404 when no terms exist
        const isTermsEndpoint = pathname.startsWith('/terms/'); // Use pathname from above
        if (!isTermsEndpoint) {
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Ressource non trouvée';
          enqueueSnackbar(errorMessage, { variant: 'error' });
        }
        // For terms endpoints, silently handle 404 (no terms exist yet)
      } else if (error.response?.status !== 401) {
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'un problème est survenu';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } else if (error.code === 'ERR_NETWORK') {
        // Only show network error snackbar for non-public endpoints
        // === START FIX: Use isPublicEndpoint from above ===
        if (!isPublicEndpoint) {
        // === END FIX ===
          enqueueSnackbar('Impossible de se connecter au serveur. Vérifiez votre connexion.', { variant: 'error' });
        }
      }

      if (error.response) {
        console.log('\nStatus : ' + error.response.status + '\n Body : ');
        console.log(error.response.data);
      } else {
        console.log('\nNetwork Error:', error.message);
      }
      
      return Promise.reject(error);
    };

    const responseInterceptor = instance.interceptors.response.use(onResponse, onError);
    const requestInterceptor = instance.interceptors.request.use(onRequest, onError);

    return () => {
      instance.interceptors.response.eject(responseInterceptor);
      instance.interceptors.request.eject(requestInterceptor);
    };

  }, [auth, isLogged, set, clear, enqueueSnackbar, setLoading]);

  return children;
};

export { AxiosInterceptor, instance };