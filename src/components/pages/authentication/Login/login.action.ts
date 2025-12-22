'use server';

import { tokenService } from "@/services/token.service";

export async function setTokensAction(accessToken: string, refreshToken: string) {
    await tokenService.setTokens(accessToken, refreshToken);
}
