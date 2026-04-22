import { z } from "zod";

export const UsageModeSchema = z.object({
  code: z.string().min(1, "Field is required!"),
  name: z.string().min(1, "Field is required!"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  description: z.string().optional(),
  is_active: z.boolean(),
});
