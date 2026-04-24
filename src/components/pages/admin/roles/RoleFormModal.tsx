import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

import { GetRoleSchema } from "@/components/schemas/admin/role.schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { IPermission, IRole } from "@/types/rbac";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { Controller } from "react-hook-form";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: IRole | null;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function RoleFormModal({
  isOpen,
  onClose,
  roleToEdit,
  onSuccess,
}: RoleFormModalProps) {
  const isEditing = !!roleToEdit;
  const t = useTranslations("page_roles");

  const { response: permissionsData } = useGet<IPermission[]>({
    url: endpoints.RBAC_PERMISSIONS,
  });
  const allPermissions = permissionsData || [];

  const schema = GetRoleSchema(t);
  const {
    handleSubmit,
    reset,
    setValue,
    control,
  } = useForm<z.infer<ReturnType<typeof GetRoleSchema>>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
      permission_ids: [],
    },
  });

  const selectedPermissionIds =
    useWatch({
      control,
      name: "permission_ids",
    }) || [];

  useEffect(() => {
    if (isOpen) {
      if (isEditing && roleToEdit) {
        reset({
          name: roleToEdit.name,
          description: roleToEdit.description || "",
          is_active: roleToEdit.is_active,
          permission_ids: roleToEdit.permissions?.map((p) => p.id) || [],
        });
      } else {
        reset({
          name: "",
          description: "",
          is_active: true,
          permission_ids: [],
        });
      }
    }
  }, [isOpen, isEditing, roleToEdit, reset]);

  const { mutate, pending } = useMutation();

  const onSubmit = async (data: z.infer<ReturnType<typeof GetRoleSchema>>) => {
    const url = isEditing
      ? dynamicEndpoints.RBAC_ROLE_DETAIL(roleToEdit.id)
      : endpoints.RBAC_ROLES;
    const method = isEditing ? "patch" : "post";
    const payload = { ...data };

    await mutate(
      {
        url,
        method,
        body: payload,
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          onSuccess(response, isEditing ? "patch" : "post");
          onClose();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  const handleTogglePermission = (permissionId: number, checked: boolean) => {
    if (checked) {
      setValue("permission_ids", [...selectedPermissionIds, permissionId]);
    } else {
      setValue(
        "permission_ids",
        selectedPermissionIds.filter((id: number) => id !== permissionId),
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>{isEditing ? t("edit_role") : t("create_role")}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("modify_role_permissions")
              : t("define_new_role")}
          </DialogDescription>
        </DialogHeader>

        <form
          id="role-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 overflow-y-auto min-h-0">
            <FieldGroup className="gap-3">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>{t("role_name")}</FieldLabel>
                    <Input {...field} placeholder={t("name_placeholder")} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>{t("description_label")}</FieldLabel>
                    <Input
                      {...field}
                      placeholder={t("description_placeholder")}
                      value={field.value || ""}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Field className="gap-1 flex justify-start items-center">
                    <label
                      htmlFor="is_active"
                      className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                    >
                      <Checkbox
                        id="is_active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      {t("active_status")}
                    </label>
                  </Field>
                )}
              />

              <div className="space-y-3">
                <FieldLabel>{t("permissions_distribution")}</FieldLabel>
                <div className="grid grid-cols-1 gap-2 border rounded-md p-3 bg-muted/20 pb-4 max-h-[300px] overflow-y-auto">
                  {allPermissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("no_permissions_available")}
                    </p>
                  ) : (
                    allPermissions.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-start gap-2 space-y-0"
                      >
                        <Checkbox
                          id={`perm-${perm.id}`}
                          className="mt-0.5"
                          checked={selectedPermissionIds.includes(perm.id)}
                          onCheckedChange={(checked) =>
                            handleTogglePermission(perm.id, checked === true)
                          }
                        />
                        <div className="flex flex-col">
                          <Label
                            htmlFor={`perm-${perm.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {perm.name}
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {perm.description || perm.code}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </FieldGroup>
          </div>
        </form>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" form="role-form" disabled={pending}>
            {pending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
