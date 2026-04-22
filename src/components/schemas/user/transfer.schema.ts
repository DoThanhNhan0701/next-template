import { z } from "zod";

export const TransferSchema = z.object({
  source_type: z.enum(["holder", "location"]),
  source_id: z.number().min(1, "Field is required!"),
  target_unit_id: z.number().optional().nullable(),
  target_id: z.number().optional().nullable(),
  location_id: z.number().optional().nullable(),
  approvals: z.record(z.string(), z.number().nullable().optional()).optional(),
  transfer_date: z.string().min(1, "Field is required!"),
  external_link: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  attachments: z.array(z.string()).optional(),
  required_steps: z.number().optional(),
  details: z
    .array(
      z.object({
        asset_id: z.number().min(1, "Field is required!"),
        quantity: z.number().min(1, "Field is required!"),
      }),
    )
    .min(1, "Field is required!"),
}).superRefine((data, ctx) => {
  if (!data.target_id || data.target_id < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Field is required!",
      path: ["target_id"],
    });
  }

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

export type TransferFormValues = z.infer<typeof TransferSchema>;
