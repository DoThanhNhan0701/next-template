"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Package, UserCheck } from "lucide-react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "next-intl";

import { ApprovalProcessSection } from "@/components/common/ApprovalProcessSection";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import {
  LiquidationFormValues,
  GetLiquidationSchema,
} from "@/components/schemas/user/liquidation.schema";
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
import { ILiquidationFull } from "@/types/liquidation";
import { ILocation } from "@/types/location";
import { IStaff } from "@/types/staff";
import { ITemplate } from "@/types/template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

import { GeneralLiquidationSection } from "./components/GeneralLiquidationSection";
import { LiquidationAssetSelectionSection } from "./components/LiquidationAssetSelectionSection";

interface LiquidationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: unknown, method: string) => void;
  liquidationToEdit?: ILiquidationFull | null;
}

export default function LiquidationFormModal({
  isOpen,
  onClose,
  onSuccess,
  liquidationToEdit,
}: LiquidationFormModalProps) {
  const t = useTranslations("page_liquidations.form");
  const isEditing = !!liquidationToEdit;
  const { mutate, pending } = useMutation();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { counts } = useSelector((state: RootState) => state.task);

  const form = useForm<LiquidationFormValues>({
    resolver: zodResolver(GetLiquidationSchema(t)) as Resolver<
      LiquidationFormValues
    >,
    defaultValues: {
      record_number: "",
      reason: "",
      notes: null,
      liquidation_date: getTodayISO(),
      liquidation_type: "sell",
      committee: [],
      total_value: 0,
      buyer_name: null,
      external_link: null,
      attachments: [],
      items: [
        {
          asset_id: 0,
          quantity: 1,
          unit_value: 0,
          remaining_value: 0,
          notes: null,
          from_location_id: 0,
          from_staff_id: 0,
          from_unit_id: 0,
        },
      ],
      workflow_assignments: [],
      required_steps: 0,
      approvals: {},
    },
  });

  const { fields, append, remove } = useFieldArray<
    LiquidationFormValues,
    "items"
  >({
    control: form.control,
    name: "items",
  });

  const { response: userStaffRes } = useGet<{ items: IStaff[] }>(
    { url: endpoints.STAFFS },
    { disabled: !isOpen },
  );

  const { response: usersRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );

  const { response: activeTemplate } = useGet<ITemplate>(
    { url: `${endpoints.TEMPLATE_ACTIVE}liquidation` },
    { disabled: !isOpen },
  );

  const { response: locationRes } = useGet<ILocation[]>(
    { url: `${endpoints.LOCATIONS}?limit=1000` },
    { disabled: !isOpen },
  );

  const staffs = userStaffRes?.items || [];
  const locations = locationRes || [];
  const users = usersRes || [];

  useEffect(() => {
    if (isOpen) {
      form.reset({
        record_number: "",
        reason: "",
        notes: null,
        liquidation_date: getTodayISO(),
        liquidation_type: "sell",
        committee: [],
        total_value: 0,
        buyer_name: null,
        external_link: null,
        attachments: [],
        items: [
          {
            asset_id: 0,
            quantity: 1,
            unit_value: 0,
            remaining_value: 0,
            notes: null,
            from_location_id: 0,
            from_staff_id: 0,
            from_unit_id: 0,
          },
        ],
        approvals: {},
        required_steps: activeTemplate?.steps?.length || 0,
      });
    }
  }, [isOpen, liquidationToEdit, form, activeTemplate]);

  useEffect(() => {
    if (activeTemplate?.steps?.length) {
      form.setValue("required_steps", activeTemplate.steps.length);
    }
  }, [activeTemplate, form]);

  const onSubmit = async (data: LiquidationFormValues) => {
    const url = isEditing
      ? dynamicEndpoints.LIQUIDATION_DETAIL(liquidationToEdit!.id)
      : endpoints.LIQUIDATIONS;
    const method = isEditing ? "patch" : "post";

    // Map committee IDs to staff full names
    const committeeNames = data.committee
      .map((id) => staffs.find((s) => s.id === id)?.full_name)
      .filter(Boolean)
      .join(", ");

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

    // Clean items
    const cleanedItems = data.items.map((item) => ({
      asset_id: item.asset_id,
      quantity: item.quantity,
      unit_value: item.unit_value,
      remaining_value: item.remaining_value,
      notes: item.notes,
      from_location_id: item.from_location_id,
    }));

    const payload = {
      liquidation_date: data.liquidation_date,
      liquidation_type: data.liquidation_type,
      reason: data.reason,
      total_value: data.total_value,
      buyer_name: data.buyer_name,
      notes: data.notes,
      external_link: data.external_link,
      attachments: data.attachments || [],
      items: cleanedItems,
      committee: committeeNames,
      workflow_assignments,
    };

    await mutate(
      {
        url,
        method,
        body: payload,
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
  const hasGeneralErrors = !!(
    errors.record_number ||
    errors.reason ||
    errors.liquidation_date ||
    errors.liquidation_type ||
    errors.committee ||
    errors.total_value ||
    errors.buyer_name ||
    errors.external_link ||
    errors.notes
  );
  const hasAssetsErrors = !!errors.items;
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
              <TabsList className="grid w-full grid-cols-3 h-14 sm:h-16 p-1 bg-muted/30 z-10">
                <TabsTrigger
                  value="assets"
                  className="flex flex-col items-center justify-center gap-1 h-full font-medium text-xs relative"
                >
                  <Package size={16} />
                  <span className="hidden sm:block">{t("tab_assets")}</span>
                  {hasAssetsErrors && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="general"
                  className="flex flex-col items-center justify-center gap-1 h-full font-medium text-xs relative"
                >
                  <ClipboardList size={16} />
                  <span className="hidden sm:block">{t("tab_general")}</span>
                  {hasGeneralErrors && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="approval"
                  className="flex flex-col items-center justify-center gap-1 h-full font-medium text-xs relative"
                >
                  <UserCheck size={16} />
                  <span className="hidden sm:block">{t("tab_approval")}</span>
                  {hasApprovalErrors && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              <TabsContent
                value="general"
                className="focus-visible:outline-none flex flex-col gap-3"
              >
                <GeneralLiquidationSection
                  form={form}
                  users={staffs}
                />
                <FormAttachmentsSection
                  control={form.control}
                  title={t("attachments")}
                />
              </TabsContent>
              <TabsContent value="assets" className="mt-0 outline-none">
                <LiquidationAssetSelectionSection
                  form={form}
                  fields={fields}
                  append={append}
                  remove={remove}
                  locations={locations}
                />
              </TabsContent>
              <TabsContent value="approval" className="mt-0 outline-none">
                <ApprovalProcessSection
                  control={form.control}
                  steps={activeTemplate?.steps || []}
                  users={users}
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
                ? t("processing")
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
