import { z } from "zod";
import { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const GetCustomerSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t("field_required")),
    customer_type: z.enum(["Individual", "Organization"]),
    identifier: z.string().min(1, t("field_required")),
    phone: z.string().nullable().optional(),
    email: z
      .string()
      .email(t("invalid_email"))
      .nullable()
      .optional()
      .or(z.literal("")),
    address: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    is_active: z.boolean(),
  });

export type ICustomerFormValues = z.infer<ReturnType<typeof GetCustomerSchema>>;
