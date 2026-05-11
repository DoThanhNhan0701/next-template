
import { z } from "zod";

// Regex patterns
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

export const LoginSchema = z.object({
  username: z
    .string()
    .min(1, "Field is required!")
    .max(254, "Username is too long!")
    .trim()
    .refine(
      (value) => USERNAME_REGEX.test(value),
      {
        message: "Username is invalid!",
      }
    ),

  password: z
    .string()
    .min(1, "Field is required!")
    .max(256, "Password is too long!"),
});
