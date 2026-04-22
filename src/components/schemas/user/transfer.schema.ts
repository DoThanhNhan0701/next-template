import { z } from "zod";

export const TransferSchema = z.object({
  source_type: z.enum(["holder", "location"]),
  source_id: z.number().min(1, "Field is required!"),
  target_unit_id: z.number().optional().nullable(),
  target_id: z.number().optional().nullable(),
  location_id: z.number().optional().nullable(),
  approver_step_1_id: z.number().optional().nullable(),
  approver_step_2_id: z.number().optional().nullable(),
  transfer_date: z.string().min(1, "Field is required!"),
  external_link: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  attachments: z.array(z.string()).optional(),
  details: z
    .array(
      z.object({
        asset_id: z.number().min(1, "Field is required!"),
        quantity: z.number().min(1, "Field is required!"),
      }),
    )
    .min(1, "Field is required!"),
});

export type TransferFormValues = z.infer<typeof TransferSchema>;
