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
    if (isOpen) {
      const defaultApprovals: Record<string, number | null> = {};
      activeTemplate?.steps?.forEach((step, idx) => {
        defaultApprovals[`step_${idx}`] = step.default_assignee_user_id ?? null;
      });

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
        approvals: defaultApprovals,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-212.5 h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl gap-0">
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
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
            {/* General Info & Attachments */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                <ClipboardList size={16} className="text-primary" />
                {t("tab_general")}
              </h3>
              <GeneralInfoSection form={form} />
              <FormAttachmentsSection
                control={form.control}
                title={t("attachments")}
              />
            </div>

            {/* Asset Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                <Package size={16} className="text-primary" />
                {t("tab_assets")}
              </h3>
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

            {/* Service Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                <Wrench size={16} className="text-primary" />
                {t("tab_service")}
              </h3>
              <ServiceInfoSection form={form} />
            </div>

            {/* Approval Process */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                <UserCheck size={16} className="text-primary" />
                {t("tab_approval")}
              </h3>
              <ApprovalProcessSection
                control={form.control}
                steps={activeTemplate?.steps || []}
                users={users}
                title={null}
                showStepNumber={true}
              />
            </div>
          </div>

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
