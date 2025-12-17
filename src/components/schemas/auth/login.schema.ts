
import { z } from "zod";

// Regex patterns
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

export const LoginSchema = z.object({
	username: z
		.string()
		.min(1, "Vui lòng nhập tên đăng nhập")
		.max(254, "Tên đăng nhập quá dài")
		.trim()
		.toLowerCase()
		.refine(
			(value) => USERNAME_REGEX.test(value),
			{
				message: "Tên đăng nhập không hợp lệ",
			}
		),

	password: z
		.string()
		.min(1, "Vui lòng nhập mật khẩu")
		.max(256, "Mật khẩu quá dài"),
});
