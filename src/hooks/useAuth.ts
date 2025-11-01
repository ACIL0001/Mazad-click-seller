import { authStore } from '@/contexts/authStore';
import { UserAPI } from '@/api/user';
import { AuthAPI } from '@/api/auth';

// Prevent multiple simultaneous validation calls
let validationInProgress = false;
let validationPromise: Promise<any> | null = null;

const useAuth = () => {
  const { auth, isLogged, isReady, set, clear, initializeAuth } = authStore();

  // Function to validate the current token with the server
  const validateToken = async () => {
    // If validation is already in progress, return the existing promise
    if (validationInProgress && validationPromise) {
      console.log('useAuth - Token validation already in progress, reusing promise');
      return validationPromise;
    }

    validationInProgress = true;
    validationPromise = (async () => {
      try {
        console.log('useAuth - Validating token with server...');
        
        // Check if we have a token first
        if (!auth.tokens?.accessToken) {
          console.warn('useAuth - No access token available for validation');
          return { valid: false, error: 'No token available' };
        }

        const response = await AuthAPI.validateToken();
        console.log('useAuth - Token validation successful:', response);
        
        // Update user data in auth store if validation succeeds
        // Preserve photoURL from current state if server doesn't provide it
        if (response.user) {
          const currentPhotoURL = (auth.user as any)?.photoURL;
          const serverPhotoURL = (response.user as any)?.photoURL;
          const mergedUser = {
            ...response.user,
            photoURL: serverPhotoURL && serverPhotoURL.trim() !== '' 
              ? serverPhotoURL 
              : (currentPhotoURL && currentPhotoURL.trim() !== '' ? currentPhotoURL : undefined)
          };
          
          set({
            tokens: auth.tokens,
            user: mergedUser
          });
        }
        
        return { valid: true, user: response.user };
      } catch (error) {
        console.error('useAuth - Token validation failed:', error);
        return { valid: false, error };
      } finally {
        validationInProgress = false;
        validationPromise = null;
      }
    })();

    return validationPromise;
  };

  // Function to refresh user data from server
  const refreshUserData = async () => {
    try {
      console.log('🔄 [refreshUserData] Starting user data refresh...');
      const { tokens, user: currentUser } = authStore.getState().auth;
      
      if (!tokens?.accessToken) {
        console.warn('⚠️ [refreshUserData] No access token available for user data refresh');
        return null;
      }

      if (!currentUser?._id) {
        console.warn('⚠️ [refreshUserData] No user in auth store, skipping refresh to prevent unnecessary API calls');
        return null;
      }

      // Preserve current photoURL and avatar before fetching
      const preservedPhotoURL = (currentUser as any)?.photoURL;
      const preservedAvatar = currentUser?.avatar;
      console.log('💾 [refreshUserData] Preserving current photoURL:', preservedPhotoURL);
      console.log('💾 [refreshUserData] Preserving current avatar:', preservedAvatar);

      console.log('🔄 [refreshUserData] Fetching updated user data from server...');
      const updatedUser = await UserAPI.get();
      console.log('✅ [refreshUserData] Updated user data received:', updatedUser);
      console.log('🔍 [refreshUserData] Server photoURL:', (updatedUser as any)?.photoURL);
      console.log('🔍 [refreshUserData] Server avatar:', updatedUser?.avatar);

      // Merge server data with preserved photoURL/avatar
      // Priority: server photoURL > preserved photoURL
      const serverPhotoURL = (updatedUser as any)?.photoURL;
      const finalPhotoURL = serverPhotoURL && serverPhotoURL.trim() !== '' 
        ? serverPhotoURL 
        : (preservedPhotoURL && preservedPhotoURL.trim() !== '' ? preservedPhotoURL : undefined);

      // Priority: server avatar (if complete) > preserved avatar > server avatar (if incomplete)
      const serverAvatar = updatedUser?.avatar as any;
      const hasCompleteServerAvatar = serverAvatar && (
        serverAvatar.fullUrl || 
        serverAvatar.url || 
        serverAvatar.filename
      );
      const finalAvatar = hasCompleteServerAvatar 
        ? updatedUser.avatar 
        : (preservedAvatar && (
            (preservedAvatar as any)?.fullUrl || 
            (preservedAvatar as any)?.url || 
            (preservedAvatar as any)?.filename
          ) ? preservedAvatar : updatedUser?.avatar);

      const mergedUser = {
        ...updatedUser,
        photoURL: finalPhotoURL,
        avatar: finalAvatar,
      };

      console.log('🔀 [refreshUserData] Merged user with preserved data:', mergedUser);
      console.log('🔀 [refreshUserData] Final photoURL:', (mergedUser as any).photoURL);
      console.log('🔀 [refreshUserData] Final avatar:', mergedUser.avatar);

      // Update auth store with merged user data (preserving photoURL and avatar)
      authStore.getState().set({
        tokens: tokens,
        user: mergedUser
      });
      console.log('✅ [refreshUserData] Auth store updated with merged user data');

      return mergedUser;
    } catch (error) {
      console.error('❌ [refreshUserData] Error refreshing user data:', error);
      
      // If refresh fails due to auth issues, clear the store only if it's a clear auth failure
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('🚪 [refreshUserData] Authentication error, clearing auth store');
        clear();
      } else {
        console.warn('⚠️ [refreshUserData] Non-auth error during refresh, keeping existing auth state');
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