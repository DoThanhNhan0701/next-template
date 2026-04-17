import { IStatus } from "./status";
import { ILocation } from "./location";
import { IUser } from "./auth";
import { IPhysicalAsset as IAsset } from "./physical-asset";

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
}

export interface ILiquidationFull {
  id: number;
  record_number: string;
  liquidation_date: string;
  liquidation_type: string;
  reason: string;
  committee: string;
  total_value: number;
  buyer_name: string;
  notes: string;
  external_link: string;
  attachments: unknown[];
  creator_id: number;
  creator: IUser;
  status_id: number;
  status_obj: IStatus;
  details: ILiquidationDetail[];
}

export interface ILiquidationDetail {
  id: number;
  asset_id: number;
  asset: IAsset;
  quantity: number;
  unit_value: number;
  remaining_value: number;
  notes: string | null;
  from_location_id: number;
  from_location: ILocation;
}

export interface ILiquidationItem {
  id?: number;
  asset_id: number;
  asset_code?: string;
  asset_name?: string;
  quantity: number;
  notes: string | null;
}
