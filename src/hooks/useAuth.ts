import { authStore } from '@/contexts/authStore';
import { UserAPI } from '@/api/user';
import { AuthAPI } from '@/api/auth';

const useAuth = () => {
  const { auth, isLogged, isReady, set, clear, initializeAuth } = authStore();

  // Function to validate the current token with the server
  const validateToken = async () => {
    try {
      console.log('useAuth - Validating token with server...');
      const response = await AuthAPI.validateToken();
      console.log('useAuth - Token validation successful:', response);
      return { valid: true, user: response.user };
    } catch (error) {
      console.error('useAuth - Token validation failed:', error);
      // Don't clear auth store immediately - let the caller decide
      return { valid: false, error };
    }
  };

  // Function to refresh user data from server
  const refreshUserData = async () => {
    try {
      console.log('🔄 useAuth - Starting user data refresh...');
      const { tokens, user } = authStore.getState().auth;
      if (!tokens?.accessToken) {
        console.warn('⚠️ No access token available for user data refresh');
        return null;
      }

      // Additional safety check - if no user is in the auth store, skip the refresh
      if (!user?._id) {
        console.warn('⚠️ No user in auth store, skipping refresh to prevent unnecessary API calls');
        return null;
      }

      console.log('🌐 useAuth - Fetching updated user data from server...');
      const updatedUser = await UserAPI.get();
      console.log('✅ useAuth - Updated user data received:', updatedUser);
      
      // Update auth store with fresh user data
      authStore.getState().set({
        tokens: tokens,
        user: updatedUser
      });
      console.log('💾 useAuth - Auth store updated with fresh user data');

      return updatedUser;
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      // If refresh fails due to auth issues, clear the store only if it's a clear auth failure
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('🚨 useAuth - Authentication error, clearing auth store');
        clear();
      } else {
        // For other errors (network, server, etc.), don't clear auth but log the error
        console.warn('⚠️ useAuth - Non-auth error during refresh, keeping existing auth state');
      }
      return null;
    }
  };

  return {
    auth,
    isLogged,
    isReady,
    set,
    clear,
    initializeAuth,
    refreshUserData,
    validateToken
  };
};

export default useAuth;
