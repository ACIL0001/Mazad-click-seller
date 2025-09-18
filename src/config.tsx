const app = {
  name: 'MazadClick',
  pole: 'NotEasy',
  timeout: 15000,
  domain: 'www.mazadclick.com',
  
  // Dynamic URLs based on environment
  socket: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000/',
  route: import.meta.env.VITE_STATIC_URL || "http://localhost:3000/static/",
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/",

  apiKey: '8f2a61c94d7e3b5f9c0a8d2e6b4f1c7a',
  googleMapsApiKey: 'AIzaSyAUCeSWuTshwbTAfmZzk7D3qLdhr-0wRZ4',
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
};

export const API_BASE_URL = app.baseURL;

export default app;
