import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = ReturnType<typeof useTranslations>;

export const GetOrgUnitSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t("validation.field_required")),
    code: z.string().min(1, t("validation.field_required")),
    unit_type: z.enum(["company", "department", "branch"]),
    parent_id: z.number().nullable().optional(),
    leader_id: z.number().nullable().optional(),
    address: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    is_active: z.boolean(),
  });

export type IOrgUnitFormValues = z.infer<ReturnType<typeof GetOrgUnitSchema>>;
