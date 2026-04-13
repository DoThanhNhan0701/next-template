import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface StockAdjustmentPrefill {
  asset_id: number;
  location_id: number;
  adjustment_type: 'INCREASE' | 'DECREASE';
}

interface StockAdjustmentState {
  prefill: StockAdjustmentPrefill | null;
  isOpen: boolean;
}

const initialState: StockAdjustmentState = {
  prefill: null,
  isOpen: false,
};

const stockAdjustmentSlice = createSlice({
  name: 'stockAdjustment',
  initialState,
  reducers: {
    openStockAdjustment: (state, action: PayloadAction<StockAdjustmentPrefill>) => {
      state.prefill = action.payload;
      state.isOpen = true;
    },
    closeStockAdjustment: (state) => {
      state.isOpen = false;
      state.prefill = null;
    },
  },
});

export const { openStockAdjustment, closeStockAdjustment } = stockAdjustmentSlice.actions;
export default stockAdjustmentSlice.reducer;
