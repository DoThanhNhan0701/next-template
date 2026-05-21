import { z } from "zod";

export const PhysicalAssetSchema = z.object({
  asset_code: z.string().optional().nullable(),
  name: z.string().min(1, "Field is required!"),
  serial_number: z.string().optional(),
  model: z.string().nullable().optional(),
  request_ticket: z.string().nullable().optional(),
  importance_id: z.coerce.number().int().min(1, "Field is required!"),
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
  quantity: z.coerce.number().int().min(1, "Field is required!").nullable().optional(),
  measure_unit_id: z.coerce.number().int().min(0).nullable().optional(),
  holder_id: z.coerce.number().int().nullable().optional(),
  holder_name: z.string().nullable().optional(),
  staff_id: z.coerce.number().int().nullable().optional(),
  category_id: z.coerce.number().int().min(1, "Field is required!"),
  supplier_id: z.coerce.number().int().nullable().optional(),
  manager_id: z.coerce.number().int().nullable().optional(),
  status_id: z.coerce.number().int().min(1, "Field is required!"),
  usage_mode_id: z.coerce.number().int().min(1, "Field is required!"),
  location_id: z.coerce.number().int().nullable().optional(),
  asset_system_id: z.coerce.number().int().nullable().optional(),
  unit_id: z.coerce.number().int().min(1, "Field is required!"),
  location: z.string().nullable().optional(),
  specifications: z.string().optional(),
  notes: z.string().optional(),
  management_type: z.enum(["unique", "bulk"]).optional(),
  attachments: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.management_type === "bulk") {
      return data.quantity !== null && data.quantity !== undefined && data.quantity > 0;
    }
    return true;
  },
  {
    message: "Field is required!",
    path: ["quantity"],
  }
)
