import { IOrgUnit } from "./org";
import { ICustomer } from "./customer";
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
  id: number;
  record_number: string;
  unit_id: number;
  customer_id: number;
  lease_date: string;
  duration_days: number;
  total_revenue: number;
  contract_number: string;
  notes: string;
  external_link: string | null;
  attachments: string[];
  unit: IOrgUnit;
  customer: ICustomer;
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
