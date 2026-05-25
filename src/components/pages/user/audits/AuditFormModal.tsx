"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, MapPin } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

import { ApprovalProcessSection } from "@/components/common/ApprovalProcessSection";
import { DatePickerField } from "@/components/common/DatePickerField";
import { SelectField } from "@/components/common/SelectField";
import { AuditCreateSchema } from "@/components/schemas/user/audit.schema";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { AppDispatch, RootState } from "@/redux";
import { updateCount } from "@/redux/slices/task";
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { IOrgUnit } from "@/types/org";
import { ITemplate } from "@/types/template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

type AuditFormValues = z.input<typeof AuditCreateSchema>;

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
  const tC = useTranslations("Common");

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

  const { response: activeAuditTemplate } = useGet<ITemplate>(
    { url: `${endpoints.TEMPLATE_ACTIVE}audit` },
    { disabled: !isOpen },
  );

  const locations = locRes || [];
  const orgUnits = orgRes || [];
  const users = userRes || [];

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(AuditCreateSchema),
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
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { counts } = useSelector((state: RootState) => state.task);

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
        approvals: {},
        required_steps: activeAuditTemplate?.steps?.length || 0,
      });
    }
  }, [isOpen, form, activeAuditTemplate]);

  useEffect(() => {
    if (activeAuditTemplate?.steps?.length) {
      form.setValue("required_steps", activeAuditTemplate.steps.length);
    }
  }, [activeAuditTemplate, form]);

  const onSubmit = async (data: AuditFormValues) => {
    const workflow_assignments: { step_id: number; user_id: number }[] = [];
    if (activeAuditTemplate?.steps?.length) {
      activeAuditTemplate.steps.forEach((step, idx) => {
        const userId = data.approvals?.[`step_${idx}`];
        if (userId && typeof userId === "number") {
          workflow_assignments.push({
            step_id: step.id,
            user_id: userId,
          });
        }
      });
    }

    const payloadCore = {
      title: data.title,
      due_date: data.due_date ? `${data.due_date}T00:00:00.000Z` : null,
      ...(data.audit_type === "unit"
        ? { unit_ids: data.unit_ids }
        : { location_ids: data.location_ids }),
      ...(data.assignee_id ? { assignee_id: data.assignee_id } : {}),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { approvals, required_steps, ...rest } = data;
    const payload = { ...rest, ...payloadCore, workflow_assignments };

    await mutate(
      {
        url: endpoints.AUDIT_BATCH_START,
        method: "post",
        body: payload,
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);

          // If the current user is the assignee, increment their PENDING task count
          if (data.assignee_id === currentUser?.id) {
            dispatch(
              updateCount({ status: "PENDING", count: counts.PENDING + 1 }),
            );
          }

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
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field className="col-span-full gap-1">
                  <FieldLabel>{t("form.title")}</FieldLabel>
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
                    <Field className="col-span-full gap-1 mb-3">
                      <FieldLabel>{t("form.audit_type")}</FieldLabel>
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
                            <span className="text-xs font-medium">
                              {t("form.by_unit")}
                            </span>
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
                  <Field className="col-span-full gap-1">
                    <FieldLabel>{t("filters.select_unit")}</FieldLabel>
                    <SelectField
                      multiple
                      options={orgUnits.map((unit) => ({
                        label: `${unit.name} - (${unit.code})`,
                        value: unit.id,
                      }))}
                      value={selectedUnitIds}
                      onChange={(nextVal) =>
                        form.setValue("unit_ids", nextVal, {
                          shouldValidate: true,
                        })
                      }
                      placeholder={t("filters.select_unit")}
                    />

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
                  <Field className="col-span-full gap-1">
                    <FieldLabel>{t("filters.select_location")}</FieldLabel>
                    <SelectField
                      multiple
                      options={locations.map((loc) => ({
                        label: `${loc.name} - (${loc.code})`,
                        value: loc.id,
                      }))}
                      value={selectedLocationIds}
                      onChange={(nextVal) =>
                        form.setValue("location_ids", nextVal, {
                          shouldValidate: true,
                        })
                      }
                      placeholder={t("filters.select_location")}
                    />
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
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                {/* Assignee */}
                <Controller
                  name="assignee_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
                      <div className="flex flex-col gap-1 mb-1">
                        <FieldLabel>{t("form.assignee")}</FieldLabel>
                        <span className="text-[10px] text-muted-foreground/60 leading-none">
                          {t("table.assignment_leader")}
                        </span>
                      </div>
                      <SelectField
                        options={(users ?? []).map((a) => ({
                          label: `${a.full_name} - (${a.username})`,
                          value: a.id,
                        }))}
                        value={field.value as number}
                        onChange={(val) => field.onChange(Number(val))}
                        placeholder={t("form.placeholder_assignee")}
                      />

                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="due_date"
                  render={({ fieldState }) => (
                    <Field className="gap-1">
                      <FieldLabel>{t("form.due_date")}</FieldLabel>
                      <DatePickerField form={form} name="due_date" />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </FieldGroup>

              <ApprovalProcessSection
                className="gap-1 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-muted-foreground mt-3"
                title={tC("approval_process")}
                control={form.control}
                steps={activeAuditTemplate?.steps || []}
                users={users}
              />
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
