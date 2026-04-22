"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

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
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { IPhysicalAsset } from "@/types/physical-asset";
import { IStaff } from "@/types/staff";
import { ITemplate } from "@/types/template";
import { ITransfer } from "@/types/transfer";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { getTodayISO } from "@/utils/date";

import { ApprovalProcessSection } from "./components/ApprovalProcessSection";
import { AssetSelectionSection } from "./components/AssetSelectionSection";
import { SourceInfoSection } from "./components/SourceInfoSection";
import { TargetDestinationSection } from "./components/TargetDestinationSection";

import { TransferSchema, type TransferFormValues } from "@/components/schemas/user/transfer.schema";

interface ITransferPayload {
  transfer_type: "holder" | "location";
  transfer_date: string;
  reason: string;
  external_link: string;
  attachments?: string[];
  items: Array<{
    asset_id: number;
    quantity: number;
    from_location_id: number | null;
  }>;
  workflow_assignments: Array<{
    step_id: number;
    user_id: number;
  }>;
  to_unit_id?: number;
  to_staff_id?: number;
  from_staff_id?: number;
  from_unit_id?: number;
  to_location_id?: number;
}

interface TransferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: unknown, method: string) => void;
  transferToEdit?: ITransfer | null;
}

export default function TransferFormModal({
  isOpen,
  onClose,
  onSuccess,
  transferToEdit,
}: TransferFormModalProps) {
  const isEditing = !!transferToEdit;
  const { mutate, pending } = useMutation();

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(TransferSchema),
    defaultValues: {
      source_type: "holder",
      source_id: 0,
      target_unit_id: null,
      target_id: null,
      location_id: null,
      approver_step_1_id: null,
      approver_step_2_id: null,
      transfer_date: getTodayISO(),
      external_link: "",
      reason: "",
      attachments: [],
      details: [{ asset_id: 0, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  // Fetch target options based on type
  const { response: staffRes } = useGet<{ items: IStaff[] }>({
    url: endpoints.STAFFS,
  });

  const { response: locRes } = useGet<ILocation[]>({
    url: endpoints.LOCATIONS,
  });

  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );
  const { response: activeTransferTemplate } = useGet<ITemplate>(
    { url: `${endpoints.TEMPLATE_ACTIVE}transfer` },
    { disabled: !isOpen },
  );

  const staffs = staffRes?.items || [];
  const locations = locRes || [];
  const users = userRes || [];

  const watchedType = useWatch({
    control: form.control,
    name: "source_type",
  });

  const sourceId = useWatch({
    control: form.control,
    name: "source_id",
  });

  const watchedDetails = useWatch({
    control: form.control,
    name: "details",
  });

  const hasSelectedAssets = watchedDetails?.some((d) => d && d.asset_id > 0);

  // Construct filtered asset URL
  const filterParam = watchedType === "holder" ? "staff_id" : "location_id";
  const assetUrl = sourceId
    ? `${endpoints.PHYSICAL_ASSETS}?${filterParam}=${sourceId}&limit=100`
    : "";

  const {
    response: assetRes,
    pending: assetsPending,
    reFetch: reFetchAssets,
  } = useGet<{ items: IPhysicalAsset[] }>(
    { url: assetUrl },
    { disabled: !sourceId, deps: [assetUrl] },
  );
  const assets = assetRes?.items || [];

  useEffect(() => {
    if (isOpen) {
      if (transferToEdit) {
        // Handle edit if needed
      } else {
        form.reset({
          source_type: "holder",
          source_id: 0,
          target_unit_id: null,
          target_id: null,
          location_id: null,
          approver_step_1_id: null,
          approver_step_2_id: null,
          transfer_date: getTodayISO(),
          external_link: "",
          reason: "",
          attachments: [],
          details: [{ asset_id: 0, quantity: 1 }],
        });
      }
    }
  }, [isOpen, transferToEdit, form]);

  useEffect(() => {
    form.setValue("required_steps", activeTransferTemplate?.steps?.length || 0);
  }, [activeTransferTemplate, form]);

  const onSubmit = async (data: TransferFormValues) => {
    const url = isEditing
      ? dynamicEndpoints.TRANSFER_DETAIL(transferToEdit.id)
      : endpoints.TRANSFERS;
    const method = isEditing ? "patch" : "post";

    // Transform data for backend based on working structure
    const transfer_type = data.source_type;

    // Construct base payload fields
    const payload: ITransferPayload = {
      transfer_type,
      transfer_date: data.transfer_date,
      reason: data.reason || "",
      external_link: data.external_link || "",
      attachments: data.attachments || [],
      items: data.details.map((item) => {
        // const assetObj = assets.find((a) => a.id === item.asset_id);
        const from_location_id =
          transfer_type === "location" ? data.source_id : null;
        return {
          asset_id: item.asset_id,
          quantity: item.quantity,
          from_location_id,
        };
      }),
      workflow_assignments: [],
    };

    // Specific fields based on transfer type
    if (transfer_type === "holder") {
      payload.to_staff_id = data.target_id || 0;
      payload.from_staff_id = data.source_id;
    } else if (transfer_type === "location") {
      payload.to_location_id = data.target_id || 0;
    }

    // Override location if geo location is specified
    if (data.location_id) {
      payload.to_location_id = data.location_id;
    }

    // Map workflow assignments
    if (
      activeTransferTemplate?.steps &&
      activeTransferTemplate.steps.length > 0
    ) {
      if (data.approver_step_1_id) {
        payload.workflow_assignments.push({
          step_id: activeTransferTemplate.steps[0].id,
          user_id: data.approver_step_1_id,
        });
      }
      if (activeTransferTemplate.steps.length > 1 && data.approver_step_2_id) {
        payload.workflow_assignments.push({
          step_id: activeTransferTemplate.steps[1].id,
          user_id: data.approver_step_2_id,
        });
      }
    }

    await mutate(
      {
        url,
        method,
        body: payload,
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
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
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? "Edit transfer" : "Create transfer"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modify the information of the selected asset transfer."
              : "Register a new asset transfer by specifying source, selection, and destination."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <SourceInfoSection
              form={form}
              staffs={staffs}
              locations={locations}
              watchedType={watchedType}
            />

            {sourceId > 0 && (
              <AssetSelectionSection
                form={form}
                fields={fields}
                append={append}
                remove={remove}
                assets={assets}
                watchedType={watchedType}
                assetsPending={assetsPending}
                reFetchAssets={reFetchAssets}
              />
            )}

            {hasSelectedAssets && (
              <TargetDestinationSection
                form={form}
                staffs={staffs}
                locations={locations}
                watchedType={watchedType}
              />
            )}

            {hasSelectedAssets && (
              <ApprovalProcessSection
                form={form}
                users={users}
                activeTransferTemplate={activeTransferTemplate ?? undefined}
              />
            )}
          </div>

          <DialogFooter className="p-3 shrink-0 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Processing..."
                : isEditing
                  ? "Save Changes"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
