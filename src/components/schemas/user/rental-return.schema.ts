import { z } from "zod";

export const RentalReturnSchema = z
  .object({
    return_date: z.string().min(1, "Field is required!"),
    notes: z.string().nullable().optional(),
    to_location_id: z.string().min(1, "Field is required!"),
    items: z
      .array(
        z.object({
          asset_id: z.number().min(1, "Field is required!"),
          rental_detail_id: z.number().min(1, "Field is required!"),
          quantity: z.coerce.number().min(0, "Must be >= 0"),
          condition: z.string().min(1, "Field is required!"),
          asset_name: z.string(),
          asset_code: z.string(),
          max_quantity: z.number(),
          selected: z.boolean(),
        }),
      )
      .min(1, "At least one asset is required!"),
    approvals: z.record(z.string(), z.number().nullable().optional()).default({}),
    attachments: z.array(z.string()).optional(),
    required_steps: z.number().default(0),
    workflow_assignments: z
      .array(
        z.object({
          step_id: z.coerce.number(),
          user_id: z.coerce.number().min(1, "Field is required!"),
        }),
      )
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    for (let i = 0; i < data.required_steps; i++) {
      const stepKey = `step_${i}`;
      const userId = data.approvals[stepKey];
      if (!userId || userId === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Field is required!",
          path: ["approvals", stepKey],
        });
      }
    }
  });

export type RentalReturnFormValues = z.infer<typeof RentalReturnSchema>;
