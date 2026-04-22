import { z } from "zod";

export const DetailSchema = z.object({
  asset_id: z.number().min(1, "Field is required!"),
  location_id: z.number().min(1, "Field is required!"),
  adjustment_type: z.enum(["INCREASE", "DECREASE"]),
  quantity_diff: z.number().min(1, "Field is required!"),
  notes: z.string().optional(),
});

export const StockAdjustmentSchema = z.object({
  adjustment_date: z.string().min(1, "Field is required!"),
  reason: z.string().min(1, "Field is required!"),
  external_link: z.string().optional(),
  approver_step_1_id: z.number().nullable().optional(),
  approver_step_2_id: z.number().nullable().optional(),
  attachments: z.array(z.string()).optional(),
  details: z.array(DetailSchema).min(1, "Field is required!"),
});

export type StockAdjustmentFormValues = z.infer<typeof StockAdjustmentSchema>;
