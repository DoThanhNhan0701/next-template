"use client";

import { MapPin, User } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ILocation } from "@/types/location";
import { IStaff } from "@/types/staff";

import { TransferFormValues } from "../TransferFormModal";

interface SourceInfoSectionProps {
  form: UseFormReturn<TransferFormValues>;
  staffs: IStaff[];
  locations: ILocation[];
  watchedType: "holder" | "location";
}

export function SourceInfoSection({
  form,
  staffs,
  locations,
  watchedType,
}: SourceInfoSectionProps) {
  return (
    <div className="flex flex-col gap-3 mb-3">
      <h3 className="text-sm font-semibold text-primary border-b pb-2 tracking-tight">
        1. Source Information
      </h3>
      <FieldGroup className="grid grid-cols-2 gap-3">
        <Controller
          name="source_type"
          control={form.control}
          render={({ field }) => (
            <Field className="col-span-2 gap-1 mb-3">
              <FieldLabel>
                Transfer type
              </FieldLabel>
              <Tabs
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue("source_id", 0);
                  form.setValue("target_id", null);
                  form.setValue("target_unit_id", null);
                  form.setValue("location_id", null);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-16 p-1 bg-muted/30">
                  <TabsTrigger
                    value="holder"
                    className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium">Personnel</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="location"
                    className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium">Location</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </Field>
          )}
        />

        <Controller
          name="source_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="col-span-2 gap-1">
              <FieldLabel>
                {watchedType === "holder"
                  ? "Select source personnel"
                  : "Select source location"}
              </FieldLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value ? field.value.toString() : ""}
              >
                <SelectTrigger className="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm">
                  <SelectValue placeholder="Select source entity..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {watchedType === "holder" &&
                    staffs.map((s) => (
                      <SelectItem
                        key={`source-staff-${s.id}`}
                        value={s.id.toString()}
                      >
                        {s.full_name} - ({s.staff_code})
                      </SelectItem>
                    ))}
                  {watchedType === "location" &&
                    locations.map((l) => (
                      <SelectItem
                        key={`source-loc-${l.id}`}
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
      </FieldGroup>
    </div>
  );
}
