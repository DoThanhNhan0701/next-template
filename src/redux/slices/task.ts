import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { endpoints } from '@/config/endpoints';
import { axiosInstance } from '@/utils/axiosInstance';
import { AxiosResponse } from 'axios';
import { IAuditSession } from '@/types/audit';
import { getAuditDerivedStatus } from '@/utils/audit';
import { IUser } from '@/types/auth';
import { ITask } from '@/types/task';

type AuditListResponse = IAuditSession[] | { items: IAuditSession[]; total: number };

const inFlightRequests: Record<string, Promise<AxiosResponse<unknown>>> = {};

const fetchWithInFlight = <T>(url: string): Promise<AxiosResponse<T>> => {
  if (!inFlightRequests[url]) {
    inFlightRequests[url] = axiosInstance.get(url).then(res => {
      delete inFlightRequests[url];
      return res;
    }).catch(err => {
      delete inFlightRequests[url];
      throw err;
    }) as Promise<AxiosResponse<unknown>>;
  }
  return inFlightRequests[url] as Promise<AxiosResponse<T>>;
};

const getTaskCountByStatus = (status: string): Promise<AxiosResponse<{ items: ITask[]; total: number }>> => {
  return fetchWithInFlight<{ items: ITask[]; total: number }>(`${endpoints.WORKFLOW_TASKS}me?status=${status}`);
};

const getAuditCounts = (audits: IAuditSession[], user: IUser | null) => {
  const counts = { PENDING: 0, PENDING_APPROVAL: 0, APPROVED: 0, REJECTED: 0 };
  audits.forEach(audit => {
    const status = getAuditDerivedStatus(audit, user);
    if (status in counts) {
      counts[status as keyof typeof counts]++;
    }
  });
  return counts;
};

const getAuditCountByStatus = async (status: string, user?: IUser | null): Promise<number> => {
  const myAuditsRes = await fetchWithInFlight<AuditListResponse>(endpoints.AUDIT_MY_AUDITS);
  const myAuditsData: IAuditSession[] = Array.isArray(myAuditsRes.data)
    ? myAuditsRes.data
    : myAuditsRes.data?.items || [];
  return myAuditsData.filter((a) => {
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
      const workflowCount = workflowRes.data?.items?.length ?? 0;
      return workflowCount + auditCount;
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
        myAuditsRes
      ] = await Promise.all([
        getTaskCountByStatus('PENDING'),
        getTaskCountByStatus('APPROVED'),
        getTaskCountByStatus('REJECTED'),
        fetchWithInFlight<AuditListResponse>(endpoints.AUDIT_MY_AUDITS),
      ]);

      const pendingCount = pending.data?.items?.length ?? 0;
      const approvedCount = approved.data?.items?.length ?? 0;
      const rejectedCount = rejected.data?.items?.length ?? 0;

      const myAuditsData: IAuditSession[] = Array.isArray(myAuditsRes.data)
        ? myAuditsRes.data
        : myAuditsRes.data?.items || [];

      const myAuditsCounts = getAuditCounts(myAuditsData, user);

      const workflow_tasks = {
        PENDING: pendingCount,
        PENDING_APPROVAL: 0,
        APPROVED: approvedCount,
        REJECTED: rejectedCount,
      };

      const my_audits = myAuditsCounts;

      const PENDING = pendingCount + myAuditsCounts.PENDING;
      const APPROVED = approvedCount + myAuditsCounts.APPROVED;
      const REJECTED = rejectedCount + myAuditsCounts.REJECTED;
      const PENDING_APPROVAL = myAuditsCounts.PENDING_APPROVAL;

      return {
        counts: {
          PENDING,
          APPROVED,
          REJECTED,
          PENDING_APPROVAL,
        },
        countsByTab: {
          workflow_tasks,
          my_audits,
          audits_pending_approval: { PENDING: 0, PENDING_APPROVAL: 0, APPROVED: 0, REJECTED: 0 },
        },
        myAudits: myAuditsData,
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
  countsByTab: {
    workflow_tasks: {
      PENDING: number;
      PENDING_APPROVAL: number;
      APPROVED: number;
      REJECTED: number;
    };
    my_audits: {
      PENDING: number;
      PENDING_APPROVAL: number;
      APPROVED: number;
      REJECTED: number;
    };
    audits_pending_approval: {
      PENDING: number;
      PENDING_APPROVAL: number;
      APPROVED: number;
      REJECTED: number;
    };
  };
  myAudits: IAuditSession[];
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
  countsByTab: {
    workflow_tasks: { PENDING: 0, PENDING_APPROVAL: 0, APPROVED: 0, REJECTED: 0 },
    my_audits: { PENDING: 0, PENDING_APPROVAL: 0, APPROVED: 0, REJECTED: 0 },
    audits_pending_approval: { PENDING: 0, PENDING_APPROVAL: 0, APPROVED: 0, REJECTED: 0 },
  },
  myAudits: [],
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
        state.counts = action.payload.counts;
        state.countsByTab = action.payload.countsByTab;
        state.myAudits = action.payload.myAudits || [];
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
