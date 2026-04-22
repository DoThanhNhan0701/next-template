"use client";

import { MapPin } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";

import { DatePickerField } from "@/components/common/DatePickerField";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import { TransferFormValues } from "@/components/schemas/user/transfer.schema";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ILocation } from "@/types/location";
import { IStaff } from "@/types/staff";

interface TargetDestinationSectionProps {
  form: UseFormReturn<TransferFormValues>;
  staffs: IStaff[];
  locations: ILocation[];
  watchedType: "holder" | "location";
}

export function TargetDestinationSection({
  form,
  staffs,
  locations,
  watchedType,
}: TargetDestinationSectionProps) {
  return (
    <div className="flex flex-col gap-3 pt-3">
      <h3 className="text-sm font-semibold text-primary flex items-center gap-2 tracking-tight">
        <span>3. Target Destination</span>
      </h3>

      <div className="bg-muted/20 border rounded-md p-3 space-y-3">
        {watchedType === "holder" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <Controller
              name="target_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel>Select specific personnel</FieldLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <SelectTrigger className="bg-white rounded-md border-muted-foreground/20 shadow-sm">
                      <SelectValue placeholder="Select specific personnel..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {staffs.map((s) => (
                        <SelectItem
                          key={`target-staff-${s.id}`}
                          value={s.id.toString()}
                        >
                          {s.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        )}

        {watchedType === "location" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <Controller
              name="target_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel>
                    Select new target location / warehouse
                  </FieldLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <SelectTrigger className="bg-white rounded-md border-muted-foreground/20 shadow-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Select target location..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {locations.map((l) => (
                        <SelectItem
                          key={`target-location-entity-${l.id}`}
                          value={l.id.toString()}
                        >
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        )}

        <hr className="border-muted-foreground/10" />

        <Controller
          name="location_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>New geographical location (optional)</FieldLabel>
              <Select
                onValueChange={(val) =>
                  field.onChange(val === "none" ? null : Number(val))
                }
                value={field.value ? field.value.toString() : "none"}
              >
                <SelectTrigger className="bg-white rounded-md border-muted-foreground/20 shadow-sm transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/50">
                  <SelectValue placeholder="Keep current location (No warehouse change)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Keep current location (No warehouse change)
                  </SelectItem>
                  {locations.map((l) => (
                    <SelectItem
                      key={`target-geoloc-${l.id}`}
                      value={l.id.toString()}
                    >
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Controller
          name="transfer_date"
          control={form.control}
          render={({ fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>Transfer date</FieldLabel>
              <DatePickerField form={form} name="transfer_date" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="external_link"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="col-span-2 gap-1">
              <FieldLabel>External link (Jira/Helpdesk)</FieldLabel>
              <Input
                placeholder="https://..."
                {...field}
                value={field.value || ""}
                className="bg-white rounded-md border-muted-foreground/20"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="col-span-3 gap-1">
              <FieldLabel>Reason & internal notes</FieldLabel>
              <Textarea
                placeholder="Enter detailed transfer reason..."
                {...field}
                value={field.value || ""}
                className="bg-white rounded-md border-muted-foreground/20 min-h-[100px] resize-none"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <FormAttachmentsSection
        className="[&>h3]:text-xs [&>h3]:font-semibold [&>h3]:tracking-wider [&>h3]:text-muted-foreground"
        control={form.control}
      />
    </div>
  );
}
