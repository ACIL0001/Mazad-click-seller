import app from '@/config';

export function loadGoogleMapsScript(params = '&libraries=places&language=fr&region=DZ'): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps already loaded');
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      console.log('Google Maps script already exists, waiting for load...');
      existingScript.addEventListener('load', () => {
        console.log('Google Maps script loaded from existing');
        resolve();
      });
      existingScript.addEventListener('error', (error) => {
        console.error('Google Maps script failed to load from existing:', error);
        reject(new Error('Failed to load Google Maps script'));
      });
      return;
    }

    // Validate API key
    if (!app.googleMapsApiKey || app.googleMapsApiKey === 'your_google_maps_api_key_here') {
      console.error('Google Maps API key not configured');
      reject(new Error('Google Maps API key not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.'));
      return;
    }

    console.log('Loading Google Maps script...');
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = app.getGoogleMapsScriptUrl(params);
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      // Additional check to ensure places library is available
      if (window.google && window.google.maps && window.google.maps.places) {
        resolve();
      } else {
        reject(new Error('Google Maps Places library not available'));
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      reject(new Error('Failed to load Google Maps script. Please check your API key and internet connection.'));
    };
    
    document.head.appendChild(script);
  });
} 