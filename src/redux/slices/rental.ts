import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface RentalPrefill {
    asset_id: number;
    location_id: number;
    unit_id: number;
    reason?: string;
}

interface RentalState {
    prefill: RentalPrefill | null;
    isOpen: boolean;
}

const initialState: RentalState = {
    prefill: null,
    isOpen: false,
};

const rentalSlice = createSlice({
    name: 'rental',
    initialState,
    reducers: {
        openRental: (state, action: PayloadAction<RentalPrefill>) => {
            state.prefill = action.payload;
            state.isOpen = true;
        },
        closeRental: (state) => {
            state.isOpen = false;
            state.prefill = null;
        },
    },
});

export const { openRental, closeRental } = rentalSlice.actions;
export default rentalSlice.reducer;
