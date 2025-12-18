import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, LoginResponse } from "@/services/auth/auth.api";
import { tokenService } from "@/services/token.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
        onError: (error: unknown) => {
            console.log(error);
            toast.error("Login failed");
        },
    });
};

export const useMe = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: authApi.getMe,
        retry: false,
        staleTime: 5 * 60 * 1000,
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
