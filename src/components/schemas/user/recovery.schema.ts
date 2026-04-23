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
  items: z
    .array(RecoveryCreateItemSchema)
    .min(1, "Field is required!"),
  required_steps: z.number().default(0),
  approvals: z.record(z.string(), z.number().nullable().optional()).optional(),
  attachments: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  for (let i = 0; i < data.required_steps; i++) {
    const approverId = data.approvals?.[`step_${i}`];
    if (!approverId || approverId === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Field is required!",
        path: ["approvals", `step_${i}`],
      });
    }
  }
});
