"use client";

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
import { usePost } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface LoginMutationData {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = usePost<LoginResponse, LoginMutationData>(
    endpoints.LOGIN
  );

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginMutationData) => {
    loginMutation.mutate(data, {
      onSuccess: (data) => {
        console.log(data.access_token);
        toast.success("Login successful!");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <div className="max-w-[500px] mx-auto h-full flex items-center justify-center">
      <form
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

        <Button
          disabled={loginMutation.isPending}
          variant="default"
          type="submit"
        >
          {loginMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Login
        </Button>
      </form>
    </div>
  );
}
