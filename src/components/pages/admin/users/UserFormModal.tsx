"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserSchema } from "@/components/schemas/admin/user.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { useMutation } from "@/hooks/useMutation";
import { endpoints, dynamicEndpoints } from "@/config/endpoints";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { IUser } from "@/types/auth";

interface Props {
  userToEdit?: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormModal({
  userToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!userToEdit;
  const { mutate, pending } = useMutation();

  const form = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      username: "",
      email: "",
      full_name: "",
      role_id: 1,
      unit_id: null,
      team_leader_id: null,
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        form.reset({
          username: userToEdit.username,
          email: userToEdit.email,
          full_name: userToEdit.full_name,
          role_id: userToEdit.role_id || 1,
          unit_id: userToEdit.unit_id,
          team_leader_id: userToEdit.team_leader_id,
          is_active: userToEdit.is_active,
        });
      } else {
        form.reset({
          username: "",
          email: "",
          full_name: "",
          role_id: 1,
          unit_id: null,
          team_leader_id: null,
          is_active: true,
        });
      }
    }
  }, [isOpen, userToEdit, form]);

  const onSubmit = async (data: z.infer<typeof UserSchema>) => {
    const url = isEditing
      ? dynamicEndpoints.USER_DETAIL(userToEdit.id)
      : endpoints.USERS;
    const method = isEditing ? "patch" : "post";
    const payload = { ...data };

    await mutate(
      {
        url,
        method,
        body: payload,
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess();
          onClose();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>Username</FieldLabel>
                  <Input {...field} disabled={isEditing} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="full_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>Full Name</FieldLabel>
                  <Input {...field} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>Email</FieldLabel>
                  <Input {...field} type="email" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Temporarily basic implementations of role ID and others; ideally a Select dropdown */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="role_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Role ID</FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      value={(field.value as number) || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1 flex justify-center items-start mt-8">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 rounded border-(--surface-border-color)"
                      />
                      Active
                    </label>
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
