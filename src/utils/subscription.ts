import { requests } from '../api/utils';

// This file has been updated to match the provided backend files.
// All interfaces and API calls for 'organizations' and detailed usage tracking have been removed
// because corresponding backend endpoints were not found.
// The Plan and Subscription interfaces have been simplified to match the backend schemas.

// Corrected SubscriptionPlan interface based on build errors
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in months
  isActive: boolean;
  role: 'PROFESSIONAL' | 'RESELLER';
  // Added properties based on the TypeScript errors
  display_name: {
    en: string;
    fr: string;
    ar: string;
  };
  sort_order: number;
  max_users: number | null;
  max_monthly_revenue: number | null;
  price_monthly: number;
  features: string[];
}

// Corrected Subscription interface based on build errors
export interface Subscription {
  id: string;
  user: any;
  plan: any;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // Added properties based on the TypeScript errors
  status: 'trial' | 'active' | 'expired';
  trial_ends_at?: Date;
  current_period_end: Date;
  billing_cycle: 'monthly' | 'annually';
}

// Legacy response interfaces for backward compatibility - no changes needed
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
  getPlans: (): Promise<SubscriptionPlan[]> => requests.get('subscription/plans'),

  // Get plans by role - matches backend @Get('plans/:role')
  getPlansByRole: (role: string): Promise<{ success: boolean; plans: any[] }> =>
    requests.get(`subscription/plans/${role}`),

  // Create subscription with payment - matches backend @Post('create-with-payment')
  createSubscriptionWithPayment: (data: { plan: string; returnUrl?: string; paymentMethod?: string }): Promise<CreateSubscriptionResponse> =>
    requests.post('subscription/create-with-payment', data),

  // Get payment status - matches backend @Get('payment/:paymentId/status')
  getPaymentStatus: (paymentId: string): Promise<PaymentStatusResponse> =>
    requests.get(`subscription/payment/${paymentId}/status`),

  // Confirm payment - matches backend @Post('payment/:paymentId/confirm')
  confirmPayment: (paymentId: string): Promise<any> =>
    requests.post(`subscription/payment/${paymentId}/confirm`, {}),

  // Get user's current subscription - matches backend @Get('my-subscription')
  getMySubscription: (): Promise<SubscriptionData> =>
    requests.get('subscription/my-subscription'),

  // Get user's payment history - matches backend @Get('my-payments')
  getMyPayments: (): Promise<any> =>
    requests.get('subscription/my-payments'),

  // CORRECTED: Legacy method now points to the correct backend endpoint
  // Matches backend @Post('set-subscription-plan')
  setSubscriptionPlan: (plan: string): Promise<any> =>
    requests.post('subscription/set-subscription-plan', { plan }),
};

// Functions that were causing the errors
export function isTrialExpired(subscription: Subscription): boolean {
  if (subscription.status !== 'trial' || !subscription.trial_ends_at) {
    return true;
  }
  const now = new Date();
  const trialEnd = new Date(subscription.trial_ends_at);
  return now > trialEnd;
}

export function isSubscriptionActive(subscription: Subscription): boolean {
  if (subscription.status === 'expired') return false;
  if (subscription.status === 'trial') return true;
  const periodEnd = new Date(subscription.current_period_end);
  const now = new Date();
  return now < periodEnd;
}

export function getSubscriptionEndDate(subscription: Subscription): Date {
  if (subscription.status === 'trial' && subscription.trial_ends_at) {
    return new Date(subscription.trial_ends_at);
  }
  return new Date(subscription.current_period_end);
}

export function getSubscriptionPlanName(plan: SubscriptionPlan, locale: 'en' | 'fr' | 'ar' = 'en'): string {
  if (plan.display_name) {
    switch (locale) {
      case 'en':
        return plan.display_name.en;
      case 'ar':
        return plan.display_name.ar;
      case 'fr':
        return plan.display_name.fr;
    }
  }
  return plan.name;
}

export function getSubscriptionStatusColor(status: Subscription['status']): string {
  switch (status) {
    case 'trial':
      return 'secondary';
    case 'active':
      return 'success';
    case 'expired':
      return 'error';
    default:
      return 'default';
  }
}

export function getSubscriptionStatusName(status: Subscription['status'], locale: string = 'fr'): string {
  switch (status) {
    case 'trial':
      return locale === 'fr' ? 'Période d\'essai' : 'Trial Period';
    case 'active':
      return locale === 'fr' ? 'Actif' : 'Active';
    case 'expired':
      return locale === 'fr' ? 'Expiré' : 'Expired';
    default:
      return '';
  }
}

export function getBillingCycleName(cycle: Subscription['billing_cycle'], locale: string = 'fr'): string {
  switch (cycle) {
    case 'monthly':
      return locale === 'fr' ? 'Mensuel' : 'Monthly';
    case 'annually':
      return locale === 'fr' ? 'Annuel' : 'Annually';
    default:
      return '';
  }
}

export function getSubscriptionPlanColor(plan: SubscriptionPlan): string {
  if (plan.name.toLowerCase().includes('pro')) return 'secondary';
  if (plan.name.toLowerCase().includes('enterprise')) return 'info';
  if (plan.name.toLowerCase().includes('trial')) return 'warning';
  return 'default';
}

export function getRecommendedPlans(
  plans: SubscriptionPlan[],
  currentPlan: SubscriptionPlan,
  currentUsage: any,
): SubscriptionPlan[] {
  const suggestedPlans: SubscriptionPlan[] = [];

  plans.forEach((plan) => {
    if (plan.sort_order <= currentPlan.sort_order) return;
    if (
      (plan.max_users === null || (currentUsage.users || 0) <= plan.max_users) &&
      (plan.max_monthly_revenue === null || (currentUsage.revenue || 0) <= plan.max_monthly_revenue)
    ) {
      suggestedPlans.push(plan);
    }
  });
  return suggestedPlans.sort((a, b) => a.price_monthly - b.price_monthly);
}

export function calculateProratedAmount(
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan,
  billingCycle: string,
): number {
  if (billingCycle !== 'monthly') {
    return newPlan.price_monthly;
  }
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const totalDaysInCycle = (endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24);
  const daysUsed = (now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24);
  const currentDailyRate = currentPlan.price_monthly / totalDaysInCycle;
  const newDailyRate = newPlan.price_monthly / totalDaysInCycle;
  const credit = daysUsed * currentDailyRate;
  const newCharge = (totalDaysInCycle - daysUsed) * newDailyRate;
  const proratedAmount = newCharge - credit;
  return Math.max(0, proratedAmount); // Ensure amount is not negative
}

export function getSubscriptionPlanFeatures(plan: SubscriptionPlan): string[] {
  return plan.features || [];
}
