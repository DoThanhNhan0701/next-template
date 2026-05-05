import { ILocation } from "./location";
import { IOrgUnit } from "./org";
import { IPhysicalAsset } from "./physical-asset";
import { IStatus } from "./status";

export interface IAllocationSummary {
  id: number;
  asset_name: string;
  asset_code: string;
  allocated_to_name: string;
  allocated_to_type: string;
  allocation_date: string;
  total_quantity: number;
  unit_name: string;
  reason: string;
  status: string;
  status_color: string;
}

export interface IAllocationDetailItem {
  id: number;
  asset_id: number;
  asset: IPhysicalAsset;
  location: ILocation;
  quantity: number;
}

export interface IAllocationFull {
  id: number;
  record_number: string;
  allocated_to_type: string;
  staff_id: number;
  allocated_to_name: string;
  allocation_date: string;
  reason: string;
  total_quantity: number;
  unit_id: number;
  unit: IOrgUnit;
  issuer_id: number;
  issuer_name: string;
  location_id: number | null;
  location_name: string | null;
  details: IAllocationDetailItem[];
  status_obj: IStatus;
  created_at: string;
  attachments: string[];
  external_link: string | null;
}
