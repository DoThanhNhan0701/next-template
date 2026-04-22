import { z } from "zod";

export const OrgUnitSchema = z.object({
  name: z.string().min(1, "Field is required!"),
  code: z.string().min(1, "Field is required!"),
  unit_type: z.enum(["company", "department", "branch"]),
  parent_id: z.number().nullable().optional(),
  leader_id: z.number().nullable().optional(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean(),
});

export type IOrgUnitFormValues = z.infer<typeof OrgUnitSchema>;
