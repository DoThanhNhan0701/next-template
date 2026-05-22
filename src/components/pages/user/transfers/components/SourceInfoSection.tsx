"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import { MapPin, User } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";

import { SelectField } from "@/components/common/SelectField";
import { TransferFormValues } from "@/components/schemas/user/transfer.schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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

  const options = useMemo(() => {
    if (watchedType === "holder") {
      return staffs.map((s) => ({
        label: `${s.full_name} - (${s.staff_code})`,
        value: s.id,
      }));
    }
    return locations.map((l) => ({
      label: `${l.name} - (${l.code})`,
      value: l.id,
    }));
  }, [watchedType, staffs, locations]);

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
                    <span className="text-xs font-medium">
                      {t("form.personnel")}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="location"
                    className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {t("form.location")}
                    </span>
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

              <SelectField
                options={options}
                value={field.value as number}
                onChange={(val) => {
                  field.onChange(Number(val));
                  form.setValue("details", [{ asset_id: 0, quantity: 1 }]);
                }}
                placeholder={t("form.select_source_entity")}
              />

              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}
