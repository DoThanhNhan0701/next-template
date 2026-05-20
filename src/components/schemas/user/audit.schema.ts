import z from "zod";

export const AuditCreateSchema = z
  .object({
    title: z.string().min(1, 'Field is required!'),
    audit_type: z.enum(["unit", "location"]),
    unit_ids: z.array(z.number()),
    location_ids: z.array(z.number()),
    assignee_id: z.number().nullable(),
    due_date: z.string().min(1, "Field is required!"),
    required_steps: z.number().default(0),
    approvals: z
      .record(z.string(), z.number().nullable().optional())
      .optional(),
  })
  .superRefine((data, ctx) => {
    for (let i = 0; i < data.required_steps; i++) {
      const approverId = data.approvals?.[`step_${i}`];
      if (!approverId || approverId === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Field is required!",
          path: ["approvals", `step_${i}`],
        });
      }
    }
    if (data.audit_type === "unit" && data.unit_ids.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Field is required!",
        path: ["unit_ids"],
      });
    }
    if (data.audit_type === "location" && data.location_ids.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Field is required!",
        path: ["location_ids"],
      });
    }
  });