import { z } from "zod";

export const LiquidationSchema = z.object({
  record_number: z.string().min(1, "Field is required!"),
  reason: z.string().min(1, "Field is required!"),
  notes: z.string().nullable(),
  liquidation_date: z.string().min(1, "Field is required!"),
  liquidation_type: z.string().min(1, "Field is required!"),
  committee: z.array(z.number()),
  total_value: z.number(),
  buyer_name: z.string().nullable(),
  external_link: z.string().nullable(),
  attachments: z.array(z.string()).optional(),
  items: z
    .array(
      z.object({
        asset_id: z.number().min(1, "Field is required!"),
        quantity: z.number().min(1, "Field is required!"),
        unit_value: z.number(),
        remaining_value: z.number(),
        notes: z.string().nullable(),
        from_location_id: z.number(),
        from_staff_id: z.number(),
        from_unit_id: z.number(),
      }),
    )
    .min(1, "Field is required!"),
  workflow_assignments: z.array(
    z.object({
      step_id: z.number(),
      user_id: z.number().min(1, "Field is required!"),
    }),
  ),
});

export type LiquidationFormValues = z.infer<typeof LiquidationSchema>;
