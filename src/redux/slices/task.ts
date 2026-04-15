import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { endpoints } from '@/config/endpoints';
import { axiosInstance } from '@/utils/axiosInstance';

export const actionFetchPendingCount = createAsyncThunk(
  'task/fetchPendingCount',
  async (_, thunkApi) => {
    try {
      const response = await axiosInstance.get(
        `${endpoints.WORKFLOW_TASKS}me?status=PENDING&limit=1`
      );
      return response.data.length || 0;
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: (error as Error).message,
      });
    }
  },
  {
    condition: (_, { getState }) => {
      const { task } = getState() as { task: TaskState };
      if (task.loading) return false;
    },
  }
);

export const actionFetchTaskCounts = createAsyncThunk(
  'task/fetchCounts',
  async (_, thunkApi) => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        axiosInstance.get(`${endpoints.WORKFLOW_TASKS}me?status=PENDING&limit=1`),
        axiosInstance.get(`${endpoints.WORKFLOW_TASKS}me?status=APPROVED&limit=1`),
        axiosInstance.get(`${endpoints.WORKFLOW_TASKS}me?status=REJECTED&limit=1`),
      ]);

      return {
        PENDING: pending.data.length || 0,
        APPROVED: approved.data.length || 0,
        REJECTED: rejected.data.length || 0,
      };
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: (error as Error).message,
      });
    }
  },
  {
    condition: (_, { getState }) => {
      const { task } = getState() as { task: TaskState };
      if (task.fetched || task.loading) {
        return false;
      }
    },
  },
);

interface TaskState {
  counts: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  };
  loading: boolean;
  fetched: boolean;
}

const initialState: TaskState = {
  counts: {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  },
  loading: false,
  fetched: false,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    updateCount: (state, action: { payload: { status: string; count: number } }) => {
      const { status, count } = action.payload;
      if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') {
        state.counts[status] = count;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(actionFetchTaskCounts.fulfilled, (state, action) => {
        state.counts = action.payload;
        state.loading = false;
        state.fetched = true;
      })
      .addCase(actionFetchTaskCounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(actionFetchTaskCounts.rejected, (state) => {
        state.loading = false;
        state.fetched = true;
      })
      .addCase(actionFetchPendingCount.fulfilled, (state, action) => {
        state.counts.PENDING = action.payload;
        state.loading = false;
      })
      .addCase(actionFetchPendingCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(actionFetchPendingCount.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { updateCount } = taskSlice.actions;

export default taskSlice.reducer;
