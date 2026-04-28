"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Check,
  ChevronsUpDown,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { DatePickerField } from "@/components/common/DatePickerField";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { IOrgUnit } from "@/types/org";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

type AuditFormValues = {
  title: string;
  audit_type: "unit" | "location";
  unit_ids: number[];
  location_ids: number[];
  assignee_id: number | null;
  due_date: string;
};

interface AuditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuditFormModal({
  isOpen,
  onClose,
  onSuccess,
}: AuditFormModalProps) {
  const t = useTranslations("page_audits");

  const AuditSchema = z
    .object({
      title: z.string().min(1, t("form.title_required")),
      audit_type: z.enum(["unit", "location"]),
      unit_ids: z.array(z.number()),
      location_ids: z.array(z.number()),
      assignee_id: z.number().nullable(),
      due_date: z.string().min(1, t("form.due_date_required")),
    })
    .superRefine((data, ctx) => {
      if (data.audit_type === "unit" && data.unit_ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.unit_required"),
          path: ["unit_ids"],
        });
      }
      if (data.audit_type === "location" && data.location_ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.location_required"),
          path: ["location_ids"],
        });
      }
    });

  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [unitSearch, setUnitSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  const { response: locRes } = useGet<ILocation[]>(
    { url: endpoints.LOCATIONS },
    { disabled: !isOpen },
  );
  const { response: orgRes } = useGet<IOrgUnit[]>(
    { url: endpoints.ORG_UNITS },
    { disabled: !isOpen },
  );
  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );

  const locations = locRes || [];
  const orgUnits = orgRes || [];
  const users = userRes || [];

  const filteredUnits = orgUnits.filter((u: IOrgUnit) =>
    u.name.toLowerCase().includes(unitSearch.toLowerCase()),
  );
  const filteredLocations = locations.filter((l: ILocation) =>
    l.name.toLowerCase().includes(locationSearch.toLowerCase()),
  );

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(AuditSchema),
    defaultValues: {
      title: "",
      audit_type: "unit",
      unit_ids: [],
      location_ids: [],
      assignee_id: null,
      due_date: getTodayISO(),
    },
  });

  const { mutate, pending } = useMutation();

  const auditType = useWatch({ control: form.control, name: "audit_type" });
  const selectedUnitIds =
    useWatch({ control: form.control, name: "unit_ids" }) || [];
  const selectedLocationIds =
    useWatch({ control: form.control, name: "location_ids" }) || [];

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: "",
        audit_type: "unit",
        unit_ids: [],
        location_ids: [],
        assignee_id: null,
        due_date: getTodayISO(),
      });
    }
  }, [isOpen, form]);

  const toggleUnit = (id: number) => {
    const current = form.getValues("unit_ids") || [];
    form.setValue(
      "unit_ids",
      current.includes(id) ? current.filter((v: number) => v !== id) : [...current, id],
    );
  };

  const toggleLocation = (id: number) => {
    const current = form.getValues("location_ids") || [];
    form.setValue(
      "location_ids",
      current.includes(id) ? current.filter((v: number) => v !== id) : [...current, id],
    );
  };

  const onSubmit = async (data: AuditFormValues) => {
    const payload = {
      title: data.title,
      due_date: data.due_date ? `${data.due_date}T00:00:00.000Z` : null,
      ...(data.audit_type === "unit"
        ? { unit_ids: data.unit_ids }
        : { location_ids: data.location_ids }),
      ...(data.assignee_id ? { assignee_id: data.assignee_id } : {}),
    };

    await mutate(
      {
        url: endpoints.AUDIT_BATCH_START,
        method: "post",
        body: payload,
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
      <DialogContent className="sm:max-w-[560px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>{t("table.audit_batch_title")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("table.audit_batch_description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 space-y-6 overflow-y-auto">
            <div className="flex flex-col gap-1 mb-3">
              <FieldGroup className="grid grid-cols-2 gap-3">
                <Field className="col-span-2 gap-1">
                  <FieldLabel>
                    {t("form.title")}
                  </FieldLabel>
                  <Input
                    placeholder={t("table.enter_batch_title")}
                    {...form.register("title")}
                    className="bg-background rounded-md border-muted-foreground/20 shadow-sm"
                  />
                  <FieldError errors={[form.formState.errors.title]} />
                </Field>

                <Controller
                  name="audit_type"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="col-span-2 gap-1 mb-3">
                      <FieldLabel>
                        {t("form.audit_type")}
                      </FieldLabel>
                      <Tabs
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("unit_ids", []);
                          form.setValue("location_ids", []);
                        }}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2 h-16 p-1 bg-muted/30">
                          <TabsTrigger
                            value="unit"
                            className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm w-full"
                          >
                            <Building2 className="w-4 h-4" />
                            <span className="text-xs font-medium">{t("form.by_unit")}</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="location"
                            className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm w-full"
                          >
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              {t("form.by_location")}
                            </span>
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </Field>
                  )}
                />

                {/* Multi-select: Unit */}
                {auditType === "unit" && (
                  <Field className="col-span-2 gap-1">
                    <FieldLabel>
                      {t("filters.select_unit")}
                    </FieldLabel>
                    <DropdownMenu
                      open={unitDropdownOpen}
                      onOpenChange={setUnitDropdownOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="w-full px-3 py-2 flex items-center justify-between gap-2 bg-background rounded-md border border-muted-foreground/20 shadow-sm hover:border-primary/50 transition-colors text-left"
                        >
                          <div className="flex-1 flex flex-wrap gap-1.5 items-center overflow-hidden">
                            {selectedUnitIds.length === 0 ? (
                              <span className="text-sm text-muted-foreground">
                                {t("filters.select_unit")}
                              </span>
                            ) : (
                              selectedUnitIds.map((id: number) => {
                                const unit = orgUnits.find((u) => u.id === id);
                                return (
                                  <Badge
                                    key={id}
                                    variant="secondary"
                                    className="flex items-center gap-1 pr-1 text-xs whitespace-nowrap"
                                  >
                                    {unit?.name}
                                    <span
                                      role="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleUnit(id);
                                      }}
                                      className="ml-0.5 hover:text-destructive cursor-pointer"
                                    >
                                      <X size={10} />
                                    </span>
                                  </Badge>
                                );
                              })
                            )}
                          </div>
                          <ChevronsUpDown
                            size={16}
                            className="text-muted-foreground shrink-0"
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-[--radix-popper-anchor-width] min-w-[--radix-popper-anchor-width] p-0"
                        align="start"
                      >
                        <div className="p-2 border-b bg-muted/20">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder={t("filters.search_unit")}
                              value={unitSearch}
                              onChange={(e) => setUnitSearch(e.target.value)}
                              className="w-full pl-9 h-9 bg-background focus-visible:ring-1"
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                          {filteredUnits.length === 0 ? (
                            <div className="py-6 text-center text-xs text-muted-foreground">
                              {t("filters.no_unit_found")}
                            </div>
                          ) : (
                            filteredUnits.map((u) => (
                              <div
                                key={u.id}
                                className={`
                                  flex items-center gap-2.5 px-3 py-2.5 rounded-sm cursor-pointer transition-colors
                                  hover:bg-accent hover:text-accent-foreground
                                  ${selectedUnitIds.includes(u.id) ? "bg-accent/50" : ""}
                                `}
                                onClick={() => toggleUnit(u.id)}
                              >
                                <div className="p-1.5 rounded-md bg-primary/5 text-primary">
                                  <Building2 size={14} />
                                </div>
                                <span className="flex-1 text-sm font-medium leading-none">
                                  {u.name}
                                </span>
                                {selectedUnitIds.includes(u.id) && (
                                  <Check
                                    size={16}
                                    className="text-primary animate-in zoom-in-50 duration-200"
                                  />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FieldError
                      errors={[
                        form.formState.errors.unit_ids as
                          | { message?: string }
                          | undefined,
                      ]}
                    />
                  </Field>
                )}

                {/* Multi-select: Location */}
                {auditType === "location" && (
                  <Field className="col-span-2 gap-1">
                    <FieldLabel>
                      {t("filters.select_location")}
                    </FieldLabel>
                    <DropdownMenu
                      open={locationDropdownOpen}
                      onOpenChange={setLocationDropdownOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="w-full px-3 py-2 flex items-center justify-between gap-2 bg-background rounded-md border border-muted-foreground/20 shadow-sm hover:border-primary/50 transition-colors text-left"
                        >
                          <div className="flex-1 flex flex-wrap gap-1.5 items-center overflow-hidden">
                            {selectedLocationIds.length === 0 ? (
                              <span className="text-sm text-muted-foreground">
                                {t("filters.select_location")}
                              </span>
                            ) : (
                              selectedLocationIds.map((id) => {
                                const loc = locations.find((l) => l.id === id);
                                return (
                                  <Badge
                                    key={id}
                                    variant="secondary"
                                    className="flex items-center gap-1 pr-1 text-xs whitespace-nowrap"
                                  >
                                    {loc?.name}
                                    <span
                                      role="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLocation(id);
                                      }}
                                      className="ml-0.5 hover:text-destructive cursor-pointer"
                                    >
                                      <X size={10} />
                                    </span>
                                  </Badge>
                                );
                              })
                            )}
                          </div>
                          <ChevronsUpDown
                            size={16}
                            className="text-muted-foreground shrink-0"
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-[--radix-popper-anchor-width] min-w-[--radix-popper-anchor-width] p-0"
                        align="start"
                      >
                        <div className="p-2 border-b bg-muted/20">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder={t("filters.search_location")}
                              value={locationSearch}
                              onChange={(e) =>
                                setLocationSearch(e.target.value)
                              }
                              className="w-full pl-9 h-9 bg-background focus-visible:ring-1"
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                          {filteredLocations.length === 0 ? (
                            <div className="py-6 text-center text-xs text-muted-foreground">
                              {t("filters.no_location_found")}
                            </div>
                          ) : (
                            filteredLocations.map((l) => (
                              <div
                                key={l.id}
                                className={`
                                  flex items-center gap-2.5 px-3 py-2.5 rounded-sm cursor-pointer transition-colors
                                  hover:bg-accent hover:text-accent-foreground
                                  ${
                                    selectedLocationIds.includes(l.id)
                                      ? "bg-accent/50"
                                      : ""
                                  }
                                `}
                                onClick={() => toggleLocation(l.id)}
                              >
                                <div className="p-1.5 rounded-md bg-primary/5 text-primary">
                                  <MapPin size={14} />
                                </div>
                                <span className="flex-1 text-sm font-medium leading-none">
                                  {l.name}
                                </span>
                                {selectedLocationIds.includes(l.id) && (
                                  <Check
                                    size={16}
                                    className="text-primary animate-in zoom-in-50 duration-200"
                                  />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FieldError
                      errors={[
                        form.formState.errors.location_ids as
                          | { message?: string }
                          | undefined,
                      ]}
                    />
                  </Field>
                )}
              </FieldGroup>
            </div>

            {/* Section 2: Assignment & Deadline */}
            <div className="flex flex-col gap-1">
              <FieldGroup className="grid grid-cols-2 gap-3 items-end">
                {/* Assignee */}
                <Controller
                  name="assignee_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
                      <div className="flex flex-col gap-1 mb-1">
                        <FieldLabel>
                          {t("form.assignee")}
                        </FieldLabel>
                        <span className="text-[10px] text-muted-foreground/60 leading-none">
                          {t("table.assignment_leader")}
                        </span>
                      </div>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(val) =>
                          field.onChange(val === "none" ? null : Number(val))
                        }
                      >
                        <SelectTrigger className="bg-background rounded-md border-muted-foreground/20 shadow-sm">
                          <SelectValue placeholder={t("form.placeholder_assignee")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="none"
                            className="text-muted-foreground italic"
                          >
                            {t("form.none")}
                          </SelectItem>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id.toString()}>
                              {u.full_name} ({u.username})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="due_date"
                  render={({ fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>
                        {t("form.due_date")}
                      </FieldLabel>
                      <DatePickerField form={form} name="due_date" />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("form.creating") : t("form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
