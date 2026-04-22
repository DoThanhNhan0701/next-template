import { z } from "zod";

export const UserSchema = z.object({
  username: z.string().min(1, "Field is required!").max(50),
  email: z.string().email("Invalid email").min(1, "Field is required!"),
  full_name: z.string().min(1, "Field is required!").max(100),
  role_id: z.coerce.number().min(1, "Field is required!"),
  unit_id: z.coerce.number().optional().nullable(),
  team_leader_id: z.coerce.number().optional().nullable(),
  is_active: z.boolean(),
});

export const UserChangePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Field is required!"),
    new_password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });
