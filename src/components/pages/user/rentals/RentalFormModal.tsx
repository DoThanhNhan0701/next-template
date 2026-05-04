"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import {
  type Control,
  Controller,
  type UseFormSetValue,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

import { ApprovalProcessSection } from "@/components/common/ApprovalProcessSection";
import { DatePickerField } from "@/components/common/DatePickerField";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { RentalCreateSchema } from "@/components/schemas/user/rental.schema";
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
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { AppDispatch, RootState } from "@/redux";
import { closeRental } from "@/redux/slices/rental";
import { updateCount } from "@/redux/slices/task";
import { IUser } from "@/types/auth";
import { ICustomer } from "@/types/customer";
import { ILocation } from "@/types/location";
import { IOrgUnit } from "@/types/org";
import { IPhysicalAsset } from "@/types/physical-asset";
import { ITemplate } from "@/types/template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

type RentalFormValues = z.input<typeof RentalCreateSchema>;

/* ───── Per-item row component ───── */
interface RentalItemRowProps {
  index: number;
  disabled: boolean;
  control: Control<RentalFormValues>;
  setValue: UseFormSetValue<RentalFormValues>;
  locations: ILocation[];
  onRemove: () => void;
}

function RentalItemRow({
  disabled,
  index,
  control,
  setValue,
  locations,
  onRemove,
}: RentalItemRowProps) {
  const t = useTranslations("page_rentals");
  const locationId = useWatch({
    control,
    name: `items.${index}.from_location_id`,
  });

  const { response: assetRes, pending: assetsPending } = useGet<{
    items: IPhysicalAsset[];
  }>(
    {
      url: endpoints.PHYSICAL_ASSETS,
      config: {
        params: {
          location_id: locationId,
          status_code: "READY",
        },
      },
    },
    { disabled: !locationId, deps: [locationId] },
  );

  const assets = assetRes?.items || [];

  return (
    <div className="bg-muted/30 border rounded-lg p-3 flex items-end gap-2">
      <div className="grid grid-cols-[1fr_1fr_110px_110px] gap-2 flex-1">
        {/* Location */}
        <Field className="gap-1">
          <FieldLabel>{t("form.location")}</FieldLabel>
          <Select
            onValueChange={(val) => {
              setValue(
                `items.${index}.from_location_id`,
                val === "none" ? 0 : Number(val),
              );
              setValue(`items.${index}.asset_id`, 0);
            }}
            value={locationId ? locationId.toString() : ""}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("form.placeholder_location")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                {t("form.none")}
              </SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id.toString()}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Asset */}
        <Controller
          name={`items.${index}.asset_id`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.asset")}</FieldLabel>
              <Select
                onValueChange={(val) =>
                  field.onChange(val === "none" ? 0 : Number(val))
                }
                value={field.value ? field.value.toString() : ""}
                disabled={!locationId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !locationId
                        ? t("form.placeholder_select_location_first")
                        : assetsPending
                          ? t("form.placeholder_loading")
                          : t("form.placeholder_select_asset")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="none"
                    className="text-muted-foreground italic"
                  >
                    {t("form.none")}
                  </SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.name} ({a.asset_code}) Quantity:{" "}
                      {a?.current_stock ?? 0}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Quantity */}
        <Controller
          name={`items.${index}.quantity`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.quantity")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder={t("form.placeholder_quantity")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Revenue */}
        <Controller
          name={`items.${index}.rental_revenue`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>{t("form.item_revenue")}</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder={t("form.placeholder_item_revenue")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {/* Delete */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        className="h-9 w-9 shrink-0 text-red-500 hover:bg-red-50"
        onClick={onRemove}
      >
        <Trash size={14} />
      </Button>
    </div>
  );
}

/* ───── Main modal ───── */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RentalFormModal({ isOpen, onClose, onSuccess }: Props) {
  const t = useTranslations("page_rentals");
  const { mutate, pending } = useMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { prefill } = useSelector((state: RootState) => state.rental);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { counts } = useSelector((state: RootState) => state.task);

  const handleClose = () => {
    dispatch(closeRental());
    onClose();
  };

  const { response: orgRes } = useGet<IOrgUnit[]>(
    { url: endpoints.ORG_UNITS },
    { disabled: !isOpen },
  );
  const { response: cusRes } = useGet<{ data: ICustomer[] }>(
    { url: endpoints.CUSTOMERS },
    { disabled: !isOpen },
  );
  const { response: locationRes } = useGet<ILocation[]>(
    { url: endpoints.LOCATIONS },
    { disabled: !isOpen },
  );

  const { response: activeRentalTemplate } = useGet<ITemplate>({
    url: `${endpoints.TEMPLATE_ACTIVE}rental`,
  });
  const { response: userRes } = useGet<IUser[]>({ url: endpoints.USERS });

  const orgUnits = orgRes || [];
  const customers = cusRes?.data || [];
  const locations = locationRes || [];
  const users = userRes || [];

  const form = useForm<RentalFormValues>({
    resolver: zodResolver(RentalCreateSchema),
    defaultValues: {
      unit_id: 0,
      customer_id: 0,
      lease_date: getTodayISO(),
      duration_days: 1,
      reason: "",
      total_revenue: 0,
      contract_number: "",
      notes: "",
      external_link: "",
      attachments: [],
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        unit_id: prefill?.unit_id ?? 0,
        customer_id: 0,
        lease_date: getTodayISO(),
        duration_days: 30,
        reason: prefill?.reason ?? "",
        total_revenue: 0,
        contract_number: "",
        notes: "",
        external_link: "",
        attachments: [],
        approvals: {},
        required_steps: activeRentalTemplate?.steps?.length || 0,
        items: [
          {
            asset_id: prefill?.asset_id ?? 0,
            quantity: 1,
            from_location_id: prefill?.location_id ?? 0,
            rental_revenue: 0,
            lessee_location: "",
          },
        ],
      });
    }
  }, [isOpen, prefill, form, activeRentalTemplate]);

  useEffect(() => {
    if (activeRentalTemplate?.steps?.length) {
      form.setValue("required_steps", activeRentalTemplate.steps.length);
    }
  }, [activeRentalTemplate, form]);

  const onSubmit = async (data: RentalFormValues) => {
    const workflow_assignments: { step_id: number; user_id: number }[] = [];
    if (activeRentalTemplate?.steps?.length) {
      activeRentalTemplate.steps.forEach((step, idx) => {
        const userId = data.approvals?.[`step_${idx}`];
        if (userId && typeof userId === "number") {
          workflow_assignments.push({
            step_id: step.id,
            user_id: userId,
          });
        }
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { approvals, required_steps, ...rest } = data;
    const payload = {
      ...rest,
      attachments: data.attachments || [],
      workflow_assignments,
    };

    await mutate(
      { url: endpoints.RENTALS, method: "post", body: payload },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);

          // If the current user is the first-step approver, increment their PENDING task count
          const isCurrentUserApprover =
            workflow_assignments[0]?.user_id === currentUser?.id;
          if (isCurrentUserApprover) {
            dispatch(
              updateCount({ status: "PENDING", count: counts.PENDING + 1 }),
            );
          }

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
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>{t("form.create_title")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("form.create_description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <div className="flex flex-col gap-3">
              {/* General Information */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">
                  {t("form.general_info")}
                </h3>
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    name="contract_number"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.contract_number")}</FieldLabel>
                        <Input
                          {...field}
                          placeholder={t("form.placeholder_contract")}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="external_link"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.external_link")}</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t("form.placeholder_link")}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="unit_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.organization")}</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? 0 : Number(val))
                          }
                          value={field.value ? field.value.toString() : ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue
                              placeholder={t("form.placeholder_org")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              {t("form.none")}
                            </SelectItem>
                            {orgUnits.map((o) => (
                              <SelectItem key={o.id} value={o.id.toString()}>
                                {o.name}
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
                    name="customer_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.customer")}</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? 0 : Number(val))
                          }
                          value={field.value ? field.value.toString() : ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue
                              placeholder={t("form.placeholder_customer")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              {t("form.none")}
                            </SelectItem>
                            {customers?.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
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
                    name="lease_date"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.lease_date")}</FieldLabel>
                        <DatePickerField form={form} name="lease_date" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="duration_days"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.duration")}</FieldLabel>
                        <FormattedNumberInput
                          {...field}
                          value={field.value as number | string | null}
                          onChange={(val) => field.onChange(val ?? 0)}
                          placeholder={t("form.placeholder_duration")}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="total_revenue"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.total_revenue")}</FieldLabel>
                        <FormattedNumberInput
                          {...field}
                          value={field.value as number | string | null}
                          onChange={(val) => field.onChange(val ?? 0)}
                          placeholder={t("form.placeholder_revenue")}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="reason"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-2">
                        <FieldLabel>{t("form.reason")}</FieldLabel>
                        <Textarea
                          {...field}
                          placeholder={t("form.placeholder_reason")}
                          className="min-h-[80px]"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h3 className="text-sm font-semibold text-primary">
                    {t("form.rental_assets")}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      append({
                        asset_id: 0,
                        quantity: 1,
                        from_location_id: 0,
                        rental_revenue: 0,
                        lessee_location: "",
                      })
                    }
                  >
                    {t("form.btn_add_asset")}
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  {fields.map((item, index) => (
                    <RentalItemRow
                      disabled={fields.length === 1}
                      key={item.id}
                      index={index}
                      control={form.control}
                      setValue={form.setValue}
                      locations={locations}
                      onRemove={() => remove(index)}
                    />
                  ))}
                  {form.formState.errors.items?.root && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.items.root.message}
                    </p>
                  )}
                </div>
              </div>

              <FormAttachmentsSection
                control={form.control}
                title={t("form.attachments")}
              />

              <ApprovalProcessSection
                className="[&_h3]:border-b [&_h3]:pb-1"
                control={form.control}
                steps={activeRentalTemplate?.steps || []}
                users={users}
                title={t("form.approval_process")}
              />
            </div>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("form.saving") : t("form.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
