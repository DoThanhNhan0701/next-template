import { z } from "zod";

export const AllocationCreateItemSchema = z.object({
  asset_id: z.coerce.number().min(1, "Please select an asset"),
  quantity: z.coerce.number().min(1, "Quantity must be greater than 0"),
  location_id: z.coerce.number().min(1, "Please select an issuing warehouse"),
});

export const AllocationCreateSchema = z.object({
  allocated_to_type: z.string().default("user"),
  staff_id: z.coerce.number().optional().nullable(),
  unit_id: z.coerce.number().min(1, "Receiving unit is required"),
  allocation_date: z.string().min(1, "Allocation date is required"),
  location_id: z.coerce.number().optional().nullable(),
  reason: z.string().min(1, "Allocation reason is required"),
  external_link: z.string().optional().default(""),
  items: z
    .array(AllocationCreateItemSchema)
    .min(1, "At least one asset is required"),
  approver_step_1_id: z.coerce.number().optional().nullable(),
  approver_step_2_id: z.coerce.number().optional().nullable(),
});
