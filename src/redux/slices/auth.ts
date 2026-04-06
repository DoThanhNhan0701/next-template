import { type PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { endpoints } from '@/config/endpoints';
import { axiosInstance } from '@/utils/axiosInstance';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/config/constants';
import { cleanClientCookie, getClientCookie, setClientCookie } from '@/utils/cookiesStore';
import type { IUser } from '@/types/auth';

export const actionFetchUser = createAsyncThunk('auth/fetchUser', async (_, thunkApi) => {
  try {
    const refreshToken = getClientCookie(REFRESH_TOKEN);
    if (!refreshToken) throw new Error('UNAUTHORIZE');
    const response = await axiosInstance.get(endpoints.ME, {
      signal: thunkApi.signal,
    });
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue({
      message: (error as Error).message,
    });
  }
});



interface Auth {
  loading: boolean;
  user: IUser | null;
  loggingOut: boolean;
}

const initialState: Auth = {
  user: null,
  loading: true,
  loggingOut: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    actionLogout: (state) => {
      state.user = null;
      cleanClientCookie();
    },
    actionLogin: (
      _,
      action: PayloadAction<{
        access_token: string;
        refresh_token: string;
        rememberMe: boolean | undefined;
      }>,
    ) => {
      const { rememberMe } = action.payload;

      setClientCookie(ACCESS_TOKEN, action.payload.access_token, rememberMe ? { expires: 30 } : {});
      setClientCookie(
        REFRESH_TOKEN,
        action.payload.refresh_token,
        rememberMe ? { expires: 30 } : {},
      );
    },
    actionSetUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(actionFetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(actionFetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(actionFetchUser.rejected, (state) => {
        state.loading = false;
      });


  },
});

export const { actionLogout, actionLogin, actionSetUser } = authSlice.actions;

export default authSlice.reducer;
