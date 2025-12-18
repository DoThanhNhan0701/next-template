import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/services/auth/auth.api";
import { tokenService } from "@/services/token.service";
import { LoginResponse } from "@/types/auth/responses";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/http.client";

export const useLogin = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data: LoginResponse) => {
            tokenService.setTokens(data.access_token, data.refresh_token);
            queryClient.invalidateQueries({ queryKey: ["me"] });
            toast.success("Login successful");
            router.push("/");
        },
        onError: (error) => {
            toast.error((error as ApiError).detail);
        },
    });
};

export const useMe = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: authApi.getMe,
        enabled: !!tokenService.getAccessToken(),
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return () => {
        tokenService.clearTokens();
        queryClient.removeQueries({ queryKey: ["me"] });
        router.push("/auth/login");
        toast.success("Logged out successfully");
    };
};
