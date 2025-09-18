# Auth Storage Test Guide

## Test Steps

### 1. Clear localStorage and test fresh login
1. Open browser dev tools → Application → Local Storage
2. Clear all localStorage data
3. Login with valid credentials
4. Check localStorage for 'auth' key
5. **Expected**: Should see auth data with user and tokens

### 2. Test page refresh
1. After successful login, refresh the page
2. Check console logs for auth initialization
3. **Expected**: Should see "Auth initialized from localStorage" log
4. **Expected**: Should stay on current page (not redirect to login)

### 3. Test localStorage data structure
1. After login, check localStorage in dev tools
2. Look for 'auth' key
3. **Expected**: Should contain:
   ```json
   {
     "user": {
       "_id": "...",
       "email": "...",
       "isVerified": true/false,
       ...
     },
     "tokens": {
       "accessToken": "...",
       "refreshToken": "..."
     }
   }
   ```

### 4. Test auth store state
1. After login, check console logs
2. Look for "AuthStore.set" logs
3. **Expected**: Should see auth data being saved
4. **Expected**: Should see "isLogged: true"

## Debugging Commands

### Check localStorage in console:
```javascript
// Check if auth data exists
console.log('Auth data:', localStorage.getItem('auth'));

// Parse and check structure
const authData = JSON.parse(localStorage.getItem('auth'));
console.log('Parsed auth data:', authData);
console.log('Has user:', !!authData?.user);
console.log('Has tokens:', !!authData?.tokens);
console.log('User ID:', authData?.user?._id);
console.log('Access token:', authData?.tokens?.accessToken);
```

### Check auth store state:
```javascript
// In browser console, if you have access to authStore
console.log('Auth store state:', authStore.getState());
```

## Common Issues

1. **Auth data not saved**: Check if `authStore.set()` is being called
2. **Auth data not restored**: Check if `initializeAuth()` is being called
3. **Invalid data structure**: Check if user and tokens are properly formatted
4. **Token missing**: Check if accessToken is being saved correctly

## Expected Console Logs

- `🔐 AuthStore.set called with:` - When auth data is being saved
- `🔐 Auth initialized from localStorage:` - When auth is restored on page load
- `🔄 RootRedirect - Checking verification status:` - When routing decisions are made
- `✅ RootRedirect - User is verified, redirecting to dashboard` - For verified users
