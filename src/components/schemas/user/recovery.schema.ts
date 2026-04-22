import { z } from "zod";

export const RecoveryCreateItemSchema = z.object({
  asset_id: z.coerce.number().min(1, "Field is required!"),
  quantity: z.coerce.number().min(1, "Field is required!"),
  location_id: z.coerce.number().min(1, "Field is required!"),
});

export const RecoveryCreateSchema = z.object({
  recovered_from_type: z.string().default("user"),
  staff_id: z.coerce.number().optional().nullable(),
  unit_id: z.coerce.number().min(1, "Field is required!"),
  recovery_date: z.string().min(1, "Field is required!"),
  location_id: z.coerce.number().optional().nullable(),
  reason: z.string().min(1, "Field is required!"),
  external_link: z.string().optional().default(""),
  approver_step_1_id: z.number().nullable().optional(),
  approver_step_2_id: z.number().nullable().optional(),
  items: z
    .array(RecoveryCreateItemSchema)
    .min(1, "Field is required!"),
  attachments: z.array(z.string()).optional(),
});
