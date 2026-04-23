import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = ReturnType<typeof useTranslations>;

export const GetLocationSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t("field_required")),
    code: z.string().min(1, t("field_required")),
    description: z.string().nullable().optional(),
    is_active: z.boolean(),
  });

export type ILocationFormValues = z.infer<ReturnType<typeof GetLocationSchema>>;
