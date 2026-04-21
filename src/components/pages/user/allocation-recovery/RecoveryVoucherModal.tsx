"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash } from "lucide-react";
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

import { ApproverSelect } from "@/components/common/ApproverSelect";
import { DatePickerField } from "@/components/common/DatePickerField";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import { RecoveryCreateSchema } from "@/components/schemas/user/recovery.schema";
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
import { closeRecovery } from "@/redux/slices/recovery";
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { IOrgUnit } from "@/types/org";
import { IPhysicalAsset } from "@/types/physical-asset";
import { IStaff } from "@/types/staff";
import { ITemplate, ITemplateStep } from "@/types/template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

type RecoveryFormValues = z.input<typeof RecoveryCreateSchema>;

/* ───── Per-item row component ───── */
interface RecoveryItemRowProps {
  index: number;
  control: Control<RecoveryFormValues>;
  setValue: UseFormSetValue<RecoveryFormValues>;
  locations: ILocation[];
  unitId: number;
  staffId: string | null;
  onRemove: () => void;
  prefillAssetId?: number;
}

function RecoveryItemRow({
  index,
  control,
  setValue,
  locations,
  unitId,
  staffId,
  onRemove,
  prefillAssetId,
}: RecoveryItemRowProps) {
  const { response: assetRes, pending: assetsPending } = useGet<{
    items: IPhysicalAsset[];
  }>(
    {
      url: endpoints.PHYSICAL_ASSETS,
      config: {
        params: {
          ...(staffId ? { staff_id: staffId } : { unit_id: unitId }),
        },
      },
    },
    { disabled: !unitId && !staffId, deps: [unitId, staffId] },
  );

  const assets = assetRes?.items || [];

  // Auto-select prefill asset once assets finish loading
  useEffect(() => {
    if (!prefillAssetId || assetsPending || !assetRes?.items?.length) return;
    setValue(`items.${index}.asset_id`, prefillAssetId);
  }, [prefillAssetId, assetsPending, assetRes, index, setValue]);

  return (
    <div className="relative bg-muted/30 border rounded-lg p-3 pr-10 flex flex-row items-start gap-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 text-red-500 hover:bg-red-50"
        onClick={onRemove}
      >
        <Trash size={12} />
      </Button>

      {/* Asset */}
      <Controller
        name={`items.${index}.asset_id`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 flex-1">
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground tracking-wider">
              Asset *
            </FieldLabel>
            <Select
              onValueChange={(val) => {
                const aid = Number(val);
                field.onChange(aid);
                // Auto-fill location if asset is selected
                const selectedAsset = assets.find((a) => a.id === aid);
                if (selectedAsset?.location_id) {
                  setValue(
                    `items.${index}.location_id`,
                    selectedAsset.location_id,
                  );
                }
              }}
              value={field.value ? field.value.toString() : ""}
              disabled={!unitId}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue
                  placeholder={
                    !unitId
                      ? "Select unit first"
                      : assetsPending
                        ? "Loading..."
                        : "Select asset"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.name} ({a.asset_code}) Quantity: {a?.holding_qty ?? 0}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Recovering Locations */}
      <Controller
        name={`items.${index}.location_id`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 flex-1">
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground tracking-wider">
              Locations *
            </FieldLabel>
            <Select
              onValueChange={(val) => field.onChange(Number(val))}
              value={field.value ? field.value.toString() : ""}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id.toString()}>
                    {loc.name}
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
          <Field className="gap-1 w-24">
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground tracking-wider">
              Qty *
            </FieldLabel>
            <Input
              type="number"
              className="h-9 text-xs"
              {...field}
              value={(field.value as number) ?? ""}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  );
}

