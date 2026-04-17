export interface IMaintenance {
  id: number;
  record_number: string;
  ticket_number: string;
  reason: string;
  handover_person: string;
  taker_person_name: string;
  taker_phone: string | null;
  service_provider_name: string;
  service_provider_address: string | null;
  notes: string | null;
  expected_cost: number;
  actual_cost: number;
  external_link: string | null;
  attachments: string[] | null;
  outing_date: string;
  return_date?: string;
  asset_name?: string;
  asset_code?: string;
  status: string;
  status_color: string;
  total_assets: number;
  items: IMaintenanceItem[];
  workflow_assignments: IWorkflowAssignment[];
}

export interface IMaintenanceItem {
  id?: number;
  asset_id: number;
  asset_code?: string;
  asset_name?: string;
  quantity: number;
  notes: string | null;
  from_location_id: number;
  from_staff_id: number;
  from_unit_id: number;
  return_to_location_id: number | null;
}

export interface IWorkflowAssignment {
  step_id: number;
  user_id: number;
}
