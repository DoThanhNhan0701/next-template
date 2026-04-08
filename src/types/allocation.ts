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
