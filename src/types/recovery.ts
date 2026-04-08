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
