export interface ILiquidation {
  id: number;
  record_number: string;
  liquidation_date: string;
  asset_name: string;
  asset_code: string;
  reason: string;
  status: string;
  status_color: string;
  total_assets: number;
  items: ILiquidationItem[];
}

export interface ILiquidationItem {
  id?: number;
  asset_id: number;
  asset_code?: string;
  asset_name?: string;
  quantity: number;
  notes: string | null;
}
