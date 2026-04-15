import { IStatus } from "./status";

export interface ITransferDetail {
  id: number;
  asset_id: number;
  asset_name: string;
  asset_code: string;
  quantity: number;
  from_location_id: number;
  from_location_name: string;
  to_location_id?: number;
  to_location_name?: string;
}

export interface ITransfer {
  id: number;
  record_number: string;
  transfer_date: string;
  transfer_type: string;
  reason: string;
  total_assets: number;
  external_link: string | null;
  status_obj: IStatus;
  from_name: string;
  to_name: string;
  from_location_id?: number;
  to_location_id?: number;
  // Summary fields for list view
  asset_name?: string;
  asset_code?: string;
  status?: string;
  status_color?: string;
}


export interface ITransferFull extends ITransfer {
  details: ITransferDetail[];
  attachments: unknown[];
}


