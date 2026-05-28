import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { endpoints } from '@/config/endpoints';
import { axiosInstance } from '@/utils/axiosInstance';
import { AxiosResponse } from 'axios';
import { IAuditSession } from '@/types/audit';
import { getAuditDerivedStatus } from '@/utils/audit';
import { IUser } from '@/types/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inFlightRequests: Record<string, Promise<AxiosResponse<any>>> = {};

const fetchWithInFlight = <T>(url: string): Promise<AxiosResponse<T>> => {
  if (!inFlightRequests[url]) {
    inFlightRequests[url] = axiosInstance.get(url).then(res => {
      delete inFlightRequests[url];
      return res;
    }).catch(err => {
      delete inFlightRequests[url];
      throw err;
    });
  }
  return inFlightRequests[url] as Promise<AxiosResponse<T>>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTaskCountByStatus = (status: string): Promise<AxiosResponse<any>> => {
  return fetchWithInFlight(`${endpoints.WORKFLOW_TASKS}me?status=${status}`);
};

const getAuditCountByStatus = async (status: string, user?: IUser | null): Promise<number> => {
  const [myAuditsRes, pendingAuditsRes] = await Promise.all([
    fetchWithInFlight<IAuditSession[]>(endpoints.AUDIT_MY_AUDITS),
    status === 'PENDING_APPROVAL'
      ? fetchWithInFlight<IAuditSession[]>(endpoints.AUDIT_PENDING_APPROVAL)
      : Promise.resolve({ data: [] } as unknown as AxiosResponse<IAuditSession[]>),
  ]);

  const combined = [
    ...(myAuditsRes.data || []).map(a => ({ ...a, _isPendingApproval: false })),
    ...(pendingAuditsRes.data || []).map(a => ({ ...a, _isPendingApproval: true })),
  ];

  const uniqueMap = new Map<number, IAuditSession & { _isPendingApproval: boolean }>();
  combined.forEach((a) => {
    if (!uniqueMap.has(a.id) || a._isPendingApproval) {
      uniqueMap.set(a.id, a);
    }
  });

  return Array.from(uniqueMap.values()).filter((a) => {
    return getAuditDerivedStatus(a, user) === status;
  }).length;
};

export const actionFetchPendingCount = createAsyncThunk(
  'task/fetchPendingCount',
  async (_, thunkApi) => {
    try {
      const { auth } = thunkApi.getState() as { auth: { user: IUser | null } };
      const user = auth.user;
      const [workflowRes, auditCount] = await Promise.all([
        getTaskCountByStatus('PENDING'),
        getAuditCountByStatus('PENDING', user),
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
      const { auth } = thunkApi.getState() as { auth: { user: IUser | null } };
      const user = auth.user;
      const [
        pending, approved, rejected,
        pendingAudit, approvedAudit, rejectedAudit, pendingApprovalAudit
      ] = await Promise.all([
        getTaskCountByStatus('PENDING'),
        getTaskCountByStatus('APPROVED'),
        getTaskCountByStatus('REJECTED'),
        getAuditCountByStatus('PENDING', user),
        getAuditCountByStatus('APPROVED', user),
        getAuditCountByStatus('REJECTED', user),
        getAuditCountByStatus('PENDING_APPROVAL', user),
      ]);

      return {
        PENDING: (pending.data.length || 0) + pendingAudit,
        APPROVED: (approved.data.length || 0) + approvedAudit,
        REJECTED: (rejected.data.length || 0) + rejectedAudit,
        PENDING_APPROVAL: pendingApprovalAudit,
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
    PENDING_APPROVAL: number;
    APPROVED: number;
    REJECTED: number;
  };
  loading: boolean;
  fetched: boolean;
}

const initialState: TaskState = {
  counts: {
    PENDING: 0,
    PENDING_APPROVAL: 0,
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
      if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED' || status === 'PENDING_APPROVAL') {
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
