/**
 * Payment utilities for handling SATIM payment errors and alternatives
 */

export interface PaymentError {
  type: 'forbidden' | 'network' | 'timeout' | 'unknown';
  message: string;
  originalUrl?: string;
  paymentId?: string;
}

export interface AlternativePaymentOption {
  url: string;
  label: string;
  description: string;
}

/**
 * Handle 403 Forbidden error from SATIM payment gateway
 */
export const handleSatimForbiddenError = (paymentId: string): void => {
  console.log('Handling SATIM 403 Forbidden error for payment:', paymentId);
  
  // Get stored payment info
  const storedPayment = localStorage.getItem('pendingPayment');
  if (!storedPayment) {
    console.error('No stored payment info found');
    window.location.href = '/subscription/payment/error';
    return;
  }

  const paymentInfo = JSON.parse(storedPayment);
  const alternativeUrls = paymentInfo.alternativeUrls || [];

  console.log('Alternative URLs available:', alternativeUrls.length);

  // If we have alternative URLs, redirect to the forbidden handler
  if (alternativeUrls.length > 0) {
    console.log('Redirecting to forbidden handler with alternatives');
    // window.location.href = `http://localhost:3000/subscription/payment/satim-forbidden/${paymentId}`;
    window.location.href = `https://mazadclick-server.onrender.com/subscription/payment/satim-forbidden/${paymentId}`;
    return;
  }

  // No alternatives available, redirect to error page
  console.log('No alternatives available - redirecting to error page');
  window.location.href = '/subscription/payment/error';
};

/**
 * Check if current URL is a SATIM payment URL
 */
export const isSatimPaymentUrl = (url: string): boolean => {
  const satimDomains = [
    'cib.satim.dz',
    'satim.dz',
    'test.satim.dz',
    'sandbox.satim.dz',
    'pay.satim.dz',
    'secure.satim.dz'
  ];
  
  return satimDomains.some(domain => url.includes(domain));
};

/**
 * Detect 403 Forbidden error from SATIM
 */
export const detectSatimForbiddenError = (): boolean => {
  // Check if we're on a SATIM domain and getting forbidden error
  if (isSatimPaymentUrl(window.location.href)) {
    const pageContent = document.body.innerText.toLowerCase();
    return pageContent.includes('forbidden') || pageContent.includes('403');
  }
  return false;
};

/**
 * Auto-handle SATIM forbidden errors
 */
export const autoHandleSatimErrors = (): void => {
  // Check if we're on a SATIM payment page with forbidden error
  if (detectSatimForbiddenError()) {
    console.log('Auto-detected SATIM 403 Forbidden error');
    
    // Get payment ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const mdOrder = urlParams.get('mdOrder');
    
    if (mdOrder) {
      // Try to find payment by mdOrder in localStorage
      const storedPayment = localStorage.getItem('pendingPayment');
      if (storedPayment) {
        const paymentInfo = JSON.parse(storedPayment);
        handleSatimForbiddenError(paymentInfo.paymentId);
        return;
      }
    }
    
    // Fallback to error page
    window.location.href = '/subscription/payment/error';
  }
};

/**
 * Initialize payment error handling
 */
export const initializePaymentErrorHandling = (): void => {
  // Run auto-detection when page loads
  if (typeof window !== 'undefined') {
    // Small delay to ensure page is fully loaded
    setTimeout(autoHandleSatimErrors, 1000);
    
    // Also check on page visibility change (in case of redirects)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(autoHandleSatimErrors, 500);
      }
    });
  }
};

/**
 * Get alternative payment options for a payment
 */
export const getAlternativePaymentOptions = (paymentId: string): Promise<AlternativePaymentOption[]> => {
  // return fetch(`http://localhost:3000/subscription/payment/satim-forbidden/${paymentId}`)
  return fetch(`https://mazadclick-server.onrender.com/subscription/payment/satim-forbidden/${paymentId}`)
    .then(response => response.text())
    .then(html => {
      // Parse the HTML to extract alternative URLs
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const urlItems = doc.querySelectorAll('.url-item');
      
      return Array.from(urlItems).map((item, index) => ({
        url: item.getAttribute('onclick')?.match(/window\.location\.href='([^']+)'/)?.[1] || '',
        label: `Alternative Payment Gateway ${index + 1}`,
        description: 'Click to try this payment option'
      })).filter(option => option.url);
    })
    .catch(error => {
      console.error('Error fetching alternative payment options:', error);
      return [];
    });
}; 