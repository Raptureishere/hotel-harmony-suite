import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState } from '@/types/auth';

// Get initial state from localStorage
const getInitialState = (): AuthState => {
  const storedToken = localStorage.getItem('hms_token');
  const storedUser = localStorage.getItem('hms_user');
  
  if (storedToken && storedUser) {
    try {
      return {
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
    }
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      
      // Persist to localStorage
      localStorage.setItem('hms_token', action.payload.token);
      localStorage.setItem('hms_user', JSON.stringify(action.payload.user));
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('hms_user', JSON.stringify(state.user));
      }
    },
  },
});

export const { setLoading, setCredentials, setError, clearError, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
