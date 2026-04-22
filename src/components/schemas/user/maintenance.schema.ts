import { z } from "zod";
import type { FieldValues } from "react-hook-form";

export interface MaintenanceFormValues extends FieldValues {
  record_number: string;
  ticket_number: string;
  reason: string;
  handover_person: string;
  taker_person_name: string;
  taker_phone?: string | null;
  service_provider_name: string;
  service_provider_address?: string | null;
  notes?: string | null;
  expected_cost: number;
  actual_cost: number;
  external_link?: string | null;
  outing_date: string;
  items: {
    asset_id: number;
    quantity: number;
    notes?: string | null;
    from_location_id: number;
    from_staff_id: number;
    from_unit_id: number;
    return_to_location_id?: number | null;
  }[];
  attachments: string[];
  approvals: Record<string, number | null | undefined>;
  required_steps: number;
  workflow_assignments: {
    step_id: number;
    user_id: number;
  }[];
}

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
    attachments: z.array(z.string()),
    approvals: z.record(z.string(), z.number().nullable().optional()),
    required_steps: z.number(),
    workflow_assignments: z.array(
      z.object({
        step_id: z.coerce.number(),
        user_id: z.coerce.number().min(1, "Field is required!"),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    // Validate each expected step has a user assigned
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
