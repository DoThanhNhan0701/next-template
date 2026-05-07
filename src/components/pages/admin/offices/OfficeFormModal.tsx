import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { GetOfficeSchema, IOfficeFormValues } from "@/components/schemas/admin/office.schema";
import { useTranslations } from "next-intl";
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
import { IOffice } from "@/types/office";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface OfficeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  officeToEdit?: IOffice | null;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function OfficeFormModal({
  isOpen,
  onClose,
  officeToEdit,
  onSuccess,
}: OfficeFormModalProps) {
  const t = useTranslations("page_offices.form");
  const vt = useTranslations("page_offices.validation");
  const isEditing = !!officeToEdit;

  const schema = GetOfficeSchema(vt);
  const {
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
  } = useForm<IOfficeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && officeToEdit) {
        reset({
          name: officeToEdit.name,
          code: officeToEdit.code,
          address: officeToEdit.address,
          description: officeToEdit.description || "",
          is_active: officeToEdit.is_active,
        });
      } else {
        reset({
          name: "",
          code: "",
          address: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, isEditing, officeToEdit, reset]);

  const { mutate, pending } = useMutation();

  const onSubmit = async (data: IOfficeFormValues) => {
    if (isEditing && !isDirty) {
      toast.info(t("no_changes"));
      onClose();
      return;
    }

    const payload = { ...data };

    const url = isEditing
      ? dynamicEndpoints.OFFICE_DETAIL(officeToEdit.id)
      : endpoints.OFFICES;
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
            {isEditing ? t("edit_title") : t("create_title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("edit_description") : t("create_description")}
          </DialogDescription>
        </DialogHeader>

        <form
          id="office-form"
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
                    <FieldLabel>{t("code_label")}</FieldLabel>
                    <Input {...field} placeholder={t("code_placeholder")} />
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
                    <FieldLabel>{t("name_label")}</FieldLabel>
                    <Input {...field} placeholder={t("name_placeholder")} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="address"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>{t("address_label")}</FieldLabel>
                    <Input {...field} placeholder={t("address_placeholder")} />
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
                      value={field.value || ""}
                      placeholder={t("description_placeholder")}
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
                      {t("active_status")}
                    </label>
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" form="office-form" disabled={pending}>
              {pending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
