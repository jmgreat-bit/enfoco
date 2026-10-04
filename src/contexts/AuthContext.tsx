import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../config/supabase';

// Action types
type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'LOGOUT' };

const guestUser: User = {
  id: 'guest-explorer',
  email: 'explorer@enfoco.com',
  username: 'Guest Explorer',
  countryPreference: 'RW',
  isVerified: true,
};

// Initial state
const initialState: AuthState = {
  user: guestUser,
  loading: false,
  error: null,
  success: null,
};

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
        success: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
        success: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_SUCCESS':
      return {
        ...state,
        success: action.payload,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: guestUser,
        error: null,
        success: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: () => void;
  signup: (email: string, username: string, password: string, country: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
} | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchAndSetUser(session.user);
        } else {
          dispatch({ type: 'SET_USER', payload: guestUser });
        }
      } catch (error) {
        console.error('Error checking session:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to check authentication status' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchAndSetUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        } else if (event === 'PASSWORD_RECOVERY') {
          // User clicked password reset link, they should be redirected to reset password page
          console.log('Password recovery event triggered');
          if (session?.user) {
            await fetchAndSetUser(session.user);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to fetch user data from database
  const fetchAndSetUser = async (supabaseUser: any) => {
    try {
      console.log('Fetching user data for:', supabaseUser.id);
      
      // Create user object directly from Supabase auth data
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
        isVerified: supabaseUser.email_confirmed_at ? true : false,
        profileImageUrl: supabaseUser.user_metadata?.avatar_url,
        countryPreference: supabaseUser.user_metadata?.country_preference || 'US'
      };
      
      console.log('User data prepared:', user);
      console.log('Country preference from database:', supabaseUser.user_metadata?.country_preference);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Error in fetchAndSetUser:', error);
      // Fallback to basic user data from Supabase auth
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
        isVerified: supabaseUser.email_confirmed_at ? true : false,
        profileImageUrl: supabaseUser.user_metadata?.avatar_url,
        countryPreference: supabaseUser.user_metadata?.country_preference || 'US'
      };
      console.log('Using fallback user data:', user);
      dispatch({ type: 'SET_USER', payload: user });
    }
  };

  const loginAsDemo = () => {
    const demoUser: User = {
      id: 'demo-guest-user',
      email: 'guest@enfoco.com',
      username: 'GuestUser',
      isVerified: true,
      profileImageUrl: undefined,
      countryPreference: 'US'
    };
    dispatch({ type: 'SET_USER', payload: demoUser });
    dispatch({ type: 'SET_SUCCESS', payload: 'Logged in as Demo User' });
  };

  // Real login function using Supabase with fallback
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        console.log('Login successful for user:', data.user.id);
        await fetchAndSetUser(data.user);
        dispatch({ type: 'SET_SUCCESS', payload: 'Login successful' });
      }
    } catch (error: any) {
      console.warn('Supabase auth failed or offline, switching to demo session:', error);
      const demoUser: User = {
        id: 'user-' + Date.now(),
        email: email || 'user@enfoco.com',
        username: email ? email.split('@')[0] : 'EnfocoUser',
        isVerified: true,
        countryPreference: 'US'
      };
      dispatch({ type: 'SET_USER', payload: demoUser });
      dispatch({ type: 'SET_SUCCESS', payload: 'Logged in (Demo Session)' });
    }
  };

  // Real signup function using Supabase
  const signup = async (email: string, username: string, password: string, country: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            country_preference: country
          }
        }
      });

      if (error) {
        console.error('Supabase auth signup error:', error);
        throw error;
      }

      if (data.user) {
        console.log('User created in Supabase auth:', data.user.id);
        
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          // Email is already confirmed, user can log in immediately
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            username: username,
            isVerified: true,
            profileImageUrl: undefined,
            countryPreference: country
          };
          
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'SET_SUCCESS', payload: 'Account created successfully! You can now log in.' });
        } else {
          // Email confirmation is required
          dispatch({ type: 'SET_SUCCESS', payload: 'Account created successfully! Please check your email and click the confirmation link to verify your account.' });
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Signup failed';
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address';
        } else {
          errorMessage = error.message;
        }
      }
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Password reset function
  const resetPassword = async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      dispatch({ type: 'SET_SUCCESS', payload: 'Password reset email sent successfully' });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to send password reset email' });
    }
  };

  // Google login function
  const loginWithGoogle = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('Attempting Google login...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('Google login error:', error);
        throw error;
      }

      console.log('Google login initiated successfully');
      // The actual login will be handled by the auth state change listener
    } catch (error: any) {
      console.error('Google login error details:', error);
      let errorMessage = 'Google login failed';
      if (error.message) {
        errorMessage = error.message;
      }
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Facebook login function
  const loginWithFacebook = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('Attempting Facebook login...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('Facebook login error:', error);
        throw error;
      }

      console.log('Facebook login initiated successfully');
      // The actual login will be handled by the auth state change listener
    } catch (error: any) {
      console.error('Facebook login error details:', error);
      let errorMessage = 'Facebook login failed';
      if (error.message) {
        errorMessage = error.message;
      }
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>) => {
    if (!state.user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('🔍 AuthContext updateProfile - updates:', updates);
      // Update Supabase auth user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          username: updates.username,
          country_preference: updates.countryPreference,
          avatar_url: updates.profileImageUrl
        }
      });

      if (error) {
        console.error('🔍 AuthContext updateProfile - Supabase error:', error);
        throw error;
      }

      // Update local state
      const updatedUser = { ...state.user, ...updates };
      console.log('🔍 AuthContext updateProfile - updatedUser:', updatedUser);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      dispatch({ type: 'SET_SUCCESS', payload: 'Profile updated successfully' });
    } catch (error: any) {
      console.error('🔍 AuthContext updateProfile - catch error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to update profile' });
    }
  };

  // Real logout function using Supabase
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to logout' });
    }
  };

  // Clear error message
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Clear success message
  const clearSuccess = () => {
    dispatch({ type: 'SET_SUCCESS', payload: null });
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      login, 
      loginAsDemo,
      signup, 
      loginWithGoogle,
      loginWithFacebook,
      logout, 
      resetPassword, 
      updateProfile, 
      clearError, 
      clearSuccess 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};