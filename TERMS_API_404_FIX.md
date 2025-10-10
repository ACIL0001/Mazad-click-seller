# Terms API 404 Error Fix

## Problem Description

The application was showing console errors when fetching terms and conditions from the `/terms/latest` and `/terms/public` endpoints when no terms existed in the database:

```
GET https://mazadclick-server.onrender.com/terms/latest 404 (Not Found)
❌ Response error: {url: 'terms/latest', status: 404, message: 'Request failed with status code 404'}
Failed to fetch latest terms: An {message: 'Request failed with status code 404', ...}
```

The server was correctly returning a 404 status with the message "No terms and conditions found", but the client-side code was treating this as an error rather than a valid response indicating no terms exist yet.

## Root Cause

1. **In `src/api/terms.ts`**: The error handling didn't specifically handle 404 responses, treating them as errors and logging them to the console.

2. **In `src/api/utils.ts`**: The global error interceptor was showing error snackbars for all 404 responses, including the terms endpoints where a 404 is expected when no terms exist.

## Solution Implemented

### 1. Updated `src/api/terms.ts`

Added specific handling for 404 responses in both `getLatest()` and `getPublic()` methods:

```typescript
catch (error: any) {
  // Handle 404 as a valid "no terms found" response
  if (error.response?.status === 404) {
    return null; // or [] for getPublic
  }
  
  // Silently handle network errors
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return null;
  }
  
  // Only log unexpected errors
  console.error('Failed to fetch latest terms:', error);
  return null;
}
```

**Benefits:**
- 404 responses are now treated as valid "no terms exist" responses
- Returns `null` (for `getLatest`) or `[]` (for `getPublic`) without logging errors
- Network errors are still handled silently
- Only unexpected errors are logged to the console

### 2. Updated `src/api/utils.ts`

Modified the global error interceptor to handle 404 responses differently for terms endpoints:

```typescript
else if (error.response?.status === 404) {
  // Check if it's a terms endpoint - these are expected to return 404 when no terms exist
  const isTermsEndpoint = originalRequest?.url?.includes('/terms/');
  if (!isTermsEndpoint) {
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Ressource non trouvée';
    enqueueSnackbar(errorMessage, { variant: 'error' });
  }
  // For terms endpoints, silently handle 404 (no terms exist yet)
}
```

**Benefits:**
- Terms endpoints no longer show error snackbars for 404 responses
- Other endpoints still show appropriate error messages for 404s
- Consistent error handling across the application

## Expected Behavior After Fix

1. **When no terms exist (404 response)**:
   - No console errors logged
   - No error snackbars shown to users
   - `TermsAPI.getLatest()` returns `null`
   - `TermsAPI.getPublic()` returns `[]`
   - Application continues to function normally

2. **When terms exist (200 response)**:
   - Terms are fetched and displayed correctly
   - No changes to existing functionality

3. **When network errors occur**:
   - Silently handled without console spam
   - Application continues to function in offline mode

4. **When other errors occur (500, etc.)**:
   - Errors are logged to console
   - Appropriate error messages shown to users

## Testing Recommendations

1. **Test with no terms in database**:
   - Visit the registration page
   - Check console - should see no 404 errors for terms endpoints
   - Check UI - should not show error snackbars
   - Registration should work without requiring terms acceptance

2. **Test with terms in database**:
   - Visit the registration page
   - Terms should load and display correctly
   - Terms acceptance checkbox should appear
   - Registration should require terms acceptance

3. **Test offline mode**:
   - Disconnect from network
   - Visit the registration page
   - Should not see network error messages
   - Application should remain functional

## Files Modified

1. `src/api/terms.ts` - Added 404 handling in both API methods
2. `src/api/utils.ts` - Updated global error interceptor to handle terms 404s

## Additional Notes

- The `/terms/latest` and `/terms/public` endpoints are public endpoints and don't require authentication
- The API key (`x-access-key`) is still attached to these requests as required by the backend
- The "⚠️ No token available" warning in the console is expected and correct for public endpoints
- This fix maintains backward compatibility with existing functionality

