"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Package, UserCheck, Wrench } from "lucide-react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import { ApprovalProcessSection } from "@/components/common/ApprovalProcessSection";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import {
  GetMaintenanceSchema,
  type MaintenanceFormValues,
} from "@/components/schemas/user/maintenance.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { AppDispatch, RootState } from "@/redux";
import { updateCount } from "@/redux/slices/task";
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { IMaintenance } from "@/types/maintenance";
import { IPhysicalAsset } from "@/types/physical-asset";
import { ITemplate } from "@/types/template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

import { AssetSelectionSection } from "./components/AssetSelectionSection";
import { GeneralInfoSection } from "./components/GeneralInfoSection";
import { ServiceInfoSection } from "./components/ServiceInfoSection";

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: unknown, method: string) => void;
  maintenanceToEdit?: IMaintenance | null;
}

export default function MaintenanceFormModal({
  isOpen,
  onClose,
  onSuccess,
  maintenanceToEdit,
}: MaintenanceFormModalProps) {
  const t = useTranslations("page_maintenance.form");
  const isEditing = !!maintenanceToEdit;
  const { mutate, pending } = useMutation();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { counts } = useSelector((state: RootState) => state.task);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(
      GetMaintenanceSchema(t),
    ) as Resolver<MaintenanceFormValues>,
    defaultValues: {
      record_number: "",
      reason: "",
      handover_person: "",
      taker_person_name: "",
      taker_phone: null,
      service_provider_name: "",
      service_provider_address: null,
      notes: null,
      expected_cost: 0,
      actual_cost: 0,
      external_link: null,
      outing_date: getTodayISO(),
      items: [
        {
          asset_id: 0,
          quantity: 1,
          notes: null,
          from_location_id: 0,
          from_staff_id: 0,
          from_unit_id: 0,
          return_to_location_id: null,
        },
      ],
      attachments: [],
      approvals: {},
      required_steps: 0,
      workflow_assignments: [],
    },
  });

  const { fields, append, remove } = useFieldArray<
    MaintenanceFormValues,
    "items"
  >({
    control: form.control,
    name: "items",
  });

  const { response: locRes } = useGet<ILocation[]>({
    url: endpoints.LOCATIONS,
  });

  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );

  const { response: activeTemplate } = useGet<ITemplate>(
    { url: `${endpoints.TEMPLATE_ACTIVE}maintenance` },
    { disabled: !isOpen },
  );

  const {
    response: assetRes,
    pending: assetsPending,
    reFetch: reFetchAssets,
  } = useGet<{ items: IPhysicalAsset[] }>(
    { url: `${endpoints.PHYSICAL_ASSETS}?limit=1000` },
    { disabled: !isOpen },
  );

  const locations = locRes || [];
  const users = userRes || [];
  const assets = assetRes?.items || [];

  useEffect(() => {
    if (!isOpen) return;

    if (maintenanceToEdit) {
      const initialApprovals: Record<string, number> = {};
      if (maintenanceToEdit.workflow_assignments) {
        maintenanceToEdit.workflow_assignments.forEach((assignment, index) => {
          initialApprovals[`step_${index}`] = assignment.user_id;
        });
      }

      form.reset({
        record_number: maintenanceToEdit.record_number || "",
        reason: maintenanceToEdit.reason || "",
        handover_person: maintenanceToEdit.handover_person || "",
        taker_person_name: maintenanceToEdit.taker_person_name || "",
        taker_phone: maintenanceToEdit.taker_phone,
        service_provider_name: maintenanceToEdit.service_provider_name || "",
        service_provider_address: maintenanceToEdit.service_provider_address,
        notes: maintenanceToEdit.notes,
        expected_cost: maintenanceToEdit.expected_cost || 0,
        actual_cost: maintenanceToEdit.actual_cost || 0,
        external_link: maintenanceToEdit.external_link,
        outing_date: maintenanceToEdit.outing_date
          ? new Date(maintenanceToEdit.outing_date).toISOString().split("T")[0]
          : getTodayISO(),
        items:
          maintenanceToEdit.items?.map((item) => ({
            asset_id: item.asset_id,
            quantity: item.quantity,
            notes: item.notes,
            from_location_id: item.from_location_id,
            from_staff_id: item.from_staff_id,
            from_unit_id: item.from_unit_id,
            return_to_location_id: item.return_to_location_id,
          })) || [],
        attachments: maintenanceToEdit.attachments || [],
        approvals: initialApprovals,
        required_steps: activeTemplate?.steps?.length || 0,
        workflow_assignments: [],
      });
    } else {
      form.reset({
        record_number: "",
        reason: "",
        handover_person: "",
        taker_person_name: "",
        taker_phone: null,
        service_provider_name: "",
        service_provider_address: null,
        notes: null,
        expected_cost: 0,
        actual_cost: 0,
        external_link: null,
        outing_date: getTodayISO(),
        items: [
          {
            asset_id: 0,
            quantity: 1,
            notes: null,
            from_location_id: 0,
            from_staff_id: 0,
            from_unit_id: 0,
            return_to_location_id: null,
          },
        ],
        attachments: [],
        approvals: {},
        required_steps: activeTemplate?.steps?.length || 0,
        workflow_assignments: [],
      });
    }
  }, [isOpen, maintenanceToEdit, form, activeTemplate]);

  const onSubmit = async (data: MaintenanceFormValues) => {
    const url = isEditing
      ? dynamicEndpoints.MAINTENANCE_DETAIL(maintenanceToEdit.id)
      : endpoints.MAINTENANCES;
    const method = isEditing ? "patch" : "post";

    const workflow_assignments: { step_id: number; user_id: number }[] = [];
    if (activeTemplate?.steps?.length) {
      activeTemplate.steps.forEach((step, idx) => {
        const userId = data.approvals[`step_${idx}`];
        if (userId && typeof userId === "number") {
          workflow_assignments.push({
            step_id: step.id,
            user_id: userId,
          });
        }
      });
    }

    // Construct the payload to match API expectations
    const payload = {
      reason: data.reason,
      handover_person: data.handover_person,
      taker_person_name: data.taker_person_name,
      taker_phone: data.taker_phone,
      service_provider_name: data.service_provider_name,
      service_provider_address: data.service_provider_address,
      notes: data.notes,
      expected_cost: data.expected_cost,
      actual_cost: isEditing ? data.actual_cost : undefined,
      external_link: data.external_link,
      outing_date: data.outing_date, // Already in YYYY-MM-DD from form reset/default
      attachments: data.attachments || [],
      items: data.items.map((item) => ({
        asset_id: item.asset_id,
        quantity: item.quantity,
        notes: item.notes,
      })),
      workflow_assignments,
    };

    const finalPayload = {
      ...payload,
      ...(data.record_number ? { record_number: data.record_number } : {}),
    };

    await mutate(
      {
        url,
        method,
        body: finalPayload,
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);

          // If the current user is the first-step approver, increment their PENDING task count
          const isCurrentUserApprover =
            workflow_assignments[0]?.user_id === currentUser?.id;
          if (isCurrentUserApprover) {
            dispatch(
              updateCount({ status: "PENDING", count: counts.PENDING + 1 }),
            );
          }

          onSuccess(res, method);
          onClose();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  const errors = form.formState.errors;

  const hasAssetsErrors = !!errors.items;
  const hasGeneralErrors = !!(
    errors.record_number ||
    errors.reason ||
    errors.outing_date ||
    errors.handover_person ||
    errors.notes ||
    errors.external_link
  );
  const hasServiceErrors = !!(
    errors.taker_person_name ||
    errors.taker_phone ||
    errors.service_provider_name ||
    errors.service_provider_address ||
    errors.expected_cost ||
    errors.actual_cost
  );
  const hasApprovalErrors = !!(errors.workflow_assignments || errors.approvals);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-212.5 h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? t("edit_title") : t("create_title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing ? t("edit_description") : t("create_description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <Tabs
            defaultValue="assets"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-4 pb-4">
              <TabsList className="grid w-full grid-cols-4 h-16 p-1 bg-muted/30 z-10">
                <TabsTrigger
                  value="assets"
                  className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs font-medium relative"
                >
                  <Package size={16} /> {t("tab_assets")}
                  {hasAssetsErrors && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="general"
                  className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs font-medium relative"
                >
                  <ClipboardList size={16} /> {t("tab_general")}
                  {hasGeneralErrors && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="service"
                  className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs font-medium relative"
                >
                  <Wrench size={16} /> {t("tab_service")}
                  {hasServiceErrors && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="approval"
                  className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs font-medium relative"
                >
                  <UserCheck size={16} /> {t("tab_approval")}
                  {hasApprovalErrors && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              <TabsContent
                value="general"
                className="mt-0 outline-none animate-in fade-in slide-in-from-left-2 duration-300 space-y-4"
              >
                <GeneralInfoSection form={form} />
                <FormAttachmentsSection
                  control={form.control}
                  title={t("attachments")}
                />
              </TabsContent>
              <TabsContent
                value="service"
                className="mt-0 outline-none animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <ServiceInfoSection form={form} />
              </TabsContent>
              <TabsContent
                value="assets"
                className="mt-0 outline-none animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <div className="space-y-4">
                  <AssetSelectionSection
                    form={form}
                    fields={fields}
                    append={append}
                    remove={remove}
                    assets={assets}
                    assetsPending={assetsPending}
                    reFetchAssets={reFetchAssets}
                    locations={locations}
                  />
                </div>
              </TabsContent>
              <TabsContent
                value="approval"
                className="mt-0 outline-none animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <ApprovalProcessSection
                  control={form.control}
                  steps={activeTemplate?.steps || []}
                  users={users}
                  title={null}
                  useApproverSelect={false}
                  showStepNumber={true}
                  fallbackMessage={t("approval_workflow_fallback")}
                />
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? t("creating")
                : isEditing
                  ? t("save_changes")
                  : t("confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
