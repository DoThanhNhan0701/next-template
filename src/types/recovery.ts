import { ILocation } from "./location";
import { IOrgUnit } from "./org";
import { IPhysicalAsset } from "./physical-asset";
import { IStatus } from "./status";

export interface IRecoverySummary {
  id: number;
  asset_name: string;
  asset_code: string;
  recovered_from_name: string;
  recovered_from_type: string;
  recovery_date: string;
  total_quantity: number;
  unit_name: string;
  notes: string | null;
  status: string;
  status_color: string;
}

export interface IRecoveryDetailItem {
  id: number;
  asset_id: number;
  asset: IPhysicalAsset;
  location: ILocation;
  quantity: number;
}

export interface IRecoveryFull {
  id: number;
  record_number: string;
  recovered_from_type: string;
  staff_id: number;
  recovered_from_name: string;
  recovery_date: string;
  notes: string | null;
  total_quantity: number;
  unit_id: number;
  unit: IOrgUnit;
  issuer_id: number;
  issuer_name: string;
  location_id: number | null;
  location_name: string | null;
  details: IRecoveryDetailItem[];
  status_obj: IStatus;
  created_at: string;
  attachments: string[];
  external_link: string | null;
}
