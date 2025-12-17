
import { z } from "zod";

// Regex patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

export const LoginSchema = z.object({
	email: z
		.string()
		.min(1, "Vui lòng nhập email hoặc tên đăng nhập")
		.max(254, "Email hoặc tên đăng nhập quá dài")
		.trim()
		.toLowerCase()
		.refine(
			(value) => EMAIL_REGEX.test(value) || USERNAME_REGEX.test(value),
			{
				message: "Email hoặc tên đăng nhập không hợp lệ",
			}
		),

	password: z
		.string()
		.min(1, "Vui lòng nhập mật khẩu")
		.max(256, "Mật khẩu quá dài"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;