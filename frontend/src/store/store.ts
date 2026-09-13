import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import sessionReducer from './sessionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
