import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = ReturnType<typeof useTranslations>;

export const GetUsageModeSchema = (t: TFunction) =>
  z.object({
    code: z.string().min(1, t("field_required")),
    name: z.string().min(1, t("field_required")),
    color: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("invalid_color")),
    description: z.string().optional(),
    is_active: z.boolean(),
  });

export type IUsageModeFormValues = z.infer<
  ReturnType<typeof GetUsageModeSchema>
>;
