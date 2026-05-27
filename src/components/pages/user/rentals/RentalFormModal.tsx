"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

import { ApprovalProcessSection } from "@/components/common/ApprovalProcessSection";
import { FormAttachmentsSection } from "@/components/common/FormAttachmentsSection";
import { RentalCreateSchema } from "@/components/schemas/user/rental.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { AppDispatch, RootState } from "@/redux";
import { closeRental } from "@/redux/slices/rental";
import { updateCount } from "@/redux/slices/task";
import { IUser } from "@/types/auth";
import { ICustomer } from "@/types/customer";
import { ILocation } from "@/types/location";
import { IOrgUnit } from "@/types/org";
import { ITemplate } from "@/types/template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

import { GeneralInfoSection } from "./components/GeneralInfoSection";
import { RentalAssetsSection } from "./components/RentalAssetsSection";

type RentalFormValues = z.input<typeof RentalCreateSchema>;

/* ───── Main modal ───── */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RentalFormModal({ isOpen, onClose, onSuccess }: Props) {
  const t = useTranslations("page_rentals");
  const { mutate, pending } = useMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { prefill } = useSelector((state: RootState) => state.rental);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { counts } = useSelector((state: RootState) => state.task);

  const handleClose = () => {
    dispatch(closeRental());
    onClose();
  };

  const form = useForm<RentalFormValues>({
    resolver: zodResolver(RentalCreateSchema),
    defaultValues: {
      unit_id: 0,
      customer_id: 0,
      lease_date: getTodayISO(),
      duration_days: 1,
      reason: "",
      total_revenue: 0,
      contract_number: "",
      notes: "",
      external_link: "",
      attachments: [],
      items: [],
    },
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    const total = (watchedItems || []).reduce(
      (sum, item) => sum + (Number(item?.rental_revenue) || 0),
      0,
    );
    form.setValue("total_revenue", total);
  }, [watchedItems, form]);

  const { response: orgRes } = useGet<IOrgUnit[]>(
    { url: endpoints.ORG_UNITS },
    { disabled: !isOpen },
  );
  const { response: cusRes } = useGet<{ data: ICustomer[] }>(
    { url: endpoints.CUSTOMERS },
    { disabled: !isOpen },
  );
  const { response: locationRes } = useGet<ILocation[]>(
    { url: endpoints.LOCATIONS },
    { disabled: !isOpen },
  );

  const { response: activeRentalTemplate } = useGet<ITemplate>({
    url: `${endpoints.TEMPLATE_ACTIVE}rental`,
  });
  const { response: userRes } = useGet<IUser[]>({ url: endpoints.USERS });

  const orgUnits = orgRes || [];
  const customers = cusRes?.data || [];
  const locations = locationRes || [];
  const users = userRes || [];

  useEffect(() => {
    if (isOpen) {
      const defaultApprovals: Record<string, number | null> = {};
      activeRentalTemplate?.steps?.forEach((step, idx) => {
        defaultApprovals[`step_${idx}`] = step.default_assignee_user_id ?? null;
      });

      form.reset({
        unit_id: prefill?.unit_id ?? 0,
        customer_id: 0,
        lease_date: getTodayISO(),
        duration_days: 30,
        reason: prefill?.reason ?? "",
        total_revenue: 0,
        contract_number: "",
        notes: "",
        external_link: "",
        attachments: [],
        approvals: defaultApprovals,
        required_steps: activeRentalTemplate?.steps?.length || 0,
        items: [
          {
            asset_id: prefill?.asset_id ?? 0,
            quantity: 1,
            from_location_id: prefill?.location_id ?? 0,
            rental_revenue: 0,
            lessee_location: "",
          },
        ],
      });
    }
  }, [isOpen, prefill, form, activeRentalTemplate]);

  useEffect(() => {
    if (activeRentalTemplate?.steps?.length) {
      form.setValue("required_steps", activeRentalTemplate.steps.length);
    }
  }, [activeRentalTemplate, form]);

  const onSubmit = async (data: RentalFormValues) => {
    const workflow_assignments: { step_id: number; user_id: number }[] = [];
    if (activeRentalTemplate?.steps?.length) {
      activeRentalTemplate.steps.forEach((step, idx) => {
        const userId = data.approvals?.[`step_${idx}`];
        if (userId && typeof userId === "number") {
          workflow_assignments.push({
            step_id: step.id,
            user_id: userId,
          });
        }
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { approvals, required_steps, ...rest } = data;
    const payload = {
      ...rest,
      attachments: data.attachments || [],
      workflow_assignments,
    };

    await mutate(
      { url: endpoints.RENTALS, method: "post", body: payload },
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

          onSuccess();
          handleClose();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>{t("form.create_title")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("form.create_description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <div className="flex flex-col gap-3">
              <GeneralInfoSection
                form={form}
                orgUnits={orgUnits}
                customers={customers}
              />

              <RentalAssetsSection
                control={form.control}
                setValue={form.setValue}
                locations={locations}
              />

              <FormAttachmentsSection
                control={form.control}
                title={t("form.attachments")}
              />

              <ApprovalProcessSection
                className="[&_h3]:border-b [&_h3]:pb-1"
                control={form.control}
                steps={activeRentalTemplate?.steps || []}
                users={users}
                title={t("form.approval_process")}
              />
            </div>
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("form.saving") : t("form.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
