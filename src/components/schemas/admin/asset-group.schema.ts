import { z } from "zod";

export const AssetGroupSchema = z.object({
  name: z.string().min(1, "Asset group name is required"),
  code: z.string().min(1, "Asset group code is required"),
  color: z.string().min(1, "Color is required"),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
});
