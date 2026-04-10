"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OrgUnitSchema,
  IOrgUnitFormValues,
} from "@/components/schemas/admin/org-unit.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@/hooks/useMutation";
import { useGet } from "@/hooks/useGet";
import { endpoints } from "@/config/endpoints";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { cleanFormData } from "@/utils/form";
import { IOrgUnit } from "@/types/org";
import { IUser } from "@/types/auth";

interface Props {
  unitToEdit?: IOrgUnit | null;
  parentUnit?: { id: number; name: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrgUnitFormModal({
  unitToEdit,
  parentUnit,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!unitToEdit;
  const { mutate, pending } = useMutation<IOrgUnit>();

  // Fetch users for leader selection
  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );
  const users = userRes || [];

  const form = useForm<IOrgUnitFormValues>({
    resolver: zodResolver(OrgUnitSchema),
    defaultValues: {
      name: "",
      code: "",
      unit_type: "department",
      parent_id: null,
      leader_id: null,
      address: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (unitToEdit) {
        form.reset({
          name: unitToEdit.name,
          code: unitToEdit.code,
          unit_type: unitToEdit.unit_type as
            | "company"
            | "department"
            | "branch",
          parent_id: unitToEdit.parent_id,
          leader_id: unitToEdit.leader_id,
          address: unitToEdit.address || "",
          description: unitToEdit.description || "",
          is_active: unitToEdit.is_active,
        });
      } else {
        form.reset({
          name: "",
          code: "",
          unit_type: "department",
          parent_id: parentUnit?.id || null,
          leader_id: null,
          address: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, unitToEdit, parentUnit, form]);

  const onSubmit = async (data: IOrgUnitFormValues) => {
    const cleanedData = cleanFormData(data);
    const url = isEditing
      ? `${endpoints.ORG_UNITS}${unitToEdit.id}/`
      : endpoints.ORG_UNITS;
    const method = isEditing ? "patch" : "post";

    await mutate(
      {
        url,
        method,
        body: cleanedData,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Organizational Unit"
              : "Create New Organizational Unit"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Modifying ${unitToEdit.name}`
              : parentUnit
                ? `Adding a sub-unit to ${parentUnit.name}`
                : "Adding a new root organizational unit."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="col-span-2">
                  <FieldLabel>Unit Name</FieldLabel>
                  <Input {...field} placeholder="e.g. Finance Department" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Unit Code</FieldLabel>
                  <Input {...field} placeholder="e.g. FIN-01" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="unit_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Unit Type</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="branch">Branch</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="leader_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="col-span-2">
                  <FieldLabel>Leader</FieldLabel>
                  <Select
                    onValueChange={(val) =>
                      field.onChange(val === "none" ? null : Number(val))
                    }
                    value={field.value?.toString() || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leader" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">(None)</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.full_name} ({u.username})
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
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="col-span-2">
                  <FieldLabel>Address</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Physical address"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Brief description"
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
                <Field
                  orientation="horizontal"
                  className="flex items-center gap-2 rounded-md border p-4 space-y-0"
                >
                  <Checkbox
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <FieldLabel
                      htmlFor="is_active"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Active Status
                    </FieldLabel>
                    <p className="text-xs text-muted-foreground">
                      Whether this unit is currently active.
                    </p>
                  </div>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
