export interface ITransfer {
  id: number;
  record_number: string;
  transfer_date: string;
  transfer_type: string;
  asset_code: string;
  asset_name: string;
  from_name: string | null;
  to_name: string | null;
  total_assets: number;
  status: string;
  status_color: string;
  reason: string;
}
