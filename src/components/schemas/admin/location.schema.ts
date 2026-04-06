import { z } from "zod";

export const LocationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  code: z.string().min(1, "Location code is required"),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
});
