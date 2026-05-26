import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { endpoints } from '@/config/endpoints';
import { axiosInstance } from '@/utils/axiosInstance';
import { AxiosResponse } from 'axios';
import { IAuditSession } from '@/types/audit';

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

const getAuditData = (url: string): Promise<AxiosResponse<IAuditSession[]>> => {
  if (!inFlightRequests[url]) {
    inFlightRequests[url] = axiosInstance.get(url).then(res => {
      delete inFlightRequests[url];
      return res;
    }).catch(err => {
      delete inFlightRequests[url];
      throw err;
    });
  }
  return inFlightRequests[url] as Promise<AxiosResponse<IAuditSession[]>>;
};

const getAuditCountByStatus = async (status: string, userId?: number): Promise<number> => {
  const [myAuditsRes, pendingAuditsRes] = await Promise.all([
    getAuditData(endpoints.AUDIT_MY_AUDITS),
    getAuditData(endpoints.AUDIT_PENDING_APPROVAL),
  ]);

  const combined = [
    ...(myAuditsRes.data || []),
    ...(pendingAuditsRes.data || []),
  ];

  // Remove duplicates based on ID
  const uniqueMap = new Map<number, IAuditSession>();
  combined.forEach((a) => uniqueMap.set(a.id, a));
  const audits = Array.from(uniqueMap.values());

  return audits.filter((a) => {
    if (status === 'PENDING') {
      return (
        (a.status_obj?.code === 'PENDING' && !a.submitted_at) ||
        (a.status_obj?.code === 'COMPLETED' && a.assignee_id !== userId)
      );
    }
    if (status === 'APPROVED') {
      return (
        a.status_obj?.code === 'APPROVED' ||
        (a.status_obj?.code === 'COMPLETED' && a.assignee_id === userId)
      );
    }
    return a.status_obj?.code === status;
  }).length;
};

export const actionFetchPendingCount = createAsyncThunk(
  'task/fetchPendingCount',
  async (_, thunkApi) => {
    try {
      const { auth } = thunkApi.getState() as { auth: { user: { id: number } | null } };
      const userId = auth.user?.id;
      const [workflowRes, auditCount] = await Promise.all([
        getTaskCountByStatus('PENDING'),
        getAuditCountByStatus('PENDING', userId),
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
      const { auth } = thunkApi.getState() as { auth: { user: { id: number } | null } };
      const userId = auth.user?.id;
      const [
        pending, approved, rejected,
        pendingAudit, approvedAudit, rejectedAudit
      ] = await Promise.all([
        getTaskCountByStatus('PENDING'),
        getTaskCountByStatus('APPROVED'),
        getTaskCountByStatus('REJECTED'),
        getAuditCountByStatus('PENDING', userId),
        getAuditCountByStatus('APPROVED', userId),
        getAuditCountByStatus('REJECTED', userId),
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
    decrementPendingCount: (state) => {
      if (state.counts.PENDING > 0) {
        state.counts.PENDING -= 1;
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
      })
      .addMatcher(
        (action) => action.type === 'auth/actionLogout',
        () => initialState
      );
  },
});

export const { updateCount, decrementPendingCount } = taskSlice.actions;

export default taskSlice.reducer;
