# SATIM Edahabia Payment Integration

This document explains the implementation of SATIM Edahabia card payment integration alongside the existing SlickPay system.

## Overview

The application now supports two payment methods:
1. **SlickPay** - Credit/Debit card payments via SlickPay's merchant invoice API
2. **SATIM Edahabia** - Direct Edahabia card payments via SATIM's payment gateway

## Payment Method Differences

### SlickPay Integration
- **Primary**: Uses SlickPay's Merchant Invoice API (`https://devapi.slick-pay.com/api/v2/merchants/invoices`)
- **Fallback**: Direct SATIM SlickPay URL method (`https://satim.slick-pay.com/`)
- Requires API authentication with Bearer token (for API method)
- Creates payment invoices through REST API calls or direct URL parameters
- Supports credit/debit cards through SATIM network
- Returns real SATIM payment interface for testing

### SATIM Edahabia Integration  
- Direct integration with SATIM's payment gateway
- URL-based payment initiation
- Specifically designed for Edahabia cards
- Uses SATIM's direct payment parameters

## Features Implemented

### 1. Environment Configuration
- Added SATIM direct payment environment variables
- Support for sandbox/test mode configuration
- Separate configuration for SlickPay and SATIM direct payments

### 2. Payment API Enhancement
- Extended payment provider types to include 'satim-edahabia'
- Added `createSatimEdahabiaPayment()` function
- Added `verifySatimEdahabiaPayment()` function
- Updated utility functions to support both payment methods

### 3. UI Updates
- Added Edahabia payment method card in PaymentMethodSelection
- Updated payment flow to handle both payment types
- Improved user experience with method-specific messaging
- Added distinctive visual styling for each payment method

## Configuration

### Environment Variables

Create a `.env` file in the seller directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/
VITE_SOCKET_URL=http://localhost:3000/
VITE_STATIC_URL=http://localhost:3000/static/
VITE_BUYER_URL=http://localhost:3001

# SlickPay Configuration (API-based payment system)
VITE_SLICKPAY_PUBLIC_KEY=54|BZ7F6N4KwSD46GEXToOv3ZBpJpf7WVxnBzK5cOE6
VITE_SLICKPAY_SANDBOX=true

# SATIM Direct Payment Configuration (for Edahabia cards)
VITE_SATIM_BASE_URL=https://test-payment.satim.dz/
VITE_SATIM_MERCHANT_ID=your_satim_merchant_id_here
VITE_SATIM_API_KEY=your_satim_api_key_here
VITE_SATIM_SANDBOX=true
```

### SlickPay API Authentication

SlickPay uses Bearer token authentication with your public key:
- **Test Public Key**: `54|BZ7F6N4KwSD46GEXToOv3ZBpJpf7WVxnBzK5cOE6` (provided in documentation)
- **API Endpoints**: 
  - Sandbox: `https://devapi.slick-pay.com/api/v2/`
  - Production: `https://api.slick-pay.com/api/v2/`
- **Authentication Header**: `Authorization: Bearer YOUR_PUBLIC_KEY`

### Production Configuration

For production, update the environment variables:
- Set `VITE_SLICKPAY_SANDBOX=false`
- Set `VITE_SATIM_SANDBOX=false`
- Update `VITE_SATIM_BASE_URL` to production URL
- Use real merchant IDs and API keys

## How It Works

### Payment Flow

1. **User selects payment method** on PaymentMethodSelection page
2. **System creates payment request** based on selected method:
   - SlickPay: Uses `createSlickpayPayment()` with merchant invoice API
   - SATIM Edahabia: Uses `createSatimEdahabiaPayment()` with direct URL method
3. **User is redirected** to the respective payment gateway
4. **After payment**, user is redirected back with payment status
5. **System verifies payment** and activates subscription

### SlickPay Integration Details

The SlickPay integration uses the **Merchant Invoice API**:
- Makes POST request to `/merchants/invoices` endpoint
- Sends invoice data with customer information and items
- Receives payment URL from API response
- Supports all major credit/debit cards through SATIM network
- Uses Bearer token authentication with public key

### SATIM Edahabia Integration Details

The SATIM Edahabia integration:
- Generates unique payment IDs with "SATIM" prefix
- Converts amounts to centimes (SATIM requirement)
- Sets payment method to 'edahabia'
- Configures French language interface
- Handles test mode vs production mode
- Creates proper success/failure/cancel URLs

### SlickPay Invoice Parameters

For SlickPay merchant invoices, the following data is sent to the API:
- `amount`: Total amount in DZD
- `name`: Customer name
- `phone`: Customer phone number
- `address`: Customer address (default: "Address not provided")
- `url`: Success callback URL
- `items`: Array of items with name, price, and quantity

### SATIM Edahabia Payment Parameters

