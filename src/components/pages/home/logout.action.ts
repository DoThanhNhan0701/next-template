"use server";

import { tokenService } from "@/services/token.service";

export async function logoutAction() {
    await tokenService.clearTokens();
}
