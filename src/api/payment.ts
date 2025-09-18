// Slickpay API v2 configuration (for Algerian payments) - matching provided code
interface SlickpayConfig {
  publicKey: string;
  baseUrl: string;
  isLive: boolean;
}

// Payment provider types - matching provided structure
export type PaymentProvider = 'slickpay';

// Payment status types - matching provided structure
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Payment transaction interface
export interface PaymentTransaction {
  id: string;
  organization_id: string;
  user_id: string;
  payment_id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customer_email: string;
  customer_name?: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Subscription payment interface
export interface SubscriptionPayment {
  organization_id: string;
  user_id: string;
  plan: string;
  duration_months: number;
  total_amount: number;
  payment_method: PaymentProvider;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
}

// Store payment interface (for future use)
export interface StorePayment {
  organization_id: string;
  customer_email: string;
  customer_name?: string;
  amount: number;
  currency: string;
  order_id?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the correct base URL for an organization (subdomain or custom domain)
 * For React app, we'll use current location or environment variables
 */
async function getOrganizationBaseUrl(organizationId: string): Promise<string> {
  // For React app, we don't have dynamic subdomains like Next.js
  // Use the current location or environment variables
  let baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
  
  // Check if we're in development mode (localhost)
  const isLocalhost = baseUrl.includes('localhost') || 
                     import.meta.env.MODE === 'development';
  
  if (isLocalhost) {
    // Use HTTP for localhost development
    baseUrl = baseUrl.replace('https://', 'http://');
  }
  
  console.log('[getOrganizationBaseUrl] Generated base URL:', baseUrl);
  return baseUrl;
}

// ============================================================================
// SLICKPAY PAYMENT FUNCTIONS
// ============================================================================

/**
 * Create a Slickpay payment request - Exact implementation from provided code
 */
export async function createSlickpayPayment(payment: SubscriptionPayment): Promise<{ paymentId: string; redirectUrl: string }> {
  try {
    // Check if demo mode is enabled for local testing
    const demoMode = import.meta.env.VITE_SLICKPAY_DEMO_MODE === 'true';
    
    if (demoMode) {
      console.log('[SlickPay] Demo mode enabled - simulating payment creation');
      const baseUrl = await getOrganizationBaseUrl(payment.organization_id);
      const paymentId = `DEMO${Date.now()}`;
      return {
        paymentId,
        redirectUrl: `${baseUrl}/payment-success?success=true&source=demo&org_id=${encodeURIComponent(payment.organization_id)}&user_id=${encodeURIComponent(payment.user_id)}&plan=${encodeURIComponent(payment.plan)}&duration=${payment.duration_months}&amount=${payment.total_amount}&demo=true&paymentId=${paymentId}`
      };
    }

    // Slickpay API v2 configuration
    const slickpayConfig: SlickpayConfig = {
      publicKey: import.meta.env.VITE_SLICKPAY_PUBLIC_KEY || '54|BZ7F6N4KwSD46GEXToOv3ZBpJpf7WVxnBzK5cOE6',
      baseUrl: import.meta.env.VITE_SLICKPAY_BASE_URL || 'https://devapi.slick-pay.com/api/v2',
      isLive: import.meta.env.VITE_SLICKPAY_TEST_MODE !== 'true',
    };

    // Get the correct base URL for the organization
    const baseUrl = await getOrganizationBaseUrl(payment.organization_id);

    // Create payment request payload according to SlickPay Invoice API
    // Use SlickPay-specific public URL (ngrok for dev, real domain for prod)
    const slickpayUrl = import.meta.env.VITE_SLICKPAY_PUBLIC_URL || import.meta.env.VITE_MAIN_DOMAIN || baseUrl;
    
    // Create a callback URL with payment metadata for verification
    // Use baseUrl to ensure redirect goes to the correct subdomain/custom domain
    const callbackUrl = `${baseUrl}/payment-success?success=true&source=slickpay&org_id=${encodeURIComponent(payment.organization_id)}&user_id=${encodeURIComponent(payment.user_id)}&plan=${encodeURIComponent(payment.plan)}&duration=${payment.duration_months}&amount=${payment.total_amount}`;
      
    // Try multiple payload variations to handle different SlickPay API requirements
    const basePayload = {
      amount: payment.total_amount,
      url: callbackUrl,
      firstname: payment.customer_name?.split(' ')[0] || 'Customer',
      lastname: payment.customer_name?.split(' ').slice(1).join(' ') || 'User',
      email: payment.customer_email,
      address: 'Algeria',
      items: [
        {
          name: `${payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)} Plan Subscription`,
          price: payment.total_amount,
          quantity: 1
        }
      ],
      note: `Subscription: ${payment.plan} plan for ${payment.duration_months} month${payment.duration_months > 1 ? 's' : ''}`
    };

    // Add optional fields if available
    const payload = {
      ...basePayload,
      // Only add webhook if we have a proper domain (not localhost)
      ...(baseUrl.includes('localhost') ? {} : {
        webhook_url: `${baseUrl}/api/webhooks/slickpay`,
        webhook_meta_data: {
          organization_id: payment.organization_id,
          user_id: payment.user_id,
          plan: payment.plan,
          duration_months: payment.duration_months,
          payment_type: 'subscription',
          customer_email: payment.customer_email,
          customer_name: payment.customer_name,
          total_amount: payment.total_amount,
          payment_method: 'slickpay'
        }
      })
    };

    console.log('[SlickPay API Request]', {
      url: `${slickpayConfig.baseUrl}/users/invoices`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${slickpayConfig.publicKey.substring(0, 10)}...`,
      },
      payload
    });

    // Try different SlickPay API endpoints and approaches
    const apiEndpoints = [
      `${slickpayConfig.baseUrl}/users/invoices`,
      `${slickpayConfig.baseUrl}/merchants/invoices`,
      'https://api.slick-pay.com/api/v2/users/invoices',
      'https://devapi.slick-pay.com/api/v2/merchants/invoices'
    ];

    let lastError: Error | null = null;

    for (const apiUrl of apiEndpoints) {
      try {
        console.log(`[SlickPay] Attempting API endpoint: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${slickpayConfig.publicKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`[SlickPay API] ${apiUrl} failed:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });

          // If account not found, try simplified payload
          if (response.status === 422 && errorText.includes('account')) {
            console.log('[SlickPay] Trying simplified payload without optional fields...');
            
            const simplifiedPayload = {
              amount: payment.total_amount,
              url: callbackUrl,
              firstname: payment.customer_name?.split(' ')[0] || 'Customer',
              lastname: payment.customer_name?.split(' ').slice(1).join(' ') || 'User',
              email: payment.customer_email,
              items: [
                {
                  name: `${payment.plan} Plan Subscription`,
                  price: payment.total_amount,
                  quantity: 1
                }
              ]
            };

            const retryResponse = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${slickpayConfig.publicKey}`,
              },
              body: JSON.stringify(simplifiedPayload),
            });

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              console.log('[SlickPay API Response] (simplified):', data);
              
              const redirectUrl = data.url;
              if (!redirectUrl) {
                throw new Error('No payment URL returned from SlickPay');
              }
              
              return {
                paymentId: data.id ? data.id.toString() : `SLICK${Date.now()}`,
                redirectUrl: redirectUrl,
              };
            }
          }

