import { z } from "zod";

export const AssetGroupSchema = z.object({
  name: z.string().min(1, "Field is required!"),
  code: z.string().min(1, "Field is required!"),
  color: z.string().min(1, "Field is required!"),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
});
