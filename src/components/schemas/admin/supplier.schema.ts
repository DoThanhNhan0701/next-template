import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = ReturnType<typeof useTranslations>;

export const GetSupplierSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t("field_required")),
    tax_code: z.string().nullable().optional(),
    contact_name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z
      .string()
      .email(t("invalid_email"))
      .nullable()
      .optional()
      .or(z.literal("")),
    address: z.string().nullable().optional(),
    description: z.string().optional(),
    is_active: z.boolean(),
  });

export type ISupplierFormValues = z.infer<ReturnType<typeof GetSupplierSchema>>;
