import { configureStore } from '@reduxjs/toolkit';

import auth from './slices/auth';
import stockAdjustment from './slices/stockAdjustment';
import { injectStore } from '@/utils/axiosInstance';


export const store = configureStore({
  reducer: {
    auth,
    stockAdjustment,
  },
});

injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
