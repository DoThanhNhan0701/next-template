import { z } from "zod";

export const StatusSchema = z.object({
  category: z.string().min(1, "Field is required!"),
  code: z.string().min(1, "Field is required!"),
  name: z.string().min(1, "Field is required!"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
});
