"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

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
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { ITemplate } from "@/types/template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

import { AdjustmentDetailRow } from "./components/AdjustmentDetailRow";
import { StockAdjustmentApprovalSection } from "./components/StockAdjustmentApprovalSection";

type FormValues = StockAdjustmentFormValues;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { mutate, pending } = useMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { prefill } = useSelector((state: RootState) => state.stockAdjustment);

  const handleClose = () => {
    dispatch(closeStockAdjustment());
    onClose();
  };

  const { response: locationRes } = useGet<ILocation[]>(
    { url: endpoints.LOCATIONS },
    { disabled: !isOpen },
  );
  const { response: activeTemplate } = useGet<ITemplate>(
    { url: `${endpoints.TEMPLATE_ACTIVE}stock_in` },
    { disabled: !isOpen },
  );
  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );

  const locations = locationRes || [];
  const users = userRes || [];

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

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
            adjustment_type: prefill?.adjustment_type ?? "INCREASE",
            quantity_diff: 1,
            notes: "",
          },
        ],
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
          <DialogTitle>Create Stock In/Out</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create a new stock increase or decrease record.
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
                  1. General information
                </h3>
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    name="adjustment_date"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Adjustment date</FieldLabel>
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
                        <FieldLabel>External link</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g. Jira/Helpdesk link"
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    name="reason"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-2">
                        <FieldLabel>Reason</FieldLabel>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Reason for adjustment"
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
                    2. Adjustment items
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
                    <PlusIcon size={12} className="mr-1" /> Add item
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                    No items yet. Click &quot;Add Item&quot; to get started.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {fields.map((field, index) => (
                      <AdjustmentDetailRow
                        disabled={fields.length === 1}
                        key={field.id}
                        index={index}
                        control={form.control}
                        setValue={form.setValue}
                        locations={locations}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Approval Process */}
              <StockAdjustmentApprovalSection
                form={form}
                users={users}
                activeTemplate={activeTemplate || undefined}
              />

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
