import z from "zod";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { endpoints, dynamicEndpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { ILocation } from "@/types/location";
import { LocationSchema } from "@/components/schemas/admin/location.schema";
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
import { getApiSuccessMessage } from "@/utils/api-success";

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationToEdit?: ILocation | null;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function LocationFormModal({
  isOpen,
  onClose,
  locationToEdit,
  onSuccess,
}: LocationFormModalProps) {
  const isEditing = !!locationToEdit;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<z.infer<typeof LocationSchema>>({
    resolver: zodResolver(LocationSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && locationToEdit) {
        reset({
          name: locationToEdit.name,
          code: locationToEdit.code,
          description: locationToEdit.description || "",
          is_active: locationToEdit.is_active,
        });
      } else {
        reset({
          name: "",
          code: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, isEditing, locationToEdit, reset]);

  const { mutate, pending } = useMutation();

  const onSubmit = async (data: z.infer<typeof LocationSchema>) => {
    if (isEditing && !isDirty) {
      toast.info("No changes were made.");
      onClose();
      return;
    }

    const payload = { ...data };
    
    const url = isEditing
      ? dynamicEndpoints.LOCATION_DETAIL(locationToEdit.id)
      : endpoints.LOCATIONS;
    const method = isEditing ? "patch" : "post";

    await mutate(
      {
        url,
        method,
        body: payload,
      },
      {
        onSuccess: (response) => {
          getApiSuccessMessage(response);
          onSuccess(response, method);
          onClose();
        },
        onError: (error) => {
          getApiErrorMessage(error);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Location" : "Create New Location"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="location-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="code">
              Location Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              placeholder="Ex: ST_TOTAL"
              {...register("code")}
              className={errors.code ? "border-red-500" : ""}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Location Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Kho tổng"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Detailed description"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 pb-4">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="is_active" className="cursor-pointer font-normal">
              Active Status
            </Label>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" form="location-form" disabled={pending}>
            {pending
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
