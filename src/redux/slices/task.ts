import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { endpoints } from '@/config/endpoints';
import { axiosInstance } from '@/utils/axiosInstance';
import { AxiosResponse } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inFlightRequests: Record<string, Promise<AxiosResponse<any>>> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTaskCountByStatus = (status: string): Promise<AxiosResponse<any>> => {
  const url = `${endpoints.WORKFLOW_TASKS}me?status=${status}`;
  if (!inFlightRequests[url]) {
    inFlightRequests[url] = axiosInstance.get(url).then(res => {
      delete inFlightRequests[url];
      return res;
    }).catch(err => {
      delete inFlightRequests[url];
      throw err;
    });
  }
  return inFlightRequests[url];
};

const getAuditCountByStatus = (status: string): Promise<number> => {
  const url = endpoints.AUDIT_MY_AUDITS;
  if (!inFlightRequests[url]) {
    inFlightRequests[url] = axiosInstance.get(url).then(res => {
      delete inFlightRequests[url];
      return res;
    }).catch(err => {
      delete inFlightRequests[url];
      throw err;
    });
  }
  return inFlightRequests[url].then(res => {
    const audits = res.data || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return audits.filter((a: any) => {
      if (status === 'PENDING') return a.status_obj?.code === 'PENDING' || a.status_obj?.code === 'COMPLETED';
      return a.status_obj?.code === status;
    }).length;
  });
};

export const actionFetchPendingCount = createAsyncThunk(
  'task/fetchPendingCount',
  async (_, thunkApi) => {
    try {
      const [workflowRes, auditCount] = await Promise.all([
        getTaskCountByStatus('PENDING'),
        getAuditCountByStatus('PENDING'),
      ]);
      return (workflowRes.data.length || 0) + auditCount;
    } catch (error) {
      return thunkApi.rejectWithValue({
        message: (error as Error).message,
      });
    }
  }
);

export const actionFetchTaskCounts = createAsyncThunk(
  'task/fetchCounts',
  async (_, thunkApi) => {
    try {
      const [
        pending, approved, rejected,
        pendingAudit, approvedAudit, rejectedAudit
      ] = await Promise.all([
        getTaskCountByStatus('PENDING'),
        getTaskCountByStatus('APPROVED'),
        getTaskCountByStatus('REJECTED'),
        getAuditCountByStatus('PENDING'),
        getAuditCountByStatus('APPROVED'),
        getAuditCountByStatus('REJECTED'),
      ]);

      return {
        PENDING: (pending.data.length || 0) + pendingAudit,
        APPROVED: (approved.data.length || 0) + approvedAudit,
        REJECTED: (rejected.data.length || 0) + rejectedAudit,
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
      if (task.loading) {
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
    updateCount: (state, action: PayloadAction<{ status: string; count: number }>) => {
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
