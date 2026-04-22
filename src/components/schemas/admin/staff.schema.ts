import { z } from "zod";

export const StaffSchema = z.object({
  staff_code: z.string().min(1, "Field is required!").max(50),
  full_name: z.string().min(1, "Field is required!").max(100),
  email: z.string().email("Invalid email").min(1, "Field is required!"),
  phone: z.string().nullable().optional(),
  unit_id: z.coerce.number().min(1, "Field is required!"),
  is_active: z.boolean(),
});
