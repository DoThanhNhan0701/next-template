"use client";

import { useEffect } from "react";
import {
  useForm,
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RecoveryCreateSchema } from "@/components/schemas/user/recovery.schema";
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
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
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
import { IOrgUnit } from "@/types/org";
import { IStaff } from "@/types/staff";
import { ILocation } from "@/types/location";
import { IPhysicalAsset } from "@/types/physical-asset";
import { PlusIcon, Trash } from "lucide-react";

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
}

function RecoveryItemRow({
  index,
  control,
  setValue,
  locations,
  unitId,
  staffId,
  onRemove,
}: RecoveryItemRowProps) {
  const { response: assetRes, pending: assetsPending } = useGet<{
    items: IPhysicalAsset[];
  }>(
    {
      url: endpoints.PHYSICAL_ASSETS,
      config: {
        params: {
          status_code: "IN_USE",
          ...(staffId ? { staff_id: staffId } : { unit_id: unitId }),
        },
      },
    },
    { disabled: !unitId && !staffId, deps: [unitId, staffId] },
  );

  const assets = assetRes?.items || [];

  return (
    <div className="relative bg-muted/30 border rounded-lg p-3 pr-10 flex flex-row items-start gap-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 text-red-500 hover:bg-red-50"
        onClick={onRemove}
      >
        <Trash size={12} />
      </Button>

      {/* Physical Asset */}
      <Controller
        name={`items.${index}.asset_id`}
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1 flex-1">
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Physical Asset *
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
                    {a.name} ({a.asset_code})
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
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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
            <FieldLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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

  const orgUnits = orgRes || [];
  const staffs = staffRes?.items || [];
  const locations = locationRes || [];

  const form = useForm<RecoveryFormValues>({
    resolver: zodResolver(RecoveryCreateSchema),
    defaultValues: {
      recovered_from_type: "user",
      unit_id: 0,
      staff_id: null,
      recovery_date: new Date().toISOString().split("T")[0],
      location_id: null,
      reason: "",
      external_link: "",
      items: [],
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
        unit_id: 0,
        staff_id: null,
        recovery_date: new Date().toISOString().split("T")[0],
        location_id: null,
        reason: "",
        external_link: "",
        items: [
          {
            location_id: 0,
            asset_id: 0,
            quantity: 1,
          },
        ],
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: RecoveryFormValues) => {
    await mutate(
      {
        url: endpoints.RECOVERIES,
        method: "post",
        body: data,
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess();
          onClose();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <DialogTitle>Create Recovery Voucher</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fill in details to create a new recovery voucher.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col gap-6 pb-4">
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
                        <FieldLabel>Owning/Managing Unit *</FieldLabel>
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
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
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
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Recovery Date *</FieldLabel>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="location_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Locations</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={
                            field.value !== null && field.value !== undefined
                              ? field.value.toString()
                              : ""
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select locations" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="none"
                              className="text-muted-foreground italic"
                            >
                              (None)
                            </SelectItem>
                            {locations.map((loc) => (
                              <SelectItem
                                key={loc.id}
                                value={loc.id.toString()}
                              >
                                {loc.name}
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

                  <Controller
                    name="external_link"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1 col-span-2">
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
                </FieldGroup>
              </div>

              {/* Items Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h3 className="text-sm font-semibold text-primary">
                    Physical Assets Selection
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
                      key={item.id}
                      index={index}
                      control={form.control}
                      setValue={form.setValue}
                      locations={locations}
                      unitId={Number(watchedUnitId)}
                      staffId={watchedStaffId}
                      onRemove={() => remove(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex justify-end gap-3 shrink-0 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-24"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="w-24">
              {pending ? "Saving..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
