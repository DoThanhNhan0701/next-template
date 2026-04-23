import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = ReturnType<typeof useTranslations>;

export const GetStatusSchema = (t: TFunction) =>
  z.object({
    category: z.string().min(1, t("field_required")),
    code: z.string().min(1, t("field_required")),
    name: z.string().min(1, t("field_required")),
    color: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("invalid_color")),
  });

export type IStatusFormValues = z.infer<ReturnType<typeof GetStatusSchema>>;
