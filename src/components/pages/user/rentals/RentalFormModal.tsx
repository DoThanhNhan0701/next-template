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
import { ICustomer } from "@/types/customer";
import { ILocation } from "@/types/location";
import { IOrgUnit } from "@/types/org";
import { IPhysicalAsset } from "@/types/physical-asset";
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
    <div className="relative bg-muted/30 border rounded-lg p-3 flex flex-col gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        className="absolute right-1 top-1 h-6 w-6 text-red-500 hover:bg-red-50"
        onClick={onRemove}
      >
        <Trash size={12} />
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Field className="gap-1">
          <FieldLabel>Location</FieldLabel>
          <Select
            onValueChange={(val) => {
              setValue(`items.${index}.from_location_id`, Number(val));
              setValue(`items.${index}.asset_id`, 0);
            }}
            value={locationId ? locationId.toString() : ""}
          >
            <SelectTrigger>
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
        </Field>

        <Controller
          name={`items.${index}.asset_id`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>Asset</FieldLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value ? field.value.toString() : ""}
                disabled={!locationId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !locationId
                        ? "Select location first"
                        : assetsPending
                          ? "Loading..."
                          : "Select asset"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
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
      </div>

      {/* Row 2: Quantity + Revenue */}
      <div className="grid grid-cols-2 gap-2">
        <Controller
          name={`items.${index}.quantity`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>Quantity</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder="e.g. 1"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`items.${index}.rental_revenue`}
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>Item revenue</FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value as number | string | null}
                onChange={(val) => field.onChange(val ?? 0)}
                placeholder="0.00"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
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
  const { mutate, pending } = useMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { prefill } = useSelector((state: RootState) => state.rental);

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

  const orgUnits = orgRes || [];
  const customers = cusRes?.data || [];
  const locations = locationRes || [];

  const form = useForm<RentalFormValues>({
    resolver: zodResolver(RentalCreateSchema),
    defaultValues: {
      record_number: "",
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
        record_number: "",
        unit_id: prefill?.unit_id ?? 0,
        customer_id: 0,
        lease_date: getTodayISO(),
        duration_days: 1,
        reason: prefill?.reason ?? "",
        total_revenue: 0,
        contract_number: "",
        notes: "",
        external_link: "",
        attachments: [],
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
  }, [isOpen, prefill, form]);

  const onSubmit = async (data: RentalFormValues) => {
    await mutate(
      { url: endpoints.RENTALS, method: "post", body: data },
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
          <DialogTitle>Create Rental Record</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fill in details to create a new rental record.
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
                    name="record_number"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldLabel>Record number</FieldLabel>
                        <Input {...field} placeholder="e.g. CT20240001" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="contract_number"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Contract number</FieldLabel>
                        <Input {...field} placeholder="e.g. HD/123" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="unit_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Organization</FieldLabel>
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={field.value ? field.value.toString() : ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select organization" />
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
                    name="customer_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <FieldLabel>Customer</FieldLabel>
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={field.value ? field.value.toString() : ""}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
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
                        <FieldLabel>Lease date</FieldLabel>
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
                        <FieldLabel>Duration (days)</FieldLabel>
                        <FormattedNumberInput
                          {...field}
                          value={field.value as number | string | null}
                          onChange={(val) => field.onChange(val ?? 0)}
                          placeholder="e.g. 1"
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
                        <FieldLabel>Total revenue</FieldLabel>
                        <FormattedNumberInput
                          {...field}
                          value={field.value as number | string | null}
                          onChange={(val) => field.onChange(val ?? 0)}
                          placeholder="0.00"
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
                        <FieldLabel>Reason</FieldLabel>
                        <Textarea
                          {...field}
                          placeholder="e.g. For event"
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
                    Rental Assets
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
                    <PlusIcon size={12} className="mr-1" /> Add Asset
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
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
