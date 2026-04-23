import { z } from "zod";
import { type useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const GetRoleSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, { message: t("validation.field_required") }),
    description: z.string().optional().nullable(),
    is_active: z.boolean(),
    permission_ids: z.array(z.number()),
  });

export type RoleFormData = z.infer<ReturnType<typeof GetRoleSchema>>;
