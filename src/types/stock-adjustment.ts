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

export interface IStockAdjustmentAsset {
  id: number;
  asset_code: string;
  name: string;
  holder_name: string | null;
  unit_id: number;
  location_id: number;
  status_obj: {
    id: number;
    category: string;
    code: string;
    name: string;
    color: string;
    is_system: boolean;
  };
  attachments: unknown[];
}

export interface IStockAdjustmentLocation {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

export interface IStockAdjustmentDetail {
  id: number;
  asset_id: number;
  location_id: number;
  adjustment_type: "INCREASE" | "DECREASE";
  quantity_diff: number;
  notes: string | null;
  asset: IStockAdjustmentAsset;
  location: IStockAdjustmentLocation;
}

export interface IStockAdjustmentFull {
  id: number;
  record_number: string;
  adjustment_date: string;
  reason: string;
  total_quantity: number;
  external_link: string | null;
  attachments: string[];
  details: IStockAdjustmentDetail[];
  status_obj: {
    id: number;
    category: string;
    code: string;
    name: string;
    color: string;
    is_system: boolean;
  };
  creator: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
  };
  created_at: string;
}
