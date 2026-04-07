import { z } from "zod";

export const PhysicalAssetSchema = z.object({
  asset_code: z.string().min(1, "Asset code is required"),
  name: z.string().min(1, "Asset name is required"),
  serial_number: z.string().optional(),
  model: z.string().optional(),
  request_ticket: z.string().nullable().optional(),
  importance_id: z.coerce.number().int().min(1, "Importance is required"),
  initial_location_id: z.coerce.number().int().nullable().optional(),
  owner: z.string().nullable().optional(),
  risk_owner_id: z.coerce.number().int().nullable().optional(),
  old_code: z.string().nullable().optional(),
  purchase_ticket: z.string().nullable().optional(),
  purchase_date: z.string().nullable().optional().or(z.literal("")),
  system_declaration_date: z.string().nullable().optional().or(z.literal("")),
  cost: z.coerce.number().min(0, "Cost must be positive"),
  depreciation_period: z.coerce.number().int().nullable().optional(),
  depreciation_value: z.coerce.number().nullable().optional(),
  warranty_expiration: z.string().nullable().optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  measure_unit_id: z.coerce.number().int().min(0).nullable().optional(),
  holder_id: z.coerce.number().int().nullable().optional(),
  holder_name: z.string().nullable().optional(),
  category_id: z.coerce.number().int().nullable().optional(),
  supplier_id: z.coerce.number().int().nullable().optional(),
  manager_id: z.coerce.number().int().nullable().optional(),
  status_id: z.coerce.number().int().min(1, "Status is required"),
  usage_mode_id: z.coerce.number().int().nullable().optional(),
  location_id: z.coerce.number().int().nullable().optional(),
  asset_system_id: z.coerce.number().int().nullable().optional(),
  unit_id: z.coerce.number().int().min(0).nullable().optional(),
  location: z.string().nullable().optional(),
  specifications: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    const hasLocation = !!data.location_id || !!data.location;
    const hasHolder = !!data.holder_id || !!data.holder_name;
    return !(hasLocation && hasHolder);
  },
  {
    message: "Cannot assign both a Location and a Holder",
    path: ["location_id"], // Showing the error on Location field by default
  },
);
