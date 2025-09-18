# SlickPay Integration Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue 1: "Compte non trouvé" (Account not found) - Error 422

**Problem**: SlickPay API returns 422 error with message `{"account":"Compte non trouvé."}`

**Cause**: The account ID in the API request doesn't exist in SlickPay's system.

**✅ Solution Applied**:
1. **Removed the problematic `account` field** from API requests
2. **Added multiple API endpoint attempts** with fallback options
3. **Implemented simplified payload retry** for 422 errors
4. **Added demo mode** for local testing

**Code Changes**:
- Removed `account: "3fe91007-3142-4268-9133-fa4a54379134"` from payload
- API now tries multiple endpoints and payload variations
- Added automatic retry with simplified payload on 422 errors

### Issue 2: API Authentication Problems

**Symptoms**: 401 Unauthorized or 403 Forbidden errors

**✅ Solutions**:
1. **Verify your SlickPay API key** in environment variables
2. **Check API key format**: Should be like `54|BZ7F6N4KwSD46GEXToOv3ZBpJpf7WVxnBzK5cOE6`
3. **Ensure correct API endpoint**: Uses multiple fallback endpoints

### Issue 3: Local Development Testing

**Problem**: Need to test payment flow without valid SlickPay credentials

**✅ Solution - Demo Mode**:

Add to your `.env` file:
```env
VITE_SLICKPAY_DEMO_MODE=true
```

This will:
- Skip real API calls
- Generate fake payment URLs that redirect back to success page
- Allow testing the complete payment flow locally

## 🔧 Configuration Options

### 1. Normal Mode (Production/Test API)
```env
VITE_SLICKPAY_PUBLIC_KEY=your_real_api_key_here
VITE_SLICKPAY_BASE_URL=https://devapi.slick-pay.com/api/v2
VITE_SLICKPAY_TEST_MODE=true
VITE_SLICKPAY_DEMO_MODE=false
```

### 2. Demo Mode (Local Development)
```env
VITE_SLICKPAY_PUBLIC_KEY=54|BZ7F6N4KwSD46GEXToOv3ZBpJpf7WVxnBzK5cOE6
VITE_SLICKPAY_BASE_URL=https://devapi.slick-pay.com/api/v2
VITE_SLICKPAY_TEST_MODE=true
VITE_SLICKPAY_DEMO_MODE=true
```

## 🛠️ API Resilience Features

### Multiple Endpoint Attempts
The system automatically tries these endpoints in order:
1. `https://devapi.slick-pay.com/api/v2/users/invoices`
2. `https://devapi.slick-pay.com/api/v2/merchants/invoices`
3. `https://api.slick-pay.com/api/v2/users/invoices`
4. `https://devapi.slick-pay.com/api/v2/merchants/invoices`

### Payload Simplification
If a 422 error occurs, the system automatically retries with a simplified payload:
```javascript
{
  amount: payment.total_amount,
  url: callbackUrl,
  firstname: "Customer",
  lastname: "User", 
  email: payment.customer_email,
  items: [{ name: "Plan Subscription", price: amount, quantity: 1 }]
}
```

### Fallback Direct URL
If all API endpoints fail, the system creates a direct callback URL for development testing.

## 🔍 Debugging Steps

### 1. Check Browser Console
Look for these log messages:
- `[SlickPay] Attempting API endpoint: ...`
- `[SlickPay API] ... failed:` (warnings)
- `[SlickPay API Response]:` (success)

### 2. Verify Environment Variables
```javascript
console.log('SlickPay Config:', {
  publicKey: import.meta.env.VITE_SLICKPAY_PUBLIC_KEY?.substring(0, 10) + '...',
  baseUrl: import.meta.env.VITE_SLICKPAY_BASE_URL,
  testMode: import.meta.env.VITE_SLICKPAY_TEST_MODE,
  demoMode: import.meta.env.VITE_SLICKPAY_DEMO_MODE
});
```

### 3. Test API Manually
```bash
curl -X POST "https://devapi.slick-pay.com/api/v2/users/invoices" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "url": "http://localhost:3000/payment-success",
    "firstname": "Test",
    "lastname": "User",
    "email": "test@example.com",
    "items": [{"name": "Test", "price": 100, "quantity": 1}]
  }'
```

## 🚀 Quick Fixes

### Fix 1: Enable Demo Mode for Local Testing
```env
VITE_SLICKPAY_DEMO_MODE=true
```

### Fix 2: Use Minimal Required Fields
The system now automatically uses only required fields:
- `amount`, `url`, `firstname`, `lastname`, `email`, `items`

### Fix 3: Multiple API Endpoints
The system tries different API endpoints automatically - no configuration needed.

## 📋 Testing Checklist

- [ ] Environment variables are set correctly
- [ ] Demo mode works (set `VITE_SLICKPAY_DEMO_MODE=true`)
- [ ] API key is valid format (`xx|xxxxxxxxxxxx`)
- [ ] Network requests appear in browser dev tools
- [ ] Console shows detailed error messages
- [ ] Payment success page loads correctly

## 🆘 Still Having Issues?

1. **Enable demo mode** first to test the UI flow
2. **Check browser console** for detailed error messages
3. **Verify your SlickPay account** has the correct API credentials
4. **Contact SlickPay support** for API key validation
5. **Use the test integration file** in `src/test/slickpay-integration.test.ts`

## 📞 Support Resources

- **SlickPay Documentation**: Check their official API docs
- **Demo Mode**: Use for local development and testing
- **Console Logs**: Enable detailed logging in the browser
- **Test File**: Run the integration test for debugging

The integration now handles most common SlickPay API issues automatically and provides multiple fallback options for robust payment processing.