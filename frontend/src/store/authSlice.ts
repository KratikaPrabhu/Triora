import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthResponse, UserProfile } from '../types';
import authService from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('triora_auth_token'),
  loading: true,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('triora_auth_token');
    if (!token) return null;
    const user = await authService.getMe();
    return user;
  } catch (err: any) {
    localStorage.removeItem('triora_auth_token');
    return rejectWithValue(err.message || 'Session expired');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const response: AuthResponse = await authService.login(credentials);
    localStorage.setItem('triora_auth_token', response.token);
    return response.user;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

export const signupUser = createAsyncThunk('auth/signup', async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
  try {
    const response: AuthResponse = await authService.signup(data);
    localStorage.setItem('triora_auth_token', response.token);
    return response.user;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Signup failed');
  }
});

export const googleLoginUser = createAsyncThunk('auth/googleLogin', async (credential: string, { rejectWithValue }) => {
  try {
    const response: AuthResponse = await authService.googleAuth(credential);
    localStorage.setItem('triora_auth_token', response.token);
    return response.user;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Google Sign-In failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('triora_auth_token');
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    updateUserProfileState(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.user) {
        state.user.profile = {
          ...state.user.profile,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User | null>) => {
      state.loading = false;
      if (action.payload) {
        state.user = action.payload;
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.isAuthenticated = false;
      }
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload as string;
    });

    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(signupUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(googleLoginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(googleLoginUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(googleLoginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout, clearAuthError, updateUserProfileState } = authSlice.actions;
export default authSlice.reducer;
