import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = ReturnType<typeof useTranslations>;

export const GetCatalogTypeSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t("field_required")),
    code: z.string().min(1, t("field_required")),
    description: z.string().nullable().optional(),
    catalog_group_id: z.number().int().optional(),
    is_active: z.boolean(),
    management_type: z.string().optional(),
    has_warranty: z.boolean().optional(),
  });

export type ICatalogTypeFormValues = z.infer<
  ReturnType<typeof GetCatalogTypeSchema>
>;
