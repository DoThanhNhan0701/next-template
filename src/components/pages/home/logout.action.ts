"use server";

import { tokenService } from "@/services/token.service";
import { redirect } from "next/navigation";

export async function logoutAction() {
    await tokenService.clearTokens();
    redirect("/auth/login");
}
