import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface RecoveryPrefill {
    asset_id: number;
    location_id: number;
    unit_id: number;
    reason?: string;
}

interface RecoveryState {
    prefill: RecoveryPrefill | null;
    isOpen: boolean;
}

const initialState: RecoveryState = {
    prefill: null,
    isOpen: false,
};

const recoverySlice = createSlice({
    name: 'recovery',
    initialState,
    reducers: {
        openRecovery: (state, action: PayloadAction<RecoveryPrefill>) => {
            state.prefill = action.payload;
            state.isOpen = true;
        },
        closeRecovery: (state) => {
            state.isOpen = false;
            state.prefill = null;
        },
    },
});

export const { openRecovery, closeRecovery } = recoverySlice.actions;
export default recoverySlice.reducer;
