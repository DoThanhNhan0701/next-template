import { z } from "zod";

export const RecoveryCreateItemSchema = z.object({
  asset_id: z.coerce.number().min(1, "Please select an asset"),
  quantity: z.coerce.number().min(1, "Quantity must be greater than 0"),
  location_id: z.coerce.number().min(1, "Please select an issuing warehouse"),
});

export const RecoveryCreateSchema = z.object({
  recovered_from_type: z.string().default("user"),
  staff_id: z.coerce.number().optional().nullable(),
  unit_id: z.coerce.number().min(1, "Owning/Managing unit is required"),
  recovery_date: z.string().min(1, "Recovery date is required"),
  location_id: z.coerce.number().optional().nullable(),
  reason: z.string().min(1, "Recovery reason is required"),
  external_link: z.string().optional().default(""),
  items: z
    .array(RecoveryCreateItemSchema)
    .min(1, "At least one asset is required"),
});
