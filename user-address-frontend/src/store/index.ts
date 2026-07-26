import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './users/usersSlice';
import addressesReducer from './address/addressesSlice';
import dashboardReducer from './dashboard/dashboardSlice';

/**
 * Domain state lives here, one folder per feature (users, address, dashboard).
 * Cross cutting concerns stay in Context: session in AuthProvider,
 * light/dark mode in ThemeModeProvider.
 */
export const store = configureStore({
  reducer: {
    users: usersReducer,
    addresses: addressesReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
