import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

import { RoleSchema } from "@/components/schemas/admin/role.schema";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { IPermission, IRole } from "@/types/rbac";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

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

  const { response: permissionsData } = useGet<IPermission[]>({
    url: endpoints.RBAC_PERMISSIONS,
  });
  const allPermissions = permissionsData || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof RoleSchema>>({
    resolver: zodResolver(RoleSchema),
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

  const isActive = useWatch({
    control,
    name: "is_active",
  });

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

  const onSubmit = async (data: z.infer<typeof RoleSchema>) => {
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
          <DialogTitle>{isEditing ? "Edit role" : "Create role"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify the role name and its permissions."
              : "Define a new role and assign permissions to it."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 overflow-y-auto flex-1">
          <form
            id="role-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">
                Role Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. sys_admin"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Role description"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 my-3">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) =>
                  setValue("is_active", checked as boolean)
                }
              />
              <Label htmlFor="is_active" className="cursor-pointer font-normal">
                Active Status
              </Label>
            </div>

            <div className="space-y-3">
              <Label>Permissions Distribution</Label>
              <div className="grid grid-cols-1 gap-2 border rounded-md p-3 bg-muted/20 pb-4 max-h-[300px] overflow-y-auto">
                {allPermissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No permissions available.
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
          </form>
        </div>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" form="role-form" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
