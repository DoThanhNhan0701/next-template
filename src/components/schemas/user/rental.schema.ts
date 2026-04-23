import { z } from "zod";

export const RentalCreateItemSchema = z.object({
  asset_id: z.number().min(1, "Field is required!"),
  quantity: z.number().min(1, "Field is required!"),
  from_location_id: z.number().default(0),
  rental_revenue: z.number().min(0, "Doanh thu không hợp lệ").default(0),
  lessee_location: z.string().optional().default(""),
});

export const RentalCreateSchema = z.object({
  record_number: z.string().optional().default(""),
  unit_id: z.number().min(1, "Field is required!"),
  customer_id: z.number().min(1, "Field is required!"),
  lease_date: z.string().min(1, "Field is required!"),
  duration_days: z.number().min(1, "Field is required!"),
  reason: z.string().optional().default(""),
  total_revenue: z.number().min(0).default(0),
  contract_number: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  external_link: z.string().optional().default(""),
  attachments: z.array(z.string()).default([]),
  items: z.array(RentalCreateItemSchema).min(1, "Field is required!"),
  required_steps: z.number().default(0),
  approvals: z.record(z.string(), z.number().nullable().optional()).optional(),
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
