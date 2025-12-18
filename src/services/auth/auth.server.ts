import { API_ENDPOINTS } from "@/lib/constants";
import { httpServer } from "@/lib/http.server";
import { User } from "@/types/user";

export const getMeServer = async (): Promise<User | null> => {
    return httpServer.get<User>(API_ENDPOINTS.AUTH.ME, {
        cache: "no-store",
    });
};
