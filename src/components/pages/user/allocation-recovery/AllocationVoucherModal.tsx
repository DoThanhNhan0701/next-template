"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

import { ApprovalProcessSection } from "@/components/common/ApprovalProcessSection";
import { DatePickerField } from "@/components/common/DatePickerField";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import { SelectField } from "@/components/common/SelectField";
import { AllocationCreateSchema } from "@/components/schemas/user/allocation.schema";
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
import { Textarea } from "@/components/ui/textarea";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { AppDispatch, RootState } from "@/redux";
import { closeAllocation } from "@/redux/slices/allocation";
import { updateCount } from "@/redux/slices/task";
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { IOrgUnit } from "@/types/org";
import { IStaff } from "@/types/staff";
import { ITemplate } from "@/types/template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

import { AllocationItemRow } from "./components/AllocationItemRow";

type AllocationFormValues = z.input<typeof AllocationCreateSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AllocationVoucherModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const t = useTranslations("page_allocation_recovery");
  const tCommon = useTranslations("Common");
  const { mutate, pending } = useMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { prefill } = useSelector((state: RootState) => state.allocation);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { counts } = useSelector((state: RootState) => state.task);

  const handleClose = () => {
    dispatch(closeAllocation());
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
  const { response: activeAllocationTemplate } = useGet<ITemplate>(
    { url: `${endpoints.TEMPLATE_ACTIVE}allocation` },
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

  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(AllocationCreateSchema),
    defaultValues: {
      allocated_to_type: "user",
      unit_id: 0,
      staff_id: null,
      allocation_date: getTodayISO(),
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

  useEffect(() => {
    form.setValue("staff_id", null);
  }, [watchedUnitId, form]);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        allocated_to_type: "user",
        unit_id: prefill?.unit_id ?? 0,
        staff_id: null,
        allocation_date: getTodayISO(),
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
        required_steps: activeAllocationTemplate?.steps?.length || 0,
      });
    }
  }, [isOpen, prefill, form, activeAllocationTemplate]);

  useEffect(() => {
    if (activeAllocationTemplate?.steps?.length) {
      form.setValue("required_steps", activeAllocationTemplate.steps.length);
    }
  }, [activeAllocationTemplate, form]);

  const onSubmit = async (data: AllocationFormValues) => {
    const workflow_assignments: { step_id: number; user_id: number }[] = [];
    if (activeAllocationTemplate?.steps?.length) {
      activeAllocationTemplate.steps.forEach((step, idx) => {
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
      {
        url: endpoints.ALLOCATIONS,
        method: "post",
        body: payload,
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
          <DialogTitle>{t("form.create_allocation_title")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("form.create_allocation_desc")}
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
                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Controller
                    name="unit_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.organization")}</FieldLabel>
                        <SelectField
                          options={(orgUnits || []).map((l) => ({
                            label: `${l.name} - (${l.code})`,
                            value: l.id,
                          }))}
                          value={field.value as number}
                          onChange={(val) => {
                            field.onChange(Number(val));
                          }}
                          placeholder={t("form.placeholder_unit")}
                        />
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
                        <FieldLabel>{t("form.recipient_staff")}</FieldLabel>
                        <SelectField
                          options={(watchedUnitId && Number(watchedUnitId) !== 0
                            ? staffs.filter(
                              (s) => s.unit_id === Number(watchedUnitId),
                            )
                            : []
                          ).map((l) => ({
                            label: `${l.full_name} - (${l?.staff_code ?? ""})`,
                            value: l.id,
                          }))}
                          value={field.value as number}
                          onChange={(val) => {
                            field.onChange(Number(val));
                          }}
                          placeholder={t("form.placeholder_staff")}
                          disabled={
                            !watchedUnitId || Number(watchedUnitId) === 0
                          }
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="allocation_date"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.allocation_date")}</FieldLabel>
                        <DatePickerField form={form} name="allocation_date" />
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
                      <Field className="gap-1 col-span-full">
                        <FieldLabel>{t("form.allocation_reason")}</FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
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
                    {t("form.add_asset")}
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {fields.map((item, index) => (
                    <AllocationItemRow
                      key={item.id}
                      disabled={fields.length === 1}
                      index={index}
                      control={form.control}
                      setValue={form.setValue}
                      locations={locations}
                      onRemove={() => remove(index)}
                      prefillLocationId={
                        index === 0 ? prefill?.location_id : undefined
                      }
                      prefillAssetId={
                        index === 0 ? prefill?.asset_id : undefined
                      }
                    />
                  ))}
                </div>
              </div>
              <ApprovalProcessSection
                control={form.control}
                title={`3. ${tCommon("approval_process")}`}
                steps={activeAllocationTemplate?.steps || []}
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
