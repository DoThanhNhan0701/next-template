
import { z } from "zod";

// Regex patterns
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

export const LoginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required!")
    .max(254, "Username is too long!")
    .trim()
    .toLowerCase()
    .refine(
      (value) => USERNAME_REGEX.test(value),
      {
        message: "Username is invalid!",
      }
    ),

  password: z
    .string()
    .min(1, "Password is required!")
    .max(256, "Password is too long!"),
});
