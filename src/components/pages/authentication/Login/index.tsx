"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { LoginSchema } from "@/components/schemas/auth/login.schema";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { LoginRequest } from "@/types/auth/requests";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { endpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux";
import { actionLogin } from "@/redux/slices/auth";

import Logo from "@public/icons/logo.png";
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
          getApiSuccessMessage(response);
          router.push("/");
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  return (
    <div className="max-w-125 mx-auto h-full flex items-center justify-center flex-col">
      <Image
        src={Logo}
        alt="Logo"
        width={150}
        height={100}
        priority
        loading="eager"
        style={{ width: "auto", height: "auto" }}
      />

      <form
        autoComplete="off"
        className="flex flex-col gap-6 p-6 border border-(--surface-border-color) rounded-lg w-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1">
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  {...field}
                  autoFocus
                  id="username"
                  aria-invalid={fieldState.invalid}
                  placeholder="Username"
                  autoComplete="off"
                />
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
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="password">Password</FieldLabel>

                  <div className="relative">
                    <Input
                      {...field}
                      id="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="off"
                      className="pr-10"
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

        <Button variant="default" type="submit" disabled={pending}>
          {pending ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
