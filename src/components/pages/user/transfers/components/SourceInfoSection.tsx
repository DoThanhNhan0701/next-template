"use client";

import { useTranslations } from "next-intl";

import { MapPin, User } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";

import { TransferFormValues } from "@/components/schemas/user/transfer.schema";
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
  const t = useTranslations("page_transfers");
  return (
    <div className="flex flex-col gap-3 mb-3">
      <h3 className="text-sm font-semibold text-primary tracking-tight">
        {t("form.source_info")}
      </h3>
      <FieldGroup className="grid grid-cols-2 gap-3">
        <Controller
          name="source_type"
          control={form.control}
          render={({ field }) => (
            <Field className="col-span-2 gap-1 mb-3">
              <FieldLabel>{t("form.transfer_type")}</FieldLabel>
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
                    <span className="text-xs font-medium">{t("form.personnel")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="location"
                    className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium">{t("form.location")}</span>
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
                  ? t("form.select_source_personnel")
                  : t("form.select_source_location")}
              </FieldLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val === "none" ? 0 : Number(val));
                  form.setValue("details", [{ asset_id: 0, quantity: 1 }]);
                }}
                value={field.value ? field.value.toString() : undefined}
              >
                <SelectTrigger className="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm">
                  <SelectValue placeholder={t("form.select_source_entity")} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none" className="text-muted-foreground italic">
                    {t("filters.none")}
                  </SelectItem>
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
