import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AllocationPrefill {
    asset_id: number;
    location_id: number;
    unit_id: number;
}

interface AllocationState {
    prefill: AllocationPrefill | null;
    isOpen: boolean;
}

const initialState: AllocationState = {
    prefill: null,
    isOpen: false,
};

const allocationSlice = createSlice({
    name: 'allocation',
    initialState,
    reducers: {
        openAllocation: (state, action: PayloadAction<AllocationPrefill>) => {
            state.prefill = action.payload;
            state.isOpen = true;
        },
        closeAllocation: (state) => {
            state.isOpen = false;
            state.prefill = null;
        },
    },
});

export const { openAllocation, closeAllocation } = allocationSlice.actions;
export default allocationSlice.reducer;
