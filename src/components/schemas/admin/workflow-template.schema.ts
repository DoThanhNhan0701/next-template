import { z } from "zod";

export const StepSchema = z.object({
  id: z.number().optional(),
  step_order: z.number().min(1),
  name: z.string().min(1, "Field is required!"),
  default_assignee_role_id: z.number().nullable().optional(),
  default_assignee_user_id: z.number().nullable().optional(),
});

export const TemplateSchema = z.object({
  name: z.string().min(1, "Field is required!"),
  document_type: z.string().min(1, "Field is required!"),
  description: z.string().optional(),
  is_active: z.boolean(),
  is_locked: z.boolean(),
  steps: z.array(StepSchema),
});

export type TemplateFormValues = z.infer<typeof TemplateSchema>;
