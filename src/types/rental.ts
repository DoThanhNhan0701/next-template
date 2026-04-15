import { IPhysicalAsset } from "./physical-asset";

export interface IRentalDetail {
  id: number;
  asset_id: number;
  asset: IPhysicalAsset;
  quantity: number;
  rental_revenue: number;
  lessee_location: string | null;
}

export interface IRental {
  record_number: string;
  lease_date: string;
  id: number;
  asset_code: string;
  asset_name: string;
  customer_id: number;
  customer_name: string;
  total_assets: number;
  status: string;
  status_color: string;
  reason: string | null;
}

export interface IRentalCreateItemPayload {
  asset_id: number;
  quantity: number;
  from_location_id: number;
  rental_revenue: number;
  lessee_location: string;
}

export interface IRentalCreatePayload {
  record_number: string;
  unit_id: number;
  customer_id: number;
  lease_date: string; // ISO String
  duration_days: number;
  reason: string;
  total_revenue: number;
  contract_number: string;
  notes: string;
  external_link: string;
  attachments: string[];
  items: IRentalCreateItemPayload[];
}

export interface IRentalSummary {
  id: number;
  record_number: string;
  customer_name: string;
  customer_type: "individual" | "organization";
  contract_number: string;
  lease_date: string;
  return_date?: string;
  total_assets: number;
  status: string;
  status_color: string;
  notes?: string;
}

