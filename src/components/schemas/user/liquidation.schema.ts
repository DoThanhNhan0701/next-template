import { z } from "zod";
import { type useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const GetLiquidationSchema = (t: TFunction) =>
  z
    .object({
      record_number: z.string().optional().default(""),
      reason: z.string().min(1, t("validation.field_required")),
      notes: z.string().nullable().optional(),
      liquidation_date: z.string().min(1, t("validation.field_required")),
      liquidation_type: z.string().min(1, t("validation.field_required")),
      committee: z.array(z.number()).min(1, t("validation.field_required")),
      total_value: z.coerce.number().optional().default(0),
      buyer_name: z.string().nullable().optional(),
      external_link: z.string().nullable().optional(),
      attachments: z.array(z.string()).optional().default([]),
      items: z
        .array(
          z.object({
            asset_id: z.coerce.number().min(1, t("validation.field_required")),
            quantity: z.coerce.number().min(1, t("validation.field_required")),
            unit_value: z.coerce.number().optional().default(0),
            remaining_value: z.coerce.number().optional().default(0),
            notes: z.string().nullable().optional(),
            from_location_id: z.coerce.number().optional().default(0),
            from_staff_id: z.coerce.number().optional().default(0),
            from_unit_id: z.coerce.number().optional().default(0),
          }),
        )
        .min(1, t("validation.field_required")),
      approvals: z
        .record(z.string(), z.number().nullable().optional())
        .default({}),
      required_steps: z.number().default(0),
      workflow_assignments: z
        .array(
          z.object({
            step_id: z.coerce.number(),
            user_id: z.coerce.number().min(1, t("validation.field_required")),
          }),
        )
        .optional()
        .default([]),
    })
    .superRefine((data, ctx) => {
      for (let i = 0; i < data.required_steps; i++) {
        const stepKey = `step_${i}`;
        const userId = data.approvals[stepKey];
        if (!userId || userId === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.field_required"),
            path: ["approvals", stepKey],
          });
        }
      }
    });

export type LiquidationFormValues = z.infer<
  ReturnType<typeof GetLiquidationSchema>
>;
