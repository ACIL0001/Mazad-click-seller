import app from '@/config';

export function loadGoogleMapsScript(params = '&libraries=places&language=fr&region=DZ'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      resolve();
      return;
    }
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject());
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = app.getGoogleMapsScriptUrl(params);
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
} 