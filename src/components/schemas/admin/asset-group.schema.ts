import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = ReturnType<typeof useTranslations>;

export const GetAssetGroupSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t("field_required")),
    code: z.string().min(1, t("field_required")),
    color: z.string().min(1, t("field_required")),
    description: z.string().nullable().optional(),
    is_active: z.boolean(),
  });

export type IAssetGroupFormValues = z.infer<
  ReturnType<typeof GetAssetGroupSchema>
>;
