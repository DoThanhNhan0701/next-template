import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = ReturnType<typeof useTranslations>;

export const GetOfficeSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t("field_required")),
    code: z.string().min(1, t("field_required")),
    address: z.string().min(1, t("field_required")),
    description: z.string().nullable().optional(),
    is_active: z.boolean(),
  });

export type IOfficeFormValues = z.infer<ReturnType<typeof GetOfficeSchema>>;
