# Authentication Flow Test Guide

## Test Scenarios

### 1. Verified User Login
1. Clear browser localStorage
2. Login with verified user credentials
3. **Expected**: Redirect to `/dashboard/app` immediately
4. **Expected**: No redirect loops

### 2. Unverified User Login
1. Clear browser localStorage
2. Login with unverified user credentials
3. **Expected**: Redirect to `/waiting-for-verification` page
4. **Expected**: User stays on waiting page (no redirect back to login)
5. **Expected**: Auth data is preserved

### 3. Already Logged In User
1. Login successfully
2. Refresh the page
3. **Expected**: Stay on current page (no redirect to login)
4. **Expected**: Auth state is preserved

### 4. Invalid Auth Data
1. Manually corrupt localStorage auth data
2. Refresh the page
3. **Expected**: Auth store clears invalid data
4. **Expected**: Redirect to login page

### 5. Network Issues
1. Login with valid credentials
2. Simulate network disconnect
3. **Expected**: Proper error handling
4. **Expected**: No infinite loading states

## Console Logs to Monitor

- `Auth store initialization values:` - Should show proper auth data
- `RequireIdentityVerification: User is not verified, redirecting to waiting for verification` - For unverified users
- `Login response:` - Should show proper response structure
- `Auth initialized from localStorage:` - Should show valid auth data

## Key Fixes Applied

1. **Removed auth clearing for unverified users**
2. **Added isReady checks before auth decisions**
3. **Improved localStorage error handling**
4. **Consistent redirect logic across components**
5. **Better verification status handling**
