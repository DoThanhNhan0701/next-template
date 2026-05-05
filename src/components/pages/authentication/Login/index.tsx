"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "@public/icons/logo.png";
import LoginBg from "@public/images/login-bg.png";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import { LoginSchema } from "@/components/schemas/auth/login.schema";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { AppDispatch } from "@/redux";
import { actionFetchUser, actionLogin } from "@/redux/slices/auth";
import { LoginRequest } from "@/types/auth/requests";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface LoginApiResponse {
  access_token: string;
  token_type: string;
  data: {
    access: string;
    refresh: string;
    token_type: string;
    expires_in: number;
    is_lock: boolean;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutate, pending } = useMutation<LoginApiResponse>();

  const onSubmit = async (data: LoginRequest) => {
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);

    await mutate(
      {
        url: endpoints.LOGIN,
        method: "post",
        body: formData.toString(),
        config: {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      },
      {
        onSuccess: (response) => {
          dispatch(
            actionLogin({
              access_token: response.data.access,
              refresh_token: response.data.refresh,
              rememberMe: true,
            }),
          );
          dispatch(actionFetchUser());
          getApiSuccessMessage(response);

          router.replace("/dashboard");
          router.refresh();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-(--surface-container)">
      {/* Left Panel: Aesthetic Asset Management Visualization */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-primary lg:flex">
        <div className="absolute inset-0 z-0">
          <Image
            src={LoginBg}
            alt="Asset Management Background"
            fill
            className="object-cover opacity-100 transition-opacity duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-tr from-primary/40 via-transparent to-primary/20" />
        </div>
        
        <div className="relative z-10 p-12 text-center text-white">
          <div className="mb-8 flex justify-center">
            <div className="rounded-2xl bg-white/10 p-4 shadow-xl backdrop-blur-md">
              <Image
                src={Logo}
                alt="Logo"
                width={120}
                height={80}
                className="brightness-0 invert h-auto w-auto"
              />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Streamline Your Assets
          </h1>
          <p className="max-w-md text-lg text-white/80">
            A comprehensive solution for tracking, maintaining, and optimizing your organization&apos;s physical assets in real-time.
          </p>
        </div>
        
        <div className="absolute bottom-8 left-8 z-10 flex gap-4 text-xs text-white/60">
          <span>© 2026 Asset Management System</span>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-10 text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:hidden">
              <Image
                src={Logo}
                alt="Logo"
                width={80}
                height={50}
                className="h-auto w-auto"
              />
            </div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Please enter your details to sign in to your account
            </p>
          </div>

          <form
            autoComplete="off"
            className="flex flex-col gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup className="gap-5">
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor="username" className="text-sm font-medium">Username</FieldLabel>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                        <User className="h-4 w-4" />
                      </div>
                      <Input
                        {...field}
                        autoFocus
                        id="username"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter your username"
                        autoComplete="username"
                        className="pl-10 h-11 bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password" className="text-sm font-medium">Password</FieldLabel>
                        <button 
                          type="button" 
                          className="text-xs font-semibold text-primary hover:underline transition-all"
                          onClick={() => {}} // Placeholder for forgot password
                        >
                          Forgot password?
                        </button>
                      </div>

                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                          <Lock className="h-4 w-4" />
                        </div>
                        <Input
                          {...field}
                          id="password"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className="px-10 h-11 bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                        />

                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>

            <Button 
              variant="default" 
              type="submit" 
              disabled={pending}
              className="h-11 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
            >
              {pending ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button disabled className="font-semibold text-primary hover:underline transition-all">
                Contact your administrator
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
