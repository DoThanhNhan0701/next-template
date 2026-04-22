import { z } from "zod";

export const AllocationCreateItemSchema = z.object({
  asset_id: z.coerce.number().min(1, "Field is required!"),
  quantity: z.coerce.number().min(1, "Field is required!"),
  location_id: z.coerce.number().min(1, "Field is required!"),
});

export const AllocationCreateSchema = z.object({
  allocated_to_type: z.string().default("user"),
  staff_id: z.coerce.number().optional().nullable(),
  unit_id: z.coerce.number().min(1, "Field is required!"),
  allocation_date: z.string().min(1, "Field is required!"),
  location_id: z.coerce.number().optional().nullable(),
  reason: z.string().min(1, "Field is required!"),
  external_link: z.string().optional().default(""),
  items: z
    .array(AllocationCreateItemSchema)
    .min(1, "Field is required!"),
  approver_step_1_id: z.coerce.number().optional().nullable(),
  approver_step_2_id: z.coerce.number().optional().nullable(),
  attachments: z.array(z.string()).optional(),
});
