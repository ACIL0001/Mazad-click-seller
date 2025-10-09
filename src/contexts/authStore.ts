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
  set: (auth: Partial<typeof initialState>) => {
    console.log('🔐 AuthStore.set called with:', auth);

    // Create a copy to avoid mutating the original object
    const authData = { ...auth };
    
    if (authData.user) {
      authData.user = {
        ...authData.user,
        displayName: authData.user.firstName,
        role: authData.user.role,
        email: authData.user.email,
        photoURL: '/static/mock-images/avatars/avatar_24.jpg',
      } as any;
    }

    console.log('🔐 AuthStore.set - Modified auth.user:', authData.user);

    setValues((state) => {
      let isLogged = (!!authData.user && !!authData.tokens) || (!!state.auth.user && !!state.auth.tokens);
      console.log('🔐 AuthStore.set - Setting isLogged to:', isLogged);

      const newState = { auth: { ...state.auth, ...authData }, isLogged };
      console.log('🔐 AuthStore.set - New state:', newState);
      return newState;
    });
    
    // Save the complete auth data to localStorage with port-specific key
    const dataToSave = {
      user: authData.user,
      tokens: authData.tokens
    };
    const storageKey = getStorageKey();
    window.localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    console.log(`🔐 AuthStore.set - Auth data saved to localStorage with key '${storageKey}':`, dataToSave);
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
          values = { auth: parsedAuth, isLogged: true };
          console.log(`🔐 Auth initialized from localStorage with key '${storageKey}':`, parsedAuth);
        } else {
          console.log('⚠️ Invalid auth data in localStorage, clearing...');
          window.localStorage.removeItem(storageKey);
          values = { auth: initialState, isLogged: false };
        }
      } catch (error) {
        console.error('❌ Error parsing auth from localStorage:', error);
        window.localStorage.removeItem(storageKey);
        values = { auth: initialState, isLogged: false };
      }
    } else {
        console.log(`ℹ️ No auth data in localStorage with key '${storageKey}', using initial state`);
        // Don't set isLogged to false explicitly, let it be the initial state
        values = { auth: initialState };
    }
    console.log('🔐 Auth store initialization values:', values);

    setValues({ ...values, isReady: true });
  },
}));
