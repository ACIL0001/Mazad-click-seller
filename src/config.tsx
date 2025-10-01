const getStorageKey = () => {
  if (typeof window === 'undefined') return 'auth';
  
  const port = window.location.port;
  // Use different storage keys for different ports
  if (port === '3002') return 'auth_seller';
  if (port === '3003') return 'auth_admin';
  return 'auth'; // fallback
};

const app = {
  name: 'MazadClick',
  pole: 'NotEasy',
  timeout: 15000,
  domain: 'www.mazadclick.com',
  
  // Updated to use production server URL
  socket: import.meta.env.VITE_SOCKET_URL || 'https://mazadclick-server.onrender.com/',
  route: import.meta.env.VITE_STATIC_URL || "https://mazadclick-server.onrender.com/static/",
  baseURL: import.meta.env.VITE_API_URL || "https://mazadclick-server.onrender.com/",

  // Development URLs (commented out)
  // socket: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000/',
  // route: import.meta.env.VITE_STATIC_URL || "http://localhost:3000/static/",
  // baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/",

  apiKey: '64d2e8b7c3a9f1e5d8b2a4c6e9f0d3a5',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAUCeSWuTshwbTAfmZzk7D3qLdhr-0wRZ4',
  googleMapsApiUrl: 'https://maps.googleapis.com/maps/api/js',
  getGoogleMapsScriptUrl: (params = '') =>
    `https://maps.googleapis.com/maps/api/js?key=${app.googleMapsApiKey}${params}`,
    
  // SlickPay Configuration - Fixed for API compatibility
  slickPay: {
    baseUrl: import.meta.env.VITE_SLICKPAY_BASE_URL || 'https://devapi.slick-pay.com/api/v2',
    publicKey: import.meta.env.VITE_SLICKPAY_PUBLIC_KEY || '54|BZ7F6N4KwSD46GEXToOv3ZBpJpf7WVxnBzK5cOE6',
    testMode: import.meta.env.VITE_SLICKPAY_TEST_MODE !== 'false',
    demoMode: import.meta.env.VITE_SLICKPAY_DEMO_MODE === 'true',
    publicUrl: import.meta.env.VITE_SLICKPAY_PUBLIC_URL || window.location.origin,
    returnUrl: `${window.location.origin}/payment-success`,
    cancelUrl: `${window.location.origin}/subscription-plans`,
  },
  
  // Export storage key function for auth isolation
  getStorageKey,
};

export const API_BASE_URL = app.baseURL;
export { getStorageKey };

export default app;
