export interface DashboardSummaryResponse {
  financials: {
    total_asset_value: number;
    total_maintenance_cost: number;
    total_rental_revenue: number;
  };
  total_assets_count: number;
  total_locations_count: number;
  total_users_count: number;
}

export interface DashboardModuleStats {
  pending_allocations: number;
  pending_transfers: number;
  pending_maintenances: number;
  pending_liquidations: number;
  pending_workflow_tasks: number;
}

export interface DashboardRecentActivity {
  id: number;
  action_type: string;
  action_label: string;
  color: string;
  performed_at: string;
  asset_code: string;
  asset_name: string;
  performed_by: string;
}

export interface DashboardStatusChart {
  status_code: string;
  status_name: string;
  color: string;
  count: number;
}
