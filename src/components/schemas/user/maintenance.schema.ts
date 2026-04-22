import { z } from "zod";

export const MaintenanceSchema = z.object({
  record_number: z.string().min(1, "Field is required!"),
  ticket_number: z.string().min(1, "Field is required!"),
  reason: z.string().min(1, "Field is required!"),
  handover_person: z.string().min(1, "Field is required!"),
  taker_person_name: z.string().min(1, "Field is required!"),
  taker_phone: z.string().nullable(),
  service_provider_name: z.string().min(1, "Field is required!"),
  service_provider_address: z.string().nullable(),
  notes: z.string().nullable(),
  expected_cost: z.number(),
  actual_cost: z.number(),
  external_link: z.string().nullable(),
  outing_date: z.string().min(1, "Field is required!"),
  items: z
    .array(
      z.object({
        asset_id: z.number().min(1, "Field is required!"),
        quantity: z.number().min(1, "Field is required!"),
        notes: z.string().nullable(),
        from_location_id: z.number(),
        from_staff_id: z.number(),
        from_unit_id: z.number(),
        return_to_location_id: z.number().nullable(),
      }),
    )
    .min(1, "Field is required!"),
  attachments: z.array(z.string()).optional(),
  workflow_assignments: z.array(
    z.object({
      step_id: z.number(),
      user_id: z.number().min(1, "Field is required!"),
    }),
  ),
});

export type MaintenanceFormValues = z.infer<typeof MaintenanceSchema>;
