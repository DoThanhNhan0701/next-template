import { z } from "zod";

export const LiquidationSchema = z.object({
  record_number: z.string().min(1, "Required"),
  reason: z.string().min(1, "Required"),
  notes: z.string().nullable(),
  liquidation_date: z.string().min(1, "Required"),
  liquidation_type: z.string().min(1, "Required"),
  committee: z.array(z.number()),
  total_value: z.number(),
  buyer_name: z.string().nullable(),
  external_link: z.string().nullable(),
  attachments: z.array(z.string()),
  items: z
    .array(
      z.object({
        asset_id: z.number().min(1, "Required"),
        quantity: z.number().min(1, "Required"),
        unit_value: z.number(),
        remaining_value: z.number(),
        notes: z.string().nullable(),
        from_location_id: z.number(),
        from_staff_id: z.number(),
        from_unit_id: z.number(),
      }),
    )
    .min(1, "At least one item is required"),
  workflow_assignments: z.array(
    z.object({
      step_id: z.number(),
      user_id: z.number(),
    }),
  ),
});

export type LiquidationFormValues = z.infer<typeof LiquidationSchema>;
