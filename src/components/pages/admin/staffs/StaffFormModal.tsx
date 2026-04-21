"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { StaffSchema } from "@/components/schemas/admin/staff.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { IStaff, IUnit } from "@/types/staff";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  staffToEdit?: IStaff | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function StaffFormModal({
  staffToEdit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!staffToEdit;
  const { mutate, pending } = useMutation();
  const { response: units = [] } = useGet<IUnit[]>({
    url: endpoints.ORG_UNITS,
  });

  const form = useForm({
    resolver: zodResolver(StaffSchema),
    defaultValues: {
      staff_code: "",
      full_name: "",
      email: "",
      phone: "",
      unit_id: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (staffToEdit) {
        form.reset({
          staff_code: staffToEdit.staff_code,
          full_name: staffToEdit.full_name,
          email: staffToEdit.email,
          phone: staffToEdit.phone || "",
          unit_id: staffToEdit.unit_id,
          is_active: staffToEdit.is_active,
        });
      } else {
        form.reset({
          staff_code: "",
          full_name: "",
          email: "",
          phone: "",
          unit_id: 0,
          is_active: true,
        });
      }
    }
  }, [isOpen, staffToEdit, form]);

  const onSubmit = async (data: z.infer<typeof StaffSchema>) => {
    const url = isEditing
      ? dynamicEndpoints.STAFF_DETAIL(staffToEdit.id)
      : endpoints.STAFFS;
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
          onSuccess(res, method);
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Staff" : "Add Staff"}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Update staff member information."
              : "Register a new staff member in the system."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="staff_code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Staff Code</FieldLabel>
                    <Input
                      {...field}
                      disabled={isEditing}
                      placeholder="ST001"
                    />
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
                    <Input {...field} placeholder="John Doe" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    {...field}
                    type="email"
                    placeholder="john.doe@example.com"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>Phone (Optional)</FieldLabel>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="0123456789"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="unit_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel>Organization</FieldLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value?.toString() || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {units
                        ?.filter((unit) => unit.is_active)
                        .map((unit) => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.name} ({unit.code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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
                <Field className="gap-1 flex items-center mt-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-(--surface-border-color) text-primary focus:ring-primary"
                    />
                    Active
                  </label>
                </Field>
              )}
            />
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
