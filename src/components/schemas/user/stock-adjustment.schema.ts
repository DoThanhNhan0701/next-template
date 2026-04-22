import { z } from "zod";

export const DetailSchema = z.object({
  asset_id: z.number().min(1, "Field is required!"),
  location_id: z.number().min(1, "Field is required!"),
  adjustment_type: z.enum(["INCREASE", "DECREASE"]),
  quantity_diff: z.number().min(1, "Field is required!"),
  notes: z.string().optional(),
});

export const StockAdjustmentSchema = z
  .object({
    adjustment_date: z.string().min(1, "Field is required!"),
    reason: z.string().min(1, "Field is required!"),
    external_link: z.string().optional(),
    attachments: z.array(z.string()).optional(),
    required_steps: z.number().optional(),
    approvals: z
      .record(z.string(), z.number().nullable().optional())
      .optional(),
    details: z.array(DetailSchema).min(1, "Field is required!"),
  })
  .superRefine((data, ctx) => {
    // Validate approval process steps dynamically if a template exists
    if (data.required_steps && data.required_steps > 0) {
      for (let i = 0; i < data.required_steps; i++) {
        const approver = data.approvals?.[`step_${i}`];
        if (!approver || approver < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Field is required!",
            path: ["approvals", `step_${i}`],
          });
        }
      }
    }
  });

export type StockAdjustmentFormValues = z.infer<typeof StockAdjustmentSchema>;
