import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, LoginResponse } from "@/services/auth.service";
import { tokenService } from "@/services/token.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useLogin = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: authService.login,
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
        queryFn: authService.getMe,
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
