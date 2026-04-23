import { z } from "zod";
import { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const GetStepSchema = (t: TFunction) =>
  z.object({
    id: z.number().optional(),
    step_order: z.number().min(1),
    name: z.string().min(1, t("field_required")),
    default_assignee_role_id: z.number().nullable().optional(),
    default_assignee_user_id: z.number().nullable().optional(),
  });

export const GetTemplateSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t("field_required")),
    document_type: z.string().min(1, t("field_required")),
    description: z.string().optional(),
    is_active: z.boolean(),
    is_locked: z.boolean(),
    steps: z.array(GetStepSchema(t)),
  });

export type TemplateFormValues = z.infer<ReturnType<typeof GetTemplateSchema>>;
