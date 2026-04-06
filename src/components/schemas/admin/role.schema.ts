import { z } from "zod";

export const RoleSchema = z.object({
  name: z.string().min(1, { message: "Role name is required" }),
  description: z.string().optional(),
  is_active: z.boolean(),
  permission_ids: z.array(z.number()),
});

export type RoleFormData = z.infer<typeof RoleSchema>;
