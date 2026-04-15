"use client";

import { User, MapPin } from "lucide-react";
import { UseFormReturn, Controller } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransferFormValues } from "../TransferFormModal";
import { ILocation } from "@/types/location";
import { IStaff } from "@/types/staff";

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
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-primary border-b pb-2 tracking-tight">
        1. Source Information
      </h3>
      <FieldGroup className="grid grid-cols-2 gap-6">
        <Controller
          name="source_type"
          control={form.control}
          render={({ field }) => (
            <Field className="col-span-2">
              <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest">
                Transfer Type
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
            <Field className="col-span-2">
              <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest">
                {watchedType === "holder"
                  ? "Select Source Personnel *"
                  : "Select Source Location *"}
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