          lastError = new Error(`SlickPay API error: ${response.status} - ${errorText}`);
          continue;
        }

        const data = await response.json();
        console.log('[SlickPay API Response]:', data);
        console.log('[SlickPay] Callback URL sent to SlickPay:', callbackUrl);

        // SlickPay returns different URL structures based on response
        const redirectUrl = data.url;
        
        if (!redirectUrl) {
          console.error('[SlickPay API Error] No redirect URL found in response:', data);
          lastError = new Error('No payment URL returned from SlickPay');
          continue;
        }
        
        console.log('[SlickPay] Using redirect URL:', redirectUrl);
        
        return {
          paymentId: data.id ? data.id.toString() : `SLICK${Date.now()}`,
          redirectUrl: redirectUrl,
        };

      } catch (error) {
        console.warn(`[SlickPay] Error with endpoint ${apiUrl}:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // If all endpoints fail, try direct URL approach for development
    console.warn('[SlickPay] All API endpoints failed, attempting direct URL approach');
    return createSlickpayDirectUrl(payment, callbackUrl);
  } catch (error) {
    console.error('Error creating Slickpay payment:', error);
    throw new Error('Failed to create Slickpay payment');
  }
}

/**
 * Create direct SlickPay URL as fallback when API fails
 */
function createSlickpayDirectUrl(payment: SubscriptionPayment, callbackUrl: string): { paymentId: string; redirectUrl: string } {
  const paymentId = `DIRECT${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  
  // Create a simple test URL that redirects back to success page for development
  const testUrl = new URL(callbackUrl);
  
  // Update the source to indicate this is a direct fallback
  testUrl.searchParams.set('source', 'direct');
  testUrl.searchParams.set('demo', 'true');
  testUrl.searchParams.set('paymentId', paymentId);
  testUrl.searchParams.set('amount', payment.total_amount.toString());
  
  // Ensure all required parameters are present
  if (!testUrl.searchParams.get('success')) {
    testUrl.searchParams.set('success', 'true');
  }
  if (!testUrl.searchParams.get('plan')) {
    testUrl.searchParams.set('plan', payment.plan);
  }
  if (!testUrl.searchParams.get('duration')) {
    testUrl.searchParams.set('duration', payment.duration_months.toString());
  }
  if (!testUrl.searchParams.get('user_id')) {
    testUrl.searchParams.set('user_id', payment.user_id);
  }
  if (!testUrl.searchParams.get('org_id')) {
    testUrl.searchParams.set('org_id', payment.organization_id);
  }
  
  console.log('[SlickPay] Direct URL fallback created');
  console.log('[SlickPay] Payment ID:', paymentId);
  console.log('[SlickPay] Test URL (redirects immediately):', testUrl.toString());
  
  return {
    paymentId: paymentId,
    redirectUrl: testUrl.toString(),
  };
}

/**
 * Verify Slickpay payment status - Exact implementation from provided code
 */
export async function verifySlickpayPayment(paymentId: string): Promise<{ status: PaymentStatus; amount: number; currency: string }> {
  try {
    const slickpayConfig: SlickpayConfig = {
      publicKey: import.meta.env.VITE_SLICKPAY_PUBLIC_KEY || '54|BZ7F6N4KwSD46GEXToOv3ZBpJpf7WVxnBzK5cOE6',
      baseUrl: import.meta.env.VITE_SLICKPAY_BASE_URL || 'https://devapi.slick-pay.com/api/v2',
      isLive: import.meta.env.VITE_SLICKPAY_TEST_MODE !== 'true',
    };

    const response = await fetch(`${slickpayConfig.baseUrl}/users/invoices/${paymentId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${slickpayConfig.publicKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SlickPay API Error]', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Slickpay API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[SlickPay API Response]', data);

    // SlickPay invoice response: {success: 1, completed: 0|1, data: {...}}
    const paymentStatus = data.completed === 1 ? 'completed' : 'pending';
    
    return {
      status: paymentStatus as PaymentStatus,
      amount: data.data?.amount || 0,
      currency: 'DZD',
    };
  } catch (error) {
    console.error('Error verifying Slickpay payment:', error);
    throw new Error('Failed to verify Slickpay payment');
  }
}

/**
 * Map Slickpay status to our payment status
 */
function mapSlickpayStatus(slickpayStatus: string): PaymentStatus {
  switch (slickpayStatus.toLowerCase()) {
    case 'pending':
      return 'pending';
    case 'processing':
      return 'processing';
    case 'completed':
    case 'success':
      return 'completed';
    case 'failed':
    case 'error':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}



// ============================================================================
// SUBSCRIPTION ACTIVATION FUNCTIONS
// ============================================================================

/**
 * Activate subscription after successful payment - Exact implementation from provided code
 */
export async function activateSubscription(
  organizationId: string,
  userId: string,
  plan: string,
  durationMonths: number,
  paymentMethod: 'slickpay' = 'slickpay'
): Promise<void> {
  try {
    console.log(`[activateSubscription] Activating subscription for org: ${organizationId}, user: ${userId}, plan: ${plan}, duration: ${durationMonths} months, payment method: ${paymentMethod}`);
    
    // Calculate subscription end date
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Update user subscription using existing API
    const response = await fetch(`${import.meta.env.VITE_API_URL}users/subscription-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        subscription_plan: plan,
        subscription_status: 'active',
        trial_ends_at: endDate.toISOString(),
        monthly_revenue: 0, // Reset monthly revenue for new subscription
        payment_method: paymentMethod
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[activateSubscription] Error updating user subscription:', errorData);
      throw new Error('Failed to activate subscription');
    }

    const userData = await response.json();
    console.log(`[activateSubscription] User subscription updated successfully:`, userData);

    console.log(`[activateSubscription] Subscription activated successfully for organization: ${organizationId}`);
  } catch (error) {
    console.error('[activateSubscription] Error activating subscription:', error);
    throw new Error('Failed to activate subscription');
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency amount - matching provided code
 */
export function formatCurrency(amount: number, currency: string = 'DZD'): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format price in DZD - utility from provided code
 */
export function formatPrice(amount: number, locale: string = 'fr-DZ'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculate yearly savings - from provided code
 */
export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  return (monthlyPrice * 12) - yearlyPrice;
}

/**
 * Get savings percentage - from provided code
 */
export function getSavingsPercentage(monthlyPrice: number, yearlyPrice: number): number {
  const totalMonthly = monthlyPrice * 12;
  return Math.round(((totalMonthly - yearlyPrice) / totalMonthly) * 100);
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000; // Max 1M
}

/**
 * Generate unique payment ID
 */
export function generatePaymentId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get payment provider display name
 */
export function getPaymentProviderName(provider: PaymentProvider): string {
  switch (provider) {
    case 'slickpay':
      return 'Slickpay';
    default:
      return 'Unknown';
  }
}

/**
 * Get payment status display name
 */
export function getPaymentStatusName(status: PaymentStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

/**
 * Get payment status color for UI - from provided code
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'processing':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Validate subdomain format - from provided code
 */
export function validateSubdomain(subdomain: string): boolean {
  // Only allow alphanumeric characters and hyphens, 3-30 characters
  const regex = /^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$/;
  return regex.test(subdomain.toLowerCase());
}

/**
 * Generate subdomain from organization name - from provided code
 */
export function generateSubdomain(orgName: string): string {
  return orgName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
}

 