/* ───── Main modal ───── */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecoveryVoucherModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { mutate, pending } = useMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { prefill } = useSelector((state: RootState) => state.recovery);

  const handleClose = () => {
    dispatch(closeRecovery());
    onClose();
  };

  const { response: orgRes } = useGet<IOrgUnit[]>(
    { url: endpoints.ORG_UNITS },
    { disabled: !isOpen },
  );
  const { response: staffRes } = useGet<{ items: IStaff[] }>(
    { url: endpoints.STAFFS },
    { disabled: !isOpen },
  );
  const { response: locationRes } = useGet<ILocation[]>(
    { url: endpoints.LOCATIONS },
    { disabled: !isOpen },
  );
  const { response: activeTemplate } = useGet<ITemplate>(
    { url: `${endpoints.TEMPLATE_ACTIVE}recovery` },
    { disabled: !isOpen },
  );
  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );

  const orgUnits = orgRes || [];
  const staffs = staffRes?.items || [];
  const locations = locationRes || [];
  const users = userRes || [];

  const form = useForm<RecoveryFormValues>({
    resolver: zodResolver(RecoveryCreateSchema),
    defaultValues: {
      recovered_from_type: "user",
      unit_id: 0,
      staff_id: null,
      recovery_date: getTodayISO(),
      location_id: null,
      reason: "",
      external_link: "",
      items: [],
      attachments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedUnitId = useWatch({
    control: form.control,
    name: "unit_id",
  });

  const watchedStaffId = (useWatch({
    control: form.control,
    name: "staff_id",
  }) || null) as string | null;

  useEffect(() => {
    form.setValue("staff_id", null);
  }, [watchedUnitId, form]);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        recovered_from_type: "user",
        unit_id: prefill?.unit_id ?? 0,
        staff_id: null,
        recovery_date: getTodayISO(),
        location_id: null,
        reason: prefill?.reason ?? "",
        external_link: "",
        approver_step_1_id: null,
        approver_step_2_id: null,
        items: [
          {
            location_id: prefill?.location_id ?? 0,
            asset_id: prefill?.asset_id ?? 0,
            quantity: 1,
          },
        ],
        attachments: [],
      });
    }
  }, [isOpen, prefill, form]);

  const onSubmit = async (data: RecoveryFormValues) => {
    const workflow_assignments: { step_id: number; user_id: number }[] = [];
    if (activeTemplate?.steps?.length) {
      if (data.approver_step_1_id) {
        workflow_assignments.push({
          step_id: activeTemplate.steps[0].id,
          user_id: data.approver_step_1_id,
        });
      }
      if (activeTemplate.steps.length > 1 && data.approver_step_2_id) {
        workflow_assignments.push({
          step_id: activeTemplate.steps[1].id,
          user_id: data.approver_step_2_id,
        });
      }
    }
    const { approver_step_1_id, approver_step_2_id, ...rest } =
      data as RecoveryFormValues & {
        approver_step_1_id?: number | null;
        approver_step_2_id?: number | null;
      };
    void approver_step_1_id;
    void approver_step_2_id;

    await mutate(
      {
        url: endpoints.RECOVERIES,
        method: "post",
        body: {
          ...rest,
          attachments: data.attachments || [],
          workflow_assignments,
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
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>Create Recovery Voucher</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fill in details to create a new recovery voucher.
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
                  General Information
                </h3>
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    name="unit_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Organization *</FieldLabel>
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={field.value ? field.value.toString() : ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
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
                    name="staff_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Recovered From (Staff)</FieldLabel>
                        <Select
                          onValueChange={(val: string) =>
                            field.onChange(val === "none" ? null : Number(val))
                          }
                          value={
                            field.value !== null && field.value !== undefined
                              ? field.value.toString()
                              : ""
                          }
                          disabled={
                            !watchedUnitId || Number(watchedUnitId) === 0
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue
                              placeholder={
                                !watchedUnitId || Number(watchedUnitId) === 0
                                  ? "Select unit first"
                                  : "Select staff"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            {(watchedUnitId && Number(watchedUnitId) !== 0
                              ? staffs.filter(
                                  (s) => s.unit_id === Number(watchedUnitId),
                                )
                              : []
                            ).map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.full_name} ({s.staff_code})
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
                    name="recovery_date"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Recovery Date *</FieldLabel>
                        <DatePickerField form={form} name="recovery_date" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="external_link"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>External Ticket Link</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. Jira/Helpdesk link"
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
                        <FieldLabel>Recovery Reason *</FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Reason for recovery"
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

              {/* Items Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h3 className="text-sm font-semibold text-primary">
                    Assets Selection
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      append({ location_id: 0, asset_id: 0, quantity: 1 })
                    }
                  >
                    <PlusIcon size={12} className="mr-1" /> Add Asset
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {fields.map((item, index) => (
                    <RecoveryItemRow
                      key={`${item.id}-${prefill?.unit_id ?? 0}`}
                      index={index}
                      control={form.control}
                      setValue={form.setValue}
                      locations={locations}
                      unitId={Number(watchedUnitId)}
                      staffId={watchedStaffId}
                      onRemove={() => remove(index)}
                      prefillAssetId={
                        index === 0 ? prefill?.asset_id : undefined
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Approval Process */}
              {activeTemplate && (activeTemplate.steps || []).length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">
                    Approval Process
                  </h3>
                  <FieldGroup className="grid grid-cols-2 gap-3">
                    {(activeTemplate.steps || []).map(
                      (step: ITemplateStep, idx) => {
                        const name =
                          idx === 0
                            ? "approver_step_1_id"
                            : "approver_step_2_id";
                        return (
                          <Controller
                            key={step.id}
                            name={name as keyof RecoveryFormValues}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field className="gap-1">
                                <FieldLabel>{step.name}</FieldLabel>
                                <ApproverSelect
                                  step={step}
                                  allUsers={users}
                                  value={
                                    field.value != null
                                      ? field.value.toString()
                                      : ""
                                  }
                                  onChange={(val) =>
                                    field.onChange(
                                      val === "none" ? null : Number(val),
                                    )
                                  }
                                />
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                        );
                      },
                    )}
                  </FieldGroup>
                </div>
              )}

              {/* Attachments */}
              <FormAttachmentsSection
                control={form.control}
                title="Attachments"
              />
            </div>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
