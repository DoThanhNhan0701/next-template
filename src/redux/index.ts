import { configureStore } from '@reduxjs/toolkit';

import auth from './slices/auth';
import stockAdjustment from './slices/stockAdjustment';
import allocation from './slices/allocation';
import recovery from './slices/recovery';
import rental from './slices/rental';
import { injectStore } from '@/utils/axiosInstance';


export const store = configureStore({
  reducer: {
    auth,
    stockAdjustment,
    allocation,
    recovery,
    rental,
  },
});

injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
