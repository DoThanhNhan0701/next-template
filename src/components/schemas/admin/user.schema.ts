import { z } from "zod";
import { type useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const GetUserSchema = (t: TFunction) =>
  z.object({
    username: z.string().min(1, t("validation.field_required")).max(50),
    email: z
      .string()
      .email(t("validation.invalid_email"))
      .min(1, t("validation.field_required")),
    full_name: z.string().min(1, t("validation.field_required")).max(100),
    role_id: z.coerce.number().min(1, t("validation.field_required")),
    unit_id: z.coerce.number().optional().nullable(),
    team_leader_id: z.coerce.number().optional().nullable(),
    is_active: z.boolean(),
  });

export const GetUserChangePasswordSchema = (t: TFunction) =>
  z
    .object({
      old_password: z.string().min(1, t("validation.field_required")),
      new_password: z
        .string()
        .min(6, t("validation.password_min_length", { min: 6 })),
      confirm_password: z.string().min(1, t("validation.confirm_password_required")),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: t("validation.passwords_dont_match"),
      path: ["confirm_password"],
    });
