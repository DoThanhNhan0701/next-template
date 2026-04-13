export interface IStockAdjustment {
  id: number;
  record_number: string;
  adjustment_date: string;
  reason: string;
  total_quantity: number;
  status: string | null;
  status_color: string;
  asset_names: string;
  adjustment_type: "INCREASE" | "DECREASE";
}
