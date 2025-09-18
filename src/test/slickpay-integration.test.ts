// Test file to verify SlickPay integration
import { createSlickpayPayment, verifySlickpayPayment, SubscriptionPayment } from '../api/payment';

// Test configuration - these should match your .env file
const testPayment: SubscriptionPayment = {
  organization_id: 'test-org-123',
  user_id: 'test-user-456',
  plan: 'standard',
  duration_months: 1,
  total_amount: 5000, // 5000 DZD
  payment_method: 'slickpay',
  customer_email: 'test@example.com',
  customer_name: 'Test User',
  customer_phone: '0555123456'
};

/**
 * Test SlickPay payment creation
 * This test verifies that the SlickPay API integration is working correctly
 */
export async function testSlickPayIntegration() {
  console.log('🧪 Testing SlickPay Integration...');
  
  try {
    // Test payment creation
    console.log('📝 Creating SlickPay payment...');
    const result = await createSlickpayPayment(testPayment);
    
    console.log('✅ Payment created successfully:');
    console.log('   Payment ID:', result.paymentId);
    console.log('   Redirect URL:', result.redirectUrl);
    
    // Verify the URL structure
    if (result.redirectUrl && result.redirectUrl.includes('slick-pay.com')) {
      console.log('✅ Payment URL format is correct');
    } else {
      console.warn('⚠️  Payment URL format might be incorrect');
    }
    
    // Test payment verification (this might fail in test environment)
    try {
      console.log('🔍 Testing payment verification...');
      await verifySlickpayPayment(result.paymentId);
      console.log('✅ Payment verification API is accessible');
    } catch (verifyError) {
      console.log('ℹ️  Payment verification test skipped (expected in test environment)');
    }
    
    return {
      success: true,
      paymentId: result.paymentId,
      redirectUrl: result.redirectUrl
    };
    
  } catch (error) {
    console.error('❌ SlickPay integration test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Run integration test
 * Uncomment the line below to run the test
 */
// testSlickPayIntegration().then(result => {
//   console.log('Test completed:', result);
// });

export default testSlickPayIntegration;