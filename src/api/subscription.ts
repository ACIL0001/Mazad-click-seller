import { requests } from './utils';

// Subscription plan interface - matching the provided backend Plan schema
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in months
  isActive: boolean;
  role: 'PROFESSIONAL' | 'RESELLER';
  benefits?: string[];
}

// Subscription interface - matching the provided backend Subscription schema
export interface Subscription {
  id: string;
  user: string;
  plan: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Response interfaces
export interface CreateSubscriptionResponse {
  success: boolean;
  message: string;
  subscription: any;
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentUrl: string;
    expiresAt: string;
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    subscriptionPlan: string;
    completedAt?: string;
    expiresAt: string;
  };
}

export interface SubscriptionData {
  success: boolean;
  subscription?: any;
  hasActiveSubscription: boolean;
}

export const SubscriptionAPI = {
  // Get available subscription plans - matches backend @Get('plans')
  getPlans: (): Promise<SubscriptionPlan[]> => {
    console.log('🔍 SubscriptionAPI.getPlans called');
    return requests.get('subscription/plans')
      .then(result => {
        console.log('✅ getPlans result:', result);
        return result;
      })
      .catch(error => {
        console.error('❌ getPlans error:', error);
        throw error;
      });
  },
  
  // Get plans by role - matches backend @Get('plans/:role')
  getPlansByRole: (role: string): Promise<{ success: boolean; plans: any[] }> => {
    console.log('🔍 SubscriptionAPI.getPlansByRole called with role:', role);
    return requests.get(`subscription/plans/${role}`)
      .then(result => {
        console.log('✅ getPlansByRole result:', result);
        return result;
      })
      .catch(error => {
        console.error('❌ getPlansByRole error:', error);
        throw error;
      });
  },
  
  // Create subscription with payment - matches backend @Post('create-with-payment')
  createSubscriptionWithPayment: (data: { plan: string; returnUrl?: string; paymentMethod?: string }): Promise<CreateSubscriptionResponse> => {
    console.log('🎯 SubscriptionAPI.createSubscriptionWithPayment called with data:', data);
    
    // Validate input data
    if (!data.plan) {
      console.error('❌ Missing plan in request data');
      throw new Error('Plan ID is required');
    }
    
    // Simple payload that matches backend controller expectation
    const payload = {
      plan: data.plan,
      returnUrl: data.returnUrl || `${window.location.origin}/payment-success`,
      paymentMethod: data.paymentMethod || 'cib'
    };
    
    console.log('📤 Sending payload to backend:', payload);
    console.log('🌐 Request URL: subscription/create-with-payment');
    
    return requests.post('subscription/create-with-payment', payload)
      .then(response => {
        console.log('✅ createSubscriptionWithPayment response:', response);
        
        // Validate response structure
        if (!response) {
          throw new Error('Empty response from server');
        }
        
        if (!response.success) {
          throw new Error(response.message || 'Server returned success: false');
        }
        
        if (!response.subscription) {
          console.warn('⚠️ No subscription object in response');
        }
        
        if (!response.payment) {
          console.warn('⚠️ No payment object in response');
        }
        
        return response;
      })
      .catch(error => {
        console.error('❌ createSubscriptionWithPayment error:', error);
        
        // Enhanced error logging
        if (error.response) {
          console.error('📡 Server response status:', error.response.status);
          console.error('📡 Server response data:', error.response.data);
          console.error('📡 Server response headers:', error.response.headers);
        } else if (error.request) {
          console.error('📡 No response received:', error.request);
        } else {
          console.error('📡 Request setup error:', error.message);
        }
        
        throw error;
      });
  },
  
  // Get payment status - matches backend @Get('payment/:paymentId/status')
  getPaymentStatus: (paymentId: string): Promise<PaymentStatusResponse> => {
    console.log('🔍 SubscriptionAPI.getPaymentStatus called with paymentId:', paymentId);
    return requests.get(`subscription/payment/${paymentId}/status`)
      .then(result => {
        console.log('✅ getPaymentStatus result:', result);
        return result;
      })
      .catch(error => {
        console.error('❌ getPaymentStatus error:', error);
        throw error;
      });
  },
  
  // Confirm payment - matches backend @Post('payment/:paymentId/confirm')
  confirmPayment: (paymentId: string): Promise<any> => {
    console.log('🔍 SubscriptionAPI.confirmPayment called with paymentId:', paymentId);
    return requests.post(`subscription/payment/${paymentId}/confirm`, {})
      .then(result => {
        console.log('✅ confirmPayment result:', result);
        return result;
      })
      .catch(error => {
        console.error('❌ confirmPayment error:', error);
        throw error;
      });
  },
  
  // Get user's current subscription - matches backend @Get('my-subscription')
  getMySubscription: (): Promise<SubscriptionData> => {
    console.log('🔍 SubscriptionAPI.getMySubscription called');
    return requests.get('subscription/my-subscription')
      .then(result => {
        console.log('✅ getMySubscription result:', result);
        return result;
      })
      .catch(error => {
        console.error('❌ getMySubscription error:', error);
        throw error;
      });
  },
  
  // Get user's payment history - matches backend @Get('my-payments')
  getMyPayments: (): Promise<any> => {
    console.log('🔍 SubscriptionAPI.getMyPayments called');
    return requests.get('subscription/my-payments')
      .then(result => {
        console.log('✅ getMyPayments result:', result);
        return result;
      })
      .catch(error => {
        console.error('❌ getMyPayments error:', error);
        throw error;
      });
  },
  
  // Legacy method - matches backend @Post('set-subscription-plan')
  setSubscriptionPlan: (plan: string): Promise<any> => {
    console.log('🔍 SubscriptionAPI.setSubscriptionPlan called with plan:', plan);
    return requests.post('subscription/set-subscription-plan', { plan })
      .then(result => {
        console.log('✅ setSubscriptionPlan result:', result);
        return result;
      })
      .catch(error => {
        console.error('❌ setSubscriptionPlan error:', error);
        throw error;
      });
  },
};