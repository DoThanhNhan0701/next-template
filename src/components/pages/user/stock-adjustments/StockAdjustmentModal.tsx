"use client";

import { useEffect } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@/hooks/useMutation";
import { useGet } from "@/hooks/useGet";
import { endpoints } from "@/config/endpoints";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { ILocation } from "@/types/location";
import { IPhysicalAsset } from "@/types/physical-asset";
import { ITemplate, ITemplateStep } from "@/types/template";
import { IUser } from "@/types/auth";
import { ApproverSelect } from "@/components/common/ApproverSelect";
import { PlusIcon, Trash } from "lucide-react";
const DetailSchema = z.object({
  asset_id: z.number().min(1, "Please select an asset"),
  location_id: z.number().min(1, "Please select a location"),
  adjustment_type: z.enum(["INCREASE", "DECREASE"]),
  quantity_diff: z.number().min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
});

const StockAdjustmentSchema = z.object({
  adjustment_date: z.string().min(1, "Date is required"),
  reason: z.string().min(1, "Reason is required"),
  external_link: z.string().optional(),
  approver_step_1_id: z.number().nullable().optional(),
  approver_step_2_id: z.number().nullable().optional(),
  details: z.array(DetailSchema).min(1, "At least one item is required"),
});

type FormValues = z.infer<typeof StockAdjustmentSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function DetailRow({
  index,
  control,
  setValue,
  locations,
  onRemove,
}: {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  locations: ILocation[];
  onRemove: () => void;
}) {
  const locationId = useWatch({ control, name: `details.${index}.location_id` });

  const { response: assetRes, pending: assetsPending } = useGet<{ items: IPhysicalAsset[] }>(
    {
      url: endpoints.PHYSICAL_ASSETS,
      config: { params: { location_id: locationId, limit: 200 } },
    },
    { disabled: !locationId || locationId === 0, deps: [locationId] },
  );

  const assets = assetRes?.items || [];

  return (
    <div className="relative bg-muted/30 border rounded-lg p-3 pr-10 flex flex-row flex-wrap items-start gap-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 text-red-500 hover:bg-red-50"
        onClick={onRemove}
      >
        <Trash size={12} />
      </Button>

      {/* Location — chọn trước */}
      <Controller
        name={`details.${index}.location_id`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 flex-1 min-w-[140px]">
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground tracking-wider">
              Location *
            </FieldLabel>
            <Select
              onValueChange={(v) => {
                field.onChange(Number(v));
                // clear asset khi đổi location
                setValue(`details.${index}.asset_id`, 0);
              }}
              value={field.value ? field.value.toString() : ""}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Asset — phụ thuộc location */}
      <Controller
        name={`details.${index}.asset_id`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 flex-1 min-w-[160px]">
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground tracking-wider">
              Asset *
            </FieldLabel>
            <Select
              onValueChange={(v) => field.onChange(Number(v))}
              value={field.value ? field.value.toString() : ""}
              disabled={!locationId || locationId === 0}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue
                  placeholder={
                    !locationId || locationId === 0
                      ? "Select location first"
                      : assetsPending
                        ? "Loading..."
                        : assets.length === 0
                          ? "No assets found"
                          : "Select asset"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.name} ({a.asset_code}) Quantity: {a.quantity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {/* Type */}
      <Controller
        name={`details.${index}.adjustment_type`}
        control={control}
        render={({ field }) => (
          <Field className="gap-1 w-[130px]">
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground tracking-wider">
              Type *
            </FieldLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCREASE">
                  <span className="text-green-600 font-medium">↑ Increase</span>
                </SelectItem>
                <SelectItem value="DECREASE">
                  <span className="text-red-500 font-medium">↓ Decrease</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      {/* Quantity */}
      <Controller
        name={`details.${index}.quantity_diff`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 w-20">
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground tracking-wider">
              Qty *
            </FieldLabel>
            <Input
              type="number"
              className="h-9 text-xs"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Notes */}
      <Controller
        name={`details.${index}.notes`}
        control={control}
        render={({ field }) => (
          <Field className="gap-1 flex-1 min-w-[140px]">
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground tracking-wider">
              Notes
            </FieldLabel>
            <Input className="h-9 text-xs" {...field} value={field.value ?? ""} placeholder="Optional" />
          </Field>
        )}
      />
    </div>
  );
}

export default function StockAdjustmentModal({ isOpen, onClose, onSuccess }: Props) {
  const { mutate, pending } = useMutation();

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
      adjustment_date: new Date().toISOString().split("T")[0],
      reason: "",
      external_link: "",
      approver_step_1_id: null,
      approver_step_2_id: null,
      details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "details" });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        adjustment_date: new Date().toISOString().split("T")[0],
        reason: "",
        external_link: "",
        approver_step_1_id: null,
        approver_step_2_id: null,
        details: [{ asset_id: 0, location_id: 0, adjustment_type: "INCREASE", quantity_diff: 1, notes: "" }],
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: FormValues) => {
    const workflow_assignments: { step_id: number; user_id: number }[] = [];
    if (activeTemplate?.steps?.length) {
      if (data.approver_step_1_id) {
        workflow_assignments.push({ step_id: activeTemplate.steps[0].id, user_id: data.approver_step_1_id });
      }
      if (activeTemplate.steps.length > 1 && data.approver_step_2_id) {
        workflow_assignments.push({ step_id: activeTemplate.steps[1].id, user_id: data.approver_step_2_id });
      }
    }

    const { approver_step_1_id, approver_step_2_id, ...rest } = data;
    void approver_step_1_id; void approver_step_2_id;

    await mutate(
      { url: "/api/v1/stock-adjustments", method: "post", body: { ...rest, attachments: [], workflow_assignments } },
      {
        onSuccess: (res) => { getApiSuccessMessage(res); onSuccess(); onClose(); },
        onError: (err) => { getApiErrorMessage(err); },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <DialogTitle>Create Stock Adjustment</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create a new stock increase or decrease record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col gap-6 pb-4">

              {/* General Info */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-primary border-b pb-1">General Information</h3>
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    name="adjustment_date"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Adjustment Date *</FieldLabel>
                        <Input type="date" {...field} value={field.value ?? ""} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="external_link"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>External Link</FieldLabel>
                        <Input {...field} value={field.value ?? ""} placeholder="e.g. Jira/Helpdesk link" />
                      </Field>
                    )}
                  />

                  <Controller
                    name="reason"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-2">
                        <FieldLabel>Reason *</FieldLabel>
                        <Textarea {...field} value={field.value ?? ""} placeholder="Reason for adjustment" className="min-h-[80px]" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h3 className="text-sm font-semibold text-primary">Adjustment Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => append({ asset_id: 0, location_id: 0, adjustment_type: "INCREASE", quantity_diff: 1, notes: "" })}
                  >
                    <PlusIcon size={12} className="mr-1" /> Add Item
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                    No items yet. Click &quot;Add Item&quot; to get started.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {fields.map((field, index) => (
                      <DetailRow
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
              {activeTemplate && (activeTemplate.steps || []).length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">Approval Process</h3>
                  <FieldGroup className="grid grid-cols-2 gap-3">
                    {(activeTemplate.steps || []).map((step: ITemplateStep, idx) => {
                      const name = idx === 0 ? "approver_step_1_id" : "approver_step_2_id";
                      return (
                        <Controller
                          key={step.id}
                          name={name as keyof FormValues}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field className="gap-1">
                              <FieldLabel>{step.name}</FieldLabel>
                              <ApproverSelect
                                step={step}
                                allUsers={users}
                                value={field.value != null ? field.value.toString() : ""}
                                onChange={(val) => field.onChange(val === "none" ? null : Number(val))}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                      );
                    })}
                  </FieldGroup>
                </div>
              )}

            </div>
          </div>

          <div className="p-4 border-t flex justify-end gap-3 shrink-0 bg-muted/10">
            <Button type="button" variant="outline" onClick={onClose} className="w-24">Cancel</Button>
            <Button type="submit" disabled={pending} className="w-24">
              {pending ? "Saving..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
