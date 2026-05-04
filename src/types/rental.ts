import { IPhysicalAsset } from "./physical-asset";

export interface IRentalDetail {
  id: number;
  asset_id: number;
  asset: IPhysicalAsset;
  quantity: number;
  returned_quantity: number;
  rental_revenue: number;
  from_location_id: number;
  from_location: {
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    id: number;
  };
  lessee_location: string;
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

export interface IRentalFull {
  id: number;
  record_number: string;
  unit_id: number;
  customer_id: number;
  lease_date: string;
  duration_days: number;
  total_revenue: number;
  contract_number: string;
  notes: string;
  external_link: string;
  attachments: string[];
  status_id: number;
  status_obj: {
    id: number;
    category: string;
    code: string;
    name: string;
    color: string;
    is_system: boolean;
  };
  unit: {
    name: string;
    code: string;
    unit_type: string;
    parent_id: number | null;
    leader_id: number | null;
    address: string;
    description: string;
    is_active: boolean;
    id: number;
  };
  customer: {
    name: string;
    customer_type: string;
    identifier: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    is_active: boolean;
    id: number;
  };
  details: IRentalDetail[];
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
  asset_name: string;
  asset_code: string;
  total_assets: number;
  lease_date: string;
  status: string;
  status_color: string;
  reason?: string;
}

