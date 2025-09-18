import { TFunction } from 'i18next';

// Common backend data mappings for translation
const BACKEND_TRANSLATIONS = {
  // Auction statuses
  auctionStatus: {
    'active': 'auctions.status.active',
    'ended': 'auctions.status.ended',
    'pending': 'auctions.status.pending',
    'cancelled': 'auctions.status.cancelled',
    'draft': 'auctions.status.draft'
  },
  
  // Bid statuses
  bidStatus: {
    'active': 'common.status.active',
    'rejected': 'common.status.rejected',
    'accepted': 'common.status.accepted',
    'pending': 'common.status.pending'
  },
  
  // User statuses
  userStatus: {
    'online': 'users.status.online',
    'offline': 'users.status.offline',
    'away': 'users.status.away',
    'busy': 'users.status.busy'
  },
  
  // Order statuses
  orderStatus: {
    'pending': 'orders.status.pending',
    'confirmed': 'orders.status.confirmed',
    'shipped': 'orders.status.shipped',
    'delivered': 'orders.status.delivered',
    'cancelled': 'orders.status.cancelled'
  },
  
  // Auction types
  auctionType: {
    'public': 'auctions.type.public',
    'private': 'auctions.type.private',
    'reserved': 'auctions.type.reserved'
  },
  
  // Bid types
  bidType: {
    'manual': 'auctions.bidType.manual',
    'auto': 'auctions.bidType.auto',
    'proxy': 'auctions.bidType.proxy'
  },
  
  // Notification types
  notificationType: {
    'bid': 'notifications.type.bid',
    'auction': 'notifications.type.auction',
    'message': 'notifications.type.message',
    'system': 'notifications.type.system'
  },
  
  // Gender/sex
  gender: {
    'male': 'common.male',
    'female': 'common.female',
    'other': 'common.other'
  },
  
  // Payment status
  paymentStatus: {
    'pending': 'payment.status.pending',
    'paid': 'payment.status.paid',
    'failed': 'payment.status.failed',
    'refunded': 'payment.status.refunded'
  }
};

/**
 * Translates backend data fields to localized text
 * @param t - Translation function from useTranslation
 * @param fieldType - Type of field to translate (e.g., 'auctionStatus', 'bidType')
 * @param value - The backend value to translate
 * @param fallback - Fallback text if translation not found
 * @returns Translated text or fallback
 */
export function translateBackendData(
  t: TFunction,
  fieldType: keyof typeof BACKEND_TRANSLATIONS,
  value: string,
  fallback?: string
): string {
  if (!value) return fallback || value;
  
  const translations = BACKEND_TRANSLATIONS[fieldType];
  if (!translations) return fallback || value;
  
  const translationKey = translations[value.toLowerCase()];
  if (!translationKey) return fallback || value;
  
  return t(translationKey, { defaultValue: fallback || value });
}

/**
 * Translates an array of backend data objects
 * @param t - Translation function from useTranslation
 * @param data - Array of objects to translate
 * @param fieldMappings - Object mapping field names to their types
 * @returns Array with translated fields
 */
export function translateBackendArray(
  t: TFunction,
  data: any[],
  fieldMappings: Record<string, keyof typeof BACKEND_TRANSLATIONS>
): any[] {
  if (!Array.isArray(data)) return data;
  
  return data.map(item => translateBackendObject(t, item, fieldMappings));
}

/**
 * Translates fields in a backend data object
 * @param t - Translation function from useTranslation
 * @param data - Object to translate
 * @param fieldMappings - Object mapping field names to their types
 * @returns Object with translated fields
 */
export function translateBackendObject(
  t: TFunction,
  data: any,
  fieldMappings: Record<string, keyof typeof BACKEND_TRANSLATIONS>
): any {
  if (!data || typeof data !== 'object') return data;
  
  const translated = { ...data };
  
  Object.entries(fieldMappings).forEach(([fieldName, fieldType]) => {
    if (translated[fieldName]) {
      translated[fieldName] = translateBackendData(t, fieldType, translated[fieldName], translated[fieldName]);
    }
  });
  
  return translated;
}

/**
 * Gets translation key for a backend value
 * @param fieldType - Type of field
 * @param value - Backend value
 * @returns Translation key or null
 */
export function getBackendTranslationKey(
  fieldType: keyof typeof BACKEND_TRANSLATIONS,
  value: string
): string | null {
  const translations = BACKEND_TRANSLATIONS[fieldType];
  if (!translations) return null;
  
  return translations[value.toLowerCase()] || null;
} 