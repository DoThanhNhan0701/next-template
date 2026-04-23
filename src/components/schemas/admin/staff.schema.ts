import { z } from "zod";
import { type useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const GetStaffSchema = (t: TFunction) =>
  z.object({
    staff_code: z.string().min(1, t("validation.field_required")).max(50),
    full_name: z.string().min(1, t("validation.field_required")).max(100),
    email: z
      .string()
      .email(t("validation.invalid_email"))
      .min(1, t("validation.field_required")),
    phone: z.string().nullable().optional(),
    unit_id: z.coerce.number().min(1, t("validation.field_required")),
    is_active: z.boolean(),
  });
