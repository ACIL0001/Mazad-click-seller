import auth from '@/_mock/auth';
import User from '@/types/User';
import { create } from 'zustand';
import { getStorageKey } from '@/config';

const initialState: { tokens?: { accessToken: string; refreshToken: string }; user?: User } = {
  tokens: undefined,
  user: undefined,
};

console.log('🔐 AuthStore - Initial state defined:', initialState);

interface IAuthStore {
  isReady: boolean;
  isLogged: boolean;
  auth: typeof initialState;
  set: (auth: Partial<typeof initialState>) => void;
  clear: () => void;
  initializeAuth: () => void;
}

export const authStore = create<IAuthStore>((setValues) => ({
  isReady: false,
  isLogged: false,
  auth: initialState,
  set: (auth: typeof initialState) => {
    console.log('🔐 [AuthStore] set called with:', auth);
    console.log('🔐 [AuthStore] set - user exists?', !!auth.user);
    console.log('🔐 [AuthStore] set - user keys:', auth.user ? Object.keys(auth.user) : 'null');
    console.log('🔐 [AuthStore] set - user._id:', auth.user?._id);
    console.log('🔐 [AuthStore] set - tokens exists?', !!auth.tokens);

    // Get current state before update
    const currentState = authStore.getState();
    console.log('🔐 [AuthStore] set - Current state before update:');
    console.log('  - current user exists?', !!currentState.auth.user);
    console.log('  - current user._id:', currentState.auth.user?._id);
    console.log('  - current tokens exists?', !!currentState.auth.tokens);

    // Create a copy to avoid mutating the original object
    const authData = { ...auth };
    
    // Preserve existing avatar/photoURL and only enrich when provided
    if (authData.user) {
      const u: any = authData.user;
      console.log('🔐 [AuthStore] set - Processing user object with keys:', Object.keys(u));
      
      // CRITICAL: Preserve ALL existing fields from current state if new user is partial
      const currentUser = currentState.auth.user;
      if (currentUser && u) {
        // If new user is missing critical fields, merge from current
        if (!u._id && currentUser._id) {
          console.warn('⚠️ [AuthStore] New user missing _id, preserving from current:', currentUser._id);
          u._id = currentUser._id;
        }
        if (!u.firstName && currentUser.firstName) {
          u.firstName = currentUser.firstName;
        }
        if (!u.lastName && currentUser.lastName) {
          u.lastName = currentUser.lastName;
        }
        if (!u.email && currentUser.email) {
          u.email = currentUser.email;
        }
        
        // CRITICAL: Preserve photoURL if new user doesn't have it or if it's empty/invalid
        const currentPhotoURL = (currentUser as any)?.photoURL;
        const newPhotoURL = u.photoURL;
        if ((!newPhotoURL || newPhotoURL.trim() === '' || newPhotoURL.includes('mock-images')) && 
            currentPhotoURL && currentPhotoURL.trim() !== '' && !currentPhotoURL.includes('mock-images')) {
          console.log('💾 [AuthStore] Preserving photoURL from current user:', currentPhotoURL);
          u.photoURL = currentPhotoURL;
        }
        
        // CRITICAL: Preserve avatar if new user doesn't have it or if it's incomplete
        const currentAvatar = currentUser.avatar;
        const newAvatar = u.avatar;
        const hasValidNewAvatar = newAvatar && (
          (newAvatar as any)?.fullUrl || 
          (newAvatar as any)?.url || 
          (newAvatar as any)?.filename
        );
        const hasValidCurrentAvatar = currentAvatar && (
          (currentAvatar as any)?.fullUrl || 
          (currentAvatar as any)?.url || 
          (currentAvatar as any)?.filename
        );
        if (!hasValidNewAvatar && hasValidCurrentAvatar) {
          console.log('💾 [AuthStore] Preserving avatar from current user:', currentAvatar);
          u.avatar = currentAvatar;
        }
        
        // Preserve all other fields from current user that aren't in new user
        Object.keys(currentUser).forEach(key => {
          if (!(key in u) && (currentUser as any)[key] !== undefined) {
            u[key] = (currentUser as any)[key];
          }
        });
      }
      
      const computedDisplayName = u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.entreprise || 'Utilisateur';
      authData.user = {
        ...u,
        displayName: computedDisplayName,
        role: u.role || u.type || 'PROFESSIONAL',
        email: u.email || u.email,
        // keep provided photoURL if any (do not override with mock)
        photoURL: u.photoURL,
      } as any;
      
      console.log('🔐 [AuthStore] set - Final processed user keys:', Object.keys(authData.user));
      console.log('🔐 [AuthStore] set - Final processed user._id:', (authData.user as any)._id);
    }

    console.log('🔐 [AuthStore] set - Modified auth.user:', authData.user);

    setValues((state) => {
      // Preserve tokens from state if not provided in authData
      const tokensToUse = authData.tokens || state.auth.tokens;
      console.log('🔐 [AuthStore] set - tokensToUse exists?', !!tokensToUse);
      
      // Preserve user from state if not provided in authData, but prefer authData.user
      const userToUse = authData.user || state.auth.user;
      console.log('🔐 [AuthStore] set - userToUse exists?', !!userToUse);
      console.log('🔐 [AuthStore] set - userToUse._id:', userToUse?._id);
      
      if (!userToUse) {
        console.error('❌ [AuthStore] CRITICAL: No user available (neither in authData nor state)!');
        console.error('  - authData.user:', authData.user);
        console.error('  - state.auth.user:', state.auth.user);
      }
      
      let isLogged = (!!userToUse && !!tokensToUse?.accessToken);
      console.log('🔐 [AuthStore] set - Setting isLogged to:', isLogged);

      const newState = { 
        auth: { 
          ...state.auth, 
          user: userToUse,
          tokens: tokensToUse,
        }, 
        isLogged 
      };
      console.log('🔐 [AuthStore] set - New state user exists?', !!newState.auth.user);
      console.log('🔐 [AuthStore] set - New state user._id:', newState.auth.user?._id);
      console.log('🔐 [AuthStore] set - New state tokens exists?', !!newState.auth.tokens);
      return newState;
    });
    
    // Save the complete auth data to localStorage with port-specific key
    const current = ((): any => {
      try { return JSON.parse(window.localStorage.getItem(getStorageKey()) || '{}'); } catch { return {}; }
    })();
    const dataToSave = {
      user: authData.user ?? current.user,
      tokens: authData.tokens ?? current.tokens,
    };
    const storageKey = getStorageKey();
    const photoURLToSave = (dataToSave.user as any)?.photoURL;
    const avatarToSave = dataToSave.user?.avatar;
    console.log(`💾 [AuthStore.set] Saving to localStorage with key '${storageKey}'`);
    console.log(`📸 [AuthStore.set] photoURL being saved:`, photoURLToSave);
    console.log(`🖼️ [AuthStore.set] avatar being saved:`, avatarToSave);
    window.localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    console.log(`✅ [AuthStore.set] Auth data saved successfully to localStorage`);
  },
  clear: () => {
    console.log('🔐 AuthStore.clear called - Clearing auth data');
    setValues((state) => ({ auth: initialState, isLogged: false }));
    const storageKey = getStorageKey();
    window.localStorage.removeItem(storageKey);
    console.log(`🔐 AuthStore.clear - Auth data cleared from localStorage with key '${storageKey}'`);
  },
  initializeAuth: () => {
    if (!window) return;
    const storageKey = getStorageKey();
    const authentication = window.localStorage.getItem(storageKey);

    let values;

    if (authentication) {
      try {
        const parsedAuth = JSON.parse(authentication);
        // Validate that we have the required data
        if (parsedAuth && parsedAuth.user && parsedAuth.tokens && 
            parsedAuth.tokens.accessToken && parsedAuth.user._id) {
          
          // Log photoURL status during initialization
          const photoURL = (parsedAuth.user as any)?.photoURL;
          const avatar = parsedAuth.user?.avatar;
          console.log(`🔐 [initializeAuth] Loading from localStorage with key '${storageKey}'`);
          console.log(`📸 [initializeAuth] photoURL in stored data:`, photoURL);
          console.log(`🖼️ [initializeAuth] avatar in stored data:`, avatar);
          
          values = { auth: parsedAuth, isLogged: true };
          console.log(`✅ [initializeAuth] Auth initialized successfully from localStorage`);
        } else {
          console.log('⚠️ [initializeAuth] Invalid auth data in localStorage, clearing...');
          window.localStorage.removeItem(storageKey);
          values = { auth: initialState, isLogged: false };
        }
      } catch (error) {
        console.error('❌ [initializeAuth] Error parsing auth from localStorage:', error);
        window.localStorage.removeItem(storageKey);
        values = { auth: initialState, isLogged: false };
      }
    } else {
        console.log(`ℹ️ [initializeAuth] No auth data in localStorage with key '${storageKey}', using initial state`);
        // Don't set isLogged to false explicitly, let it be the initial state
        values = { auth: initialState };
    }
    console.log('🔐 [initializeAuth] Auth store initialization complete, values:', values);

    setValues({ ...values, isReady: true });
  },
}));
