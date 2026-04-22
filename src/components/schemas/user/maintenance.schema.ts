import { z } from "zod";

export const MaintenanceSchema = z
  .object({
    record_number: z.string().min(1, "Field is required!"),
    ticket_number: z.string().min(1, "Field is required!"),
    reason: z.string().min(1, "Field is required!"),
    handover_person: z.string().min(1, "Field is required!"),
    taker_person_name: z.string().min(1, "Field is required!"),
    taker_phone: z.string().nullable().optional(),
    service_provider_name: z.string().min(1, "Field is required!"),
    service_provider_address: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    expected_cost: z.coerce.number(),
    actual_cost: z.coerce.number(),
    external_link: z.string().nullable().optional(),
    outing_date: z.string().min(1, "Field is required!"),
    items: z
      .array(
        z.object({
          asset_id: z.coerce.number().min(1, "Field is required!"),
          quantity: z.coerce.number().min(1, "Field is required!"),
          notes: z.string().nullable().optional(),
          from_location_id: z.coerce.number(),
          from_staff_id: z.coerce.number(),
          from_unit_id: z.coerce.number(),
          return_to_location_id: z.coerce.number().nullable().optional(),
        }),
      )
      .min(1, "Field is required!"),
    attachments: z.array(z.string()).optional().default([]),
    approvals: z.record(z.string(), z.number().nullable().optional()).default({}),
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

export type MaintenanceFormValues = z.infer<typeof MaintenanceSchema>;
