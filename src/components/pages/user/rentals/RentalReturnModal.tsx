import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, Resolver, useFieldArray, useForm } from "react-hook-form";

import { ApprovalProcessSection } from "@/components/common/ApprovalProcessSection";
import { DatePickerField } from "@/components/common/DatePickerField";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import {
  RentalReturnFormValues,
  RentalReturnSchema,
} from "@/components/schemas/user/rental-return.schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { IRentalFull } from "@/types/rental";
import { ITemplate } from "@/types/template";
import { getTodayISO } from "@/utils/date";

import { ReturnItemRow } from "./component/ReturnItemRow";

interface RentalReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Record<string, unknown>) => void;
  pending: boolean;
  rentalDetail: IRentalFull | null;
}

export default function RentalReturnModal({
  isOpen,
  onClose,
  onConfirm,
  pending,
  rentalDetail,
}: RentalReturnModalProps) {
  const form = useForm<RentalReturnFormValues>({
    resolver: zodResolver(
      RentalReturnSchema,
    ) as Resolver<RentalReturnFormValues>,
    defaultValues: {
      return_date: getTodayISO(),
      notes: "",
      to_location_id: "",
      items: [],
      approvals: {},
      required_steps: 0,
      workflow_assignments: [],
    },
  });

  const { response: locationsRes } = useGet<ILocation[]>({
    url: endpoints.LOCATIONS,
  });

  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );

  const { response: activeTemplate } = useGet<ITemplate>(
    { url: `${endpoints.TEMPLATE_ACTIVE}rental_return` },
    { disabled: !isOpen },
  );

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const locations = locationsRes || [];
  const users = userRes || [];

  useEffect(() => {
    if (isOpen && rentalDetail) {
      const initialItems = rentalDetail.details.map((d) => ({
        asset_id: d.asset_id,
        rental_detail_id: d.id,
        quantity: d.quantity - d.returned_quantity,
        condition: "Normal",
        asset_name: d.asset.name,
        asset_code: d.asset.asset_code,
        max_quantity: d.quantity - d.returned_quantity,
        selected: true,
      }));

      const requiredSteps = activeTemplate?.steps?.length || 0;
      const initialApprovals: Record<string, number> = {};
      if (activeTemplate?.steps) {
        activeTemplate.steps.forEach((_, idx) => {
          initialApprovals[`step_${idx}`] = 0;
        });
      }

      replace(initialItems);
      form.reset({
        return_date: getTodayISO(),
        notes: "",
        items: initialItems,
        to_location_id:
          rentalDetail.details[0]?.from_location_id?.toString() || "",
        approvals: initialApprovals,
        required_steps: requiredSteps,
        workflow_assignments: [],
      });
    }
  }, [isOpen, rentalDetail, replace, form, activeTemplate]);

  const onSubmit = (values: RentalReturnFormValues) => {
    const workflow_assignments: Array<{ step_id: number; user_id: number }> =
      [];
    if (activeTemplate?.steps) {
      activeTemplate.steps.forEach((step, idx) => {
        const userId = values.approvals[`step_${idx}`];
        if (userId && typeof userId === "number") {
          workflow_assignments.push({
            step_id: step.id,
            user_id: userId,
          });
        }
      });
    }

    const payload = {
      return_date: new Date(values.return_date).toISOString(),
      notes: values.notes,
      to_location_id: Number(values.to_location_id),
      attachments: values.attachments || [],
      items: values.items
        .filter((item) => item.selected)
        .map((item) => ({
          asset_id: item.asset_id,
          rental_detail_id: item.rental_detail_id,
          quantity: Number(item.quantity),
          condition: item.condition,
        })),
      workflow_assignments,
    };

    onConfirm(payload);
  };

  const errors = form.formState.errors;
  const hasGeneralErrors = !!(
    errors.return_date ||
    errors.to_location_id ||
    errors.notes
  );
  const hasAssetsErrors = !!errors.items;

  if (!rentalDetail) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>Return rented assets</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create a return record for assets from customer — voucher{" "}
            {rentalDetail.record_number}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 overflow-y-auto flex flex-col gap-3">
            {/* General Information */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-primary flex justify-between items-center">
                General Information
                {hasGeneralErrors && (
                  <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
              </h3>
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="return_date"
                  control={form.control}
                  render={({ fieldState }) => (
                    <Field className="gap-1.5">
                      <FieldLabel className="text-xs">
                        Actual return date
                      </FieldLabel>
                      <DatePickerField form={form} name="return_date" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="to_location_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1.5">
                      <FieldLabel className="text-xs">
                        Return warehouse
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className="h-9"
                          data-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                              {loc.name} ({loc.code})
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
                  name="notes"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="gap-1.5 col-span-1 sm:col-span-2">
                      <FieldLabel className="text-xs">General notes</FieldLabel>
                      <Textarea
                        id="notes"
                        placeholder="e.g. Customer returned at warehouse, device in good condition..."
                        {...field}
                        value={field.value ?? ""}
                        className="min-h-[80px] text-sm"
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            {/* Asset selection */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-primary flex justify-between items-center">
                Asset list
                {hasAssetsErrors && (
                  <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
              </h3>
              <div className="border rounded-lg overflow-hidden border-border/60 shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="py-2.5 w-10" />
                      <TableHead className="py-2.5 text-xs font-bold text-muted-foreground tracking-wider">
                        Asset Info
                      </TableHead>
                      <TableHead className="py-2.5 text-center text-xs font-bold text-muted-foreground tracking-wider w-[10%]">
                        Renting
                      </TableHead>
                      <TableHead className="py-2.5 text-center text-xs font-bold text-muted-foreground tracking-wider w-[15%]">
                        Quantity
                      </TableHead>
                      <TableHead className="py-2.5 text-xs font-bold text-muted-foreground tracking-wider">
                        Condition
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/60">
                    {fields.map((field, index) => (
                      <ReturnItemRow
                        key={field.id}
                        index={index}
                        register={form.register}
                        setValue={form.setValue}
                        control={form.control}
                        field={field}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <FormAttachmentsSection
              control={form.control}
              title="Attachments"
            />

            <ApprovalProcessSection
              control={form.control}
              steps={activeTemplate?.steps || []}
              users={users}
              title="Approval Process"
              triggerClassName="h-10 bg-white"
            />

            {/* <ApprovalWorkflow
              control={form.control}
              template={activeTemplate}
              users={users}
            /> */}
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