For SATIM Edahabia payments, the following parameters are sent:
- `merchant_id`: Your SATIM merchant ID
- `order_id`: Unique payment identifier
- `amount`: Amount in centimes (DZD)
- `currency`: Always "DZD"
- `payment_method`: "edahabia"
- `description`: Subscription description
- `customer_*`: Customer information
- `success_url`/`failure_url`/`cancel_url`: Callback URLs
- `language`: "fr" for French interface
- `test_mode`: "1" for test, "0" for production

## Testing

### Development Testing with Real SATIM Interfaces

1. **Setup environment**:
   ```bash
   cd seller
   cp env.example .env
   # Edit .env with your test credentials (optional - test values provided)
   ```

2. **Start the application**:
   ```bash
   npm install
   npm run dev
   ```

3. **Test SlickPay payment flow**:
   - Navigate to subscription plans
   - Select a plan
   - Choose "Paiement par Carte Bancaire (SlickPay)"
   - Click "Procéder au paiement"
   - **You will be redirected to real SATIM SlickPay test interface**
   - Test with real credit/debit card flows in SATIM environment

4. **Test SATIM Edahabia payment flow**:
   - Navigate to subscription plans
   - Select a plan  
   - Choose "Carte Edahabia (SATIM)"
   - Click "Procéder au paiement"
   - **You will be redirected to real SATIM Edahabia test interface**
   - Test with real Edahabia card flows in SATIM environment

### What You'll See in Development

- **Real SATIM payment screens** for both SlickPay and Edahabia
- **Actual payment forms** where you can test card details
- **Real payment processing flow** (in test mode)
- **Callback handling** back to your application after payment
- **No automatic success** - you control the payment testing manually

### Test Credentials

For SATIM testing, you'll need:
- Test merchant ID from SATIM
- Test API key from SATIM
- Access to SATIM's test environment

Contact SATIM support to obtain test credentials.

## SATIM Integration References

Based on SATIM's official documentation and services:
- **Website**: https://www.satim.dz/
- **Services**: Interbank payment system for Algeria
- **Supported Cards**: CIB, Edahabia
- **Security**: 3D Secure, EMV compliance
- **Features**: Online payments, fraud management

## Code Structure

### Key Files Modified

1. **`seller/env.example`** - Added SATIM environment variables
2. **`seller/src/api/payment.ts`** - Added SATIM payment functions
3. **`seller/src/pages/PaymentMethodSelection.tsx`** - Added Edahabia option

### New Functions Added

- `createSatimEdahabiaPayment()` - Creates SATIM payment request
- `verifySatimEdahabiaPayment()` - Verifies payment status
- `mapSatimStatus()` - Maps SATIM status to internal status
- Updated `getPaymentProviderName()` - Supports SATIM provider

## Security Considerations

1. **Environment Variables**: Keep API keys secure and never commit them
2. **Test Mode**: Always use sandbox mode for development
3. **URL Validation**: Verify callback URLs in production
4. **Payment Verification**: Always verify payments server-side
5. **Error Handling**: Implement proper error handling for failed payments

## Troubleshooting

### Common Issues

1. **SlickPay API not accessible (ERR_NAME_NOT_RESOLVED)**:
   - **Solution**: The system now redirects to real SATIM SlickPay test interface
   - **What happens**: When SlickPay API is unavailable, the system uses direct SATIM SlickPay URL method
   - **For development**: You can test with the real SATIM payment interface at `https://satim.slick-pay.com/`
   - **Note**: SlickPay recently updated their platform (as mentioned in their [LinkedIn updates](https://www.linkedin.com/company/slick-pay))

2. **Payment URL not loading**:
   - Check SATIM environment variables
   - Verify SATIM base URL is correct
   - Ensure merchant ID is valid

3. **Payment fails immediately**:
   - Check amount format (must be positive)
   - Verify customer information is provided
   - Check test mode configuration

4. **Callback not working**:
   - Verify success/failure URLs are accessible
   - Check URL parameters in callback
   - Ensure proper URL encoding

### Debug Mode

Enable console logging to debug payment issues:
```javascript
console.log('[SATIM Edahabia] Payment parameters:', paymentParams);
console.log('[SATIM Edahabia] Generated payment URL:', satimUrl.toString());
```

## Next Steps

1. **Obtain SATIM credentials** for testing
2. **Test payment flow** with real SATIM test environment
3. **Implement payment verification** server-side
4. **Add payment status handling** in success/failure pages
5. **Configure production environment** when ready

## Support

For SATIM-specific issues:
- **Email**: satim@satim.dz
- **Phone**: +213 (21) 99 49 00
- **Address**: 33, Route de Ouled Fayet, Chéraga - Alger

For SlickPay integration:
- Refer to existing SlickPay documentation
- Use existing SlickPay test credentials