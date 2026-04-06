import z from "zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { endpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { useGet } from "@/hooks/useGet";
import { IRole, IPermission } from "@/types/rbac";
import { RoleSchema } from "@/components/schemas/admin/role.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/api-error";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: IRole | null;
  onSuccess: () => void;
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

  const selectedPermissionIds = useWatch({
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
    const payload = { ...data };

    await mutate(
      {
        url: isEditing
          ? `${endpoints.RBAC_ROLES}/${roleToEdit.id}`
          : endpoints.RBAC_ROLES,
        method: isEditing ? "patch" : "post",
        body: payload,
      },
      {
        onSuccess: () => {
          toast.success(
            isEditing
              ? "Role updated successfully"
              : "Role created successfully",
          );
          onSuccess();
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>
            {isEditing ? "Edit Role" : "Create New Role"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1">
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
                placeholder="Ex: sys_admin"
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

            <div className="flex items-center gap-2 py-2">
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

            <div className="space-y-3 pt-2">
              <Label>Permissions Distribution</Label>
              <div className="grid grid-cols-1 gap-2 border rounded-md p-4 bg-muted/20 pb-4 max-h-[300px] overflow-y-auto">
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

        <DialogFooter className="p-6 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" form="role-form" disabled={pending}>
            {pending
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Role"
                : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
