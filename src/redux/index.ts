import { configureStore } from '@reduxjs/toolkit';

import auth from './slices/auth';
import { injectStore } from '@/utils/axiosInstance';


export const store = configureStore({
  reducer: {
    auth,
  },
});

injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
