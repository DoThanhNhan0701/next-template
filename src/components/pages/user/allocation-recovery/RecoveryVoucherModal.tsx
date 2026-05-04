"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

import { ApprovalProcessSection } from "@/components/common/ApprovalProcessSection";
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
import { updateCount } from "@/redux/slices/task";
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { IOrgUnit } from "@/types/org";
import { IStaff } from "@/types/staff";
import { ITemplate } from "@/types/template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

import { RecoveryItemRow } from "./components/RecoveryItemRow";

type RecoveryFormValues = z.input<typeof RecoveryCreateSchema>;

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
  const t = useTranslations("page_allocation_recovery");
  const { mutate, pending } = useMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { prefill } = useSelector((state: RootState) => state.recovery);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { counts } = useSelector((state: RootState) => state.task);

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
      approvals: {},
      required_steps: 0,
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
        items: [
          {
            location_id: prefill?.location_id ?? 0,
            asset_id: prefill?.asset_id ?? 0,
            quantity: 1,
          },
        ],
        attachments: [],
        approvals: {},
        required_steps: activeTemplate?.steps?.length || 0,
      });
    }
  }, [isOpen, prefill, form, activeTemplate]);

  useEffect(() => {
    if (activeTemplate?.steps?.length) {
      form.setValue("required_steps", activeTemplate.steps.length);
    }
  }, [activeTemplate, form]);

  const onSubmit = async (data: RecoveryFormValues) => {
    const workflow_assignments: { step_id: number; user_id: number }[] = [];
    if (activeTemplate?.steps?.length) {
      activeTemplate.steps.forEach((step, idx) => {
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
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>{t("form.create_recovery_title")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("form.create_recovery_desc")}
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
                <h3 className="text-sm font-semibold text-primary">
                  {t("form.general_info")}
                </h3>
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    name="unit_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.organization")}</FieldLabel>
                        <Select
                          onValueChange={(val) => field.onChange(val === "none" ? 0 : Number(val))}
                          value={field.value ? field.value.toString() : ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={t("form.placeholder_unit")} />
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
                    name="staff_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.recovered_from_staff")}</FieldLabel>
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
                                  ? t("form.placeholder_unit_first")
                                  : t("form.placeholder_staff")
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
                        <FieldLabel>{t("form.recovery_date")}</FieldLabel>
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
                        <FieldLabel>{t("form.external_link")}</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t("form.placeholder_link")}
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
                        <FieldLabel>{t("form.recovery_reason")}</FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t("form.placeholder_recovery_reason")}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary">
                    {t("form.assets_selection")}
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
                    <PlusIcon size={12} className="mr-1" /> {t("form.add_asset")}
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {fields.map((item, index) => (
                    <RecoveryItemRow
                      key={`${item.id}-${prefill?.unit_id ?? 0}`}
                      disabled={fields.length === 1}
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

              <ApprovalProcessSection
                control={form.control}
                steps={activeTemplate?.steps || []}
                users={users}
              />

              <FormAttachmentsSection
                control={form.control}
                title={t("form.attachments")}
              />
            </div>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("form.saving") : t("form.create_btn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
