"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import { ApprovalProcessSection } from "@/components/common/ApprovalProcessSection";
import { DatePickerField } from "@/components/common/DatePickerField";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import {
  type StockAdjustmentFormValues,
  StockAdjustmentSchema,
} from "@/components/schemas/user/stock-adjustment.schema";
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
import { closeStockAdjustment } from "@/redux/slices/stockAdjustment";
import { updateCount } from "@/redux/slices/task";
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { ITemplate } from "@/types/template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

import { AdjustmentDetailRow } from "./components/AdjustmentDetailRow";

type FormValues = StockAdjustmentFormValues;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: "INCREASE" | "DECREASE";
}

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  onSuccess,
  defaultType = "INCREASE",
}: Props) {
  const { mutate, pending } = useMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { prefill } = useSelector((state: RootState) => state.stockAdjustment);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { counts } = useSelector((state: RootState) => state.task);
  const t = useTranslations("page_stock_in_out");

  const form = useForm<FormValues>({
    resolver: zodResolver(StockAdjustmentSchema),
    defaultValues: {
      adjustment_date: getTodayISO(),
      reason: "",
      external_link: "",
      attachments: [],
      details: [],
      approvals: {},
      required_steps: 0,
    },
  });

  const handleClose = () => {
    dispatch(closeStockAdjustment());
    onClose();
  };

  const { response: locationRes } = useGet<ILocation[]>(
    { url: endpoints.LOCATIONS },
    { disabled: !isOpen },
  );
  const { response: activeTemplate } = useGet<ITemplate>(
    {
      url: `${endpoints.TEMPLATE_ACTIVE}${defaultType === "DECREASE" ? "stock_out" : "stock_in"}`,
    },
    { disabled: !isOpen, deps: [defaultType] },
  );
  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );

  const locations = locationRes || [];
  const users = userRes || [];

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const watchedDetails = useWatch({
    control: form.control,
    name: "details",
  });

  const selectedAssetIds = (watchedDetails || [])
    .map((item: FormValues["details"][number]) => item?.asset_id)
    .filter((id): id is number => !!id && id !== 0);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        adjustment_date: getTodayISO(),
        reason: "",
        external_link: "",
        attachments: [],
        details: [
          {
            asset_id: prefill?.asset_id ?? 0,
            location_id: prefill?.location_id ?? 0,
            adjustment_type: prefill?.adjustment_type ?? defaultType,
            quantity_diff: 1,
            notes: "",
          },
        ],
        approvals: {},
        required_steps: activeTemplate?.steps?.length || 0,
      });
    }
  }, [isOpen, prefill, form, activeTemplate, defaultType]);

  useEffect(() => {
    if (activeTemplate?.steps?.length) {
      form.setValue("required_steps", activeTemplate.steps.length ?? 0);
    }
  }, [activeTemplate, form]);

  const onSubmit = async (data: FormValues) => {
    const workflow_assignments: { step_id: number; user_id: number }[] = [];
    if (activeTemplate?.steps?.length) {
      activeTemplate.steps.forEach((step, idx) => {
        const userId = data.approvals?.[`step_${idx}`];
        if (userId) {
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
        url: "/api/v1/stock-adjustments",
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
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>
            {defaultType === "DECREASE"
              ? t("form.create_stock_out")
              : t("form.create_stock_in")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {defaultType === "DECREASE"
              ? t("form.create_stock_out_desc")
              : t("form.create_stock_in_desc")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary">
                  {t("form.general_info")}
                </h3>
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    name="adjustment_date"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>{t("form.adjustment_date")}</FieldLabel>
                        <DatePickerField form={form} name="adjustment_date" />
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
                    name="reason"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-2">
                        <FieldLabel>{t("form.reason")}</FieldLabel>
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

              {/* Items */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary">
                    {t("form.adjustment_items")}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      append({
                        asset_id: 0,
                        location_id: 0,
                        adjustment_type: "INCREASE",
                        quantity_diff: 1,
                        notes: "",
                      })
                    }
                  >
                    <PlusIcon size={12} className="mr-1" /> {t("form.add_item")}
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <AdjustmentDetailRow
                    disabled={fields.length === 1}
                    key={field.id}
                    index={index}
                    control={form.control}
                    setValue={form.setValue}
                    locations={locations}
                    onRemove={() => remove(index)}
                    selectedAssetIds={selectedAssetIds}
                  />
                ))}
              </div>

              <ApprovalProcessSection
                control={form.control}
                steps={activeTemplate?.steps || []}
                users={users}
                title={t("form.approval_process")}
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
              {pending ? t("form.saving") : t("form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
