"use client";

import { ArrowRightCircle, Building2, MapPin } from "lucide-react";
import { UseFormReturn, Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TransferFormValues, IStaff } from "../TransferFormModal";
import { IOrgUnit } from "@/types/org";
import { ILocation } from "@/types/location";

interface TargetDestinationSectionProps {
  form: UseFormReturn<TransferFormValues>;
  staffs: IStaff[];
  orgs: IOrgUnit[];
  locations: ILocation[];
  watchedType: "holder" | "unit" | "location";
  watchedTargetUnitId: number | null | undefined;
}

export function TargetDestinationSection({
  form,
  staffs,
  orgs,
  locations,
  watchedType,
  watchedTargetUnitId,
}: TargetDestinationSectionProps) {
  return (
    <div className="flex flex-col gap-3 pt-4 border-t">
      <h3 className="text-sm font-semibold text-primary pb-2 flex items-center gap-2 tracking-tight">
        <ArrowRightCircle className="w-5 h-5" />
        <span>3. Target Destination</span>
      </h3>

      <div className="bg-muted/20 border rounded-md p-6 space-y-6">
        {watchedType === "holder" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <Controller
              name="target_unit_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest ">
                    Step 1: Select unit for filtering
                  </FieldLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(Number(val));
                      form.setValue("target_id", null);
                    }}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <SelectTrigger className="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm">
                      <SelectValue placeholder="Select target unit..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {orgs.map((o) => (
                        <SelectItem
                          key={`target-unit-filter-${o.id}`}
                          value={o.id.toString()}
                        >
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="target_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest">
                    Step 2: Select specific personnel
                  </FieldLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? field.value.toString() : ""}
                    disabled={!watchedTargetUnitId}
                  >
                    <SelectTrigger className="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm">
                      <SelectValue
                        placeholder={
                          watchedTargetUnitId
                            ? "Select specific personnel..."
                            : "Select unit first..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {staffs
                        .filter((s) => s.unit_id === watchedTargetUnitId)
                        .map((s) => (
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

        {watchedType === "unit" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <Controller
              name="target_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest">
                    Select new target unit
                  </FieldLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <SelectTrigger className="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Select target unit..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {orgs.map((o) => (
                        <SelectItem
                          key={`target-unit-direct-${o.id}`}
                          value={o.id.toString()}
                        >
                          {o.name}
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
                <Field>
                  <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest">
                    Select new target location / warehouse
                  </FieldLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <SelectTrigger className="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm">
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
            <Field>
              <FieldLabel className="text-[11px] font-bold text-primary tracking-wider">
                New geographical location (optional)
              </FieldLabel>
              <Select
                onValueChange={(val) =>
                  field.onChange(val === "none" ? null : Number(val))
                }
                value={field.value ? field.value.toString() : "none"}
              >
                <SelectTrigger className="h-12 bg-white rounded-md border-muted-foreground/20 shadow-sm transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/50">
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

      <div className="grid grid-cols-3 gap-4">
        <Controller
          name="transfer_date"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel className="text-[10px] font-bold text-muted-foreground">
                Transfer Date
              </FieldLabel>
              <Input
                type="date"
                {...field}
                className="h-12 bg-white rounded-md border-muted-foreground/20"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="external_link"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="col-span-2">
              <FieldLabel className="text-[10px] font-bold text-muted-foreground">
                External Link (Jira/Helpdesk)
              </FieldLabel>
              <Input
                placeholder="https://..."
                {...field}
                value={field.value || ""}
                className="h-12 bg-white rounded-md border-muted-foreground/20"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="col-span-3">
              <FieldLabel className="text-[10px] font-bold text-muted-foreground">
                Reason & Internal Notes
              </FieldLabel>
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
    </div>
  );
}
