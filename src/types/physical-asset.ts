export interface IPhysicalAsset {
  id: number;
  asset_code: string;
  name: string;
  serial_number: string;
  model: string;
  request_ticket: string | null;
  importance_id: number;
  initial_location_id: number | null;
  owner: string | null;
  risk_owner_id: number | null;
  old_code: string | null;
  purchase_ticket: string | null;
  purchase_date: string | null;
  system_declaration_date: string | null;
  cost: number;
  depreciation_period: number | null;
  depreciation_value: number | null;
  warranty_expiration: string | null;
  quantity: number | null;
  unit_id: number;
  measure_unit_id: number | null;
  holder_id: number | null;
  holder_name: string | null;
  staff_id: number | null;
  category_id: number | null;
  supplier_id: number | null;
  manager_id: number | null;
  status_id: number;
  usage_mode_id: number | null;
  location_id: number | null;
  asset_system_id: number | null;
  org_id: number | null;
  location: string | null;
  specifications: string;
  notes: string;
  management_type?: "unique" | "bulk";
  attachments?: string[] | null;
  holding_qty: number | null;
  in_stock_quantity?: number;
  allocated_quantity?: number;
  rented_quantity?: number;
  current_stock?: number;
  status_obj?: { code: string; name: string; color: string; } | null;
  location_obj?: { name: string; } | null;
  category?: { name: string; } | null;
  unit?: { name: string; } | null;
  supplier?: { name: string; } | null;
}

export interface IPhysicalAssetCreate {
  asset_code: string;
  name: string;
  serial_number?: string;
  model?: string;
  request_ticket?: string | null;
  importance_id: number;
  initial_location_id?: number | null;
  owner?: string | null;
  risk_owner_id?: number | null;
  old_code?: string | null;
  purchase_ticket?: string | null;
  purchase_date?: string | null;
  system_declaration_date?: string | null;
  cost: number;
  depreciation_period?: number | null;
  depreciation_value?: number | null;
  warranty_expiration?: string | null;
  quantity?: number | null;
  unit_id: number;
  measure_unit_id?: number | null;
  holder_id?: number | null;
  staff_id?: number | null;
  category_id?: number | null;
  supplier_id?: number | null;
  manager_id?: number | null;
  status_id: number;
  usage_mode_id?: number | null;
  location_id?: number | null;
  asset_system_id?: number | null;
  org_id?: number | null;
  location?: string | null;
  specifications?: string;
  notes?: string;
  management_method?: "unique" | "batch";
  attachments?: string[] | null;
}

export type IPhysicalAssetUpdate = Partial<IPhysicalAssetCreate>;

export interface IPhysicalAssetDetail {
  id: number;
  asset_code: string;
  name: string;
  serial_number: string | null;
  model: string | null;
  request_ticket: string | null;
  importance_id: number | null;
  initial_location_id: number | null;
  owner: string | null;
  risk_owner_id: number | null;
  old_code: string | null;
  purchase_ticket: string | null;
  purchase_date: string | null;
  system_declaration_date: string | null;
  cost: number;
  depreciation_period: number | null;
  depreciation_value: number | null;
  warranty_expiration: string | null;
  quantity: number | null;
  unit_id: number | null;
  staff_id: number | null;
  holder_name: string | null;
  category_id: number | null;
  supplier_id: number | null;
  manager_id: number | null;
  status_id: number | null;
  usage_mode_id: number | null;
  location_id: number | null;
  asset_system_id: number | null;
  location: string | null;
  specifications: string;
  notes: string;
  attachments: string[];
  management_type: string;
  current_stock: number | null;
  supplier: { name: string; } | null;
  status_obj: { code: string; name: string; color: string; } | null;
  importance_obj: { code: string; name: string; color: string; } | null;
  usage_mode: { name: string; color: string; } | null;
  category: { name: string; } | null;
  unit: { name: string; } | null;
  location_obj: { name: string; } | null;
  total_quantity: number;
  allocated_quantity: number;
  rented_quantity: number;
  in_stock_quantity: number;
  maintenance_quantity: number;
  liquidated_quantity: number;
  catalog_group_name?: string | null;
  group_name?: string | null;
  process_history?: ILifecycleLog[];
  change_log?: ILifecycleLog[];
}

export interface ILifecycleLog {
  date: string;
  document_number: string | null;
  action_type: string;
  dept_name: string | null;
  external_link: string | null;
  location_name: string | null;
  notes: string | null;
  old_location_name: string | null;
  old_user_name: string | null;
  quantity: number | null;
  ref_id: number;
  status_name: string;
  total_amount: number;
  unit_price: number;
  user_name: string | null;
  doc_status: string | null;
  doc_status_color: string | null;
}

export interface IAssetStock {
  asset_id: number;
  location_id: number;
  quantity: number;
  location_code: string;
  location_name: string;
  staff_id: number | null;
  unit_id: number | null;
}

export interface IAssetHolder {
  name: string;
  type: string;
  quantity: number;
  staff_id: number | null;
  unit_id: number | null;
  customer_id: number | null;
  source_type: string;
  source_number: string;
  acquired_at: string;
}
export interface IAssetModule {
  id: number;
  asset_id: number;
  name: string;
  module_code: string;
  module_type: string;
  serial_number: string | null;
  model: string | null;
  quantity: number;
  cost: number;
  purchase_date: string | null;
  warranty_expiration: string | null;
  status: string;
  attached_date: string;
  detached_date: string | null;
  notes: string | null;
  created_at: string;
}
