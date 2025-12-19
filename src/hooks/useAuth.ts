import { authApi } from "@/services/auth/auth.api";
import { tokenService } from "@/services/token.service";
import { LoginResponse } from "@/types/auth/responses";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useLogin = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data: LoginResponse) => {
            tokenService.setTokens(data.access_token, data.refresh_token);
            toast.success("Login successful");
            router.push("/");
        },
        onError: (error) => {
            console.log(error);
        },
    });
};

export const useLogout = () => {
    const router = useRouter();

    return () => {
        tokenService.clearTokens();
        router.push("/auth/login");
        toast.success("Logged out successfully");
    };
};
