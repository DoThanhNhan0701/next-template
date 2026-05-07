"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";

import { DatePickerField } from "@/components/common/DatePickerField";
import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import {
  IModuleForm,
  ModuleSchema,
} from "@/components/schemas/user/module.schema";
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
import { Textarea } from "@/components/ui/textarea";
import { dynamicEndpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { IAssetModule } from "@/types/physical-asset";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

interface Props {
  assetId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  moduleToEdit?: IAssetModule;
}

export default function ModuleFormModal({
  assetId,
  isOpen,
  onClose,
  onSuccess,
  moduleToEdit,
}: Props) {
  const t = useTranslations("page_physical_assets");
  const { mutate, pending } = useMutation();

  const form = useForm({
    resolver: zodResolver(ModuleSchema),
    defaultValues: {
      name: "",
      module_code: "",
      module_type: "component" as IModuleForm["module_type"],
      serial_number: "",
      model: "",
      quantity: 1,
      cost: 0,
      purchase_date: getTodayISO(),
      warranty_expiration: "",
      status: "active" as IModuleForm["status"],
      notes: "",
      asset_id: assetId,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (moduleToEdit) {
        form.reset({
          name: moduleToEdit.name,
          module_code: moduleToEdit.module_code,
          module_type: moduleToEdit.module_type as IModuleForm["module_type"],
          serial_number: moduleToEdit.serial_number ?? "",
          model: moduleToEdit.model ?? "",
          quantity: moduleToEdit.quantity,
          cost: moduleToEdit.cost,
          purchase_date: moduleToEdit.purchase_date || getTodayISO(),
          warranty_expiration: moduleToEdit.warranty_expiration || "",
          status: moduleToEdit.status as IModuleForm["status"],
          notes: moduleToEdit.notes ?? "",
          asset_id: assetId,
        });
      } else {
        form.reset({
          name: "",
          module_code: "",
          module_type: "component",
          serial_number: "",
          model: "",
          quantity: 1,
          cost: 0,
          purchase_date: getTodayISO(),
          warranty_expiration: "",
          status: "active",
          notes: "",
          asset_id: assetId,
        });
      }
    }
  }, [isOpen, form, assetId, moduleToEdit]);

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    const data = ModuleSchema.parse(values);
    await mutate(
      {
        url: moduleToEdit
          ? dynamicEndpoints.PHYSICAL_ASSET_MODULES_DETAIL(
              assetId,
              moduleToEdit.id,
            )
          : dynamicEndpoints.PHYSICAL_ASSET_MODULES(assetId),
        method: moduleToEdit ? "patch" : "post",
        body: {
          ...data,
          purchase_date: data.purchase_date
            ? new Date(data.purchase_date).toISOString()
            : null,
          warranty_expiration: data.warranty_expiration
            ? new Date(data.warranty_expiration).toISOString()
            : null,
        },
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess();
          handleClose();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] h-fit max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>
            {moduleToEdit
              ? t("detail.modules.form.title_edit")
              : t("detail.modules.form.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {moduleToEdit
              ? t("detail.modules.form.edit_description")
              : t("detail.modules.form.fields.code")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 pb-6 mt-3">
            <div className="flex flex-col gap-3">
              {/* Section: Module Information */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  {t("detail.modules.title")}
                </h3>
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1 col-span-2"
                      >
                        <FieldLabel>
                          {t("detail.modules.form.fields.name")}{" "}
                          <span className="text-rose-500">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          placeholder={t(
                            "detail.modules.form.placeholders.name",
                          )}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="module_code"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>
                          {t("detail.modules.form.fields.code")}
                        </FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t(
                            "detail.modules.form.placeholders.code",
                          )}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="module_type"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>
                          {t("detail.modules.form.fields.type")}
                        </FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="peripheral">
                              {t("detail.modules.form.types.peripheral")}
                            </SelectItem>
                            <SelectItem value="component">
                              {t("detail.modules.form.types.component")}
                            </SelectItem>
                            <SelectItem value="accessory">
                              {t("detail.modules.form.types.accessory")}
                            </SelectItem>
                            <SelectItem value="license">
                              {t("detail.modules.form.types.license")}
                            </SelectItem>
                            <SelectItem value="sim_card">
                              {t("detail.modules.form.types.sim_card")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>
                          {t("detail.modules.form.fields.status")}
                        </FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              {t("detail.modules.form.statuses.active")}
                            </SelectItem>
                            <SelectItem value="damaged">
                              {t("detail.modules.form.statuses.damaged")}
                            </SelectItem>
                            <SelectItem value="lost">
                              {t("detail.modules.form.statuses.lost")}
                            </SelectItem>
                            <SelectItem value="returned">
                              {t("detail.modules.form.statuses.returned")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="serial_number"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>
                          {t("detail.modules.form.fields.serial")}
                        </FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t(
                            "detail.modules.form.placeholders.serial",
                          )}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="model"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>
                          {t("detail.modules.form.fields.model")}
                        </FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t(
                            "detail.modules.form.placeholders.model",
                          )}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="quantity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>
                          {t("detail.modules.form.fields.quantity")}
                        </FieldLabel>
                        <Input
                          type="number"
                          {...field}
                          value={(field.value as number) ?? ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="cost"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>
                          {t("detail.modules.form.fields.cost")}
                        </FieldLabel>
                        <FormattedNumberInput
                          {...field}
                          value={(field.value as number) ?? 0}
                          placeholder="0.00"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="purchase_date"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>
                          {t("detail.modules.form.fields.purchase_date")}
                        </FieldLabel>
                        <DatePickerField form={form} name="purchase_date" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="warranty_expiration"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field className="gap-1 col-span-1">
                        <FieldLabel>
                          {t("detail.modules.form.fields.warranty")}
                        </FieldLabel>
                        <DatePickerField
                          form={form}
                          name="warranty_expiration"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="notes"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-2">
                        <FieldLabel>
                          {t("detail.modules.form.fields.notes")}
                        </FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t(
                            "detail.modules.form.placeholders.notes",
                          )}
                          className="min-h-[100px]"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>
            </div>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={pending}
            >
              {t("detail.modules.form.cancel_button")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? t("detail.modules.form.loading")
                : moduleToEdit
                  ? t("detail.modules.form.save_button")
                  : t("detail.modules.form.add_button")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
