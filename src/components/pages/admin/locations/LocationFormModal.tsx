import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { LocationSchema } from "@/components/schemas/admin/location.schema";
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
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { ILocation } from "@/types/location";
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
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
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
      <DialogContent className="sm:max-w-[500px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? "Edit Location" : "Create New Location"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the location details."
              : "Set up a new physical location for assets."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="location-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <FieldGroup className="gap-3">
              <Controller
                name="code"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Location code</FieldLabel>
                    <Input {...field} placeholder="Ex: ST_TOTAL" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>Location name</FieldLabel>
                    <Input {...field} placeholder="Ex: Kho tổng" />
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
                    <FieldLabel>Description (optional)</FieldLabel>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Detailed description"
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
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 rounded border-(--surface-border-color)"
                      />
                      Active Status
                    </label>
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="location-form" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
