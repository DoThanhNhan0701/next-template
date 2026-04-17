"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { endpoints, dynamicEndpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { useGet } from "@/hooks/useGet";
import { ILocation } from "@/types/location";
import { IPhysicalAsset } from "@/types/physical-asset";
import { IUser } from "@/types/auth";
import { ITemplate } from "@/types/template";
import { GeneralInfoSection } from "./components/GeneralInfoSection";
import { ServiceInfoSection } from "./components/ServiceInfoSection";
import { AssetSelectionSection } from "./components/AssetSelectionSection";
import { ApprovalProcessSection } from "./components/ApprovalProcessSection";
import { IMaintenance } from "@/types/maintenance";

const MaintenanceSchema = z.object({
  record_number: z.string().min(1, "Required"),
  ticket_number: z.string().min(1, "Required"),
  reason: z.string().min(1, "Required"),
  handover_person: z.string().min(1, "Required"),
  taker_person_name: z.string().min(1, "Required"),
  taker_phone: z.string().nullable(),
  service_provider_name: z.string().min(1, "Required"),
  service_provider_address: z.string().nullable(),
  notes: z.string().nullable(),
  expected_cost: z.number(),
  actual_cost: z.number(),
  external_link: z.string().nullable(),
  outing_date: z.string().min(1, "Required"),
  items: z.array(z.object({
    asset_id: z.number().min(1, "Required"),
    quantity: z.number().min(1, "Required"),
    notes: z.string().nullable(),
    from_location_id: z.number(),
    from_staff_id: z.number(),
    from_unit_id: z.number(),
    return_to_location_id: z.number().nullable(),
  })).min(1, "At least one item is required"),
  workflow_assignments: z.array(z.object({
    step_id: z.number(),
    user_id: z.number(),
  })),
});

export type MaintenanceFormValues = z.infer<typeof MaintenanceSchema>;

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
  const isEditing = !!maintenanceToEdit;
  const { mutate, pending } = useMutation();

  const form: UseFormReturn<MaintenanceFormValues> = useForm<MaintenanceFormValues>({
    resolver: zodResolver(MaintenanceSchema),
    defaultValues: {
      record_number: "",
      ticket_number: "",
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
      outing_date: new Date().toISOString().split("T")[0],
      items: [{ 
        asset_id: 0, 
        quantity: 1, 
        notes: null, 
        from_location_id: 0, 
        from_staff_id: 0, 
        from_unit_id: 0, 
        return_to_location_id: null 
      }],
      workflow_assignments: [],
    },
  });

  const { fields, append, remove } = useFieldArray<MaintenanceFormValues, "items">({
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

  const { response: assetRes, pending: assetsPending, reFetch: reFetchAssets } = useGet<{ items: IPhysicalAsset[] }>(
    { url: `${endpoints.PHYSICAL_ASSETS}?limit=1000` },
    { disabled: !isOpen }
  );

  const locations = locRes || [];
  const users = userRes || [];
  const assets = assetRes?.items || [];

  useEffect(() => {
    if (isOpen) {
      if (maintenanceToEdit) {
        // Handle edit mapping
      } else {
        form.reset({
          record_number: `BT${new Date().getFullYear()}${(Math.floor(Math.random() * 9000) + 1000)}`,
          ticket_number: `TKT-${(Math.floor(Math.random() * 90000) + 10000)}`,
          outing_date: new Date().toISOString().split("T")[0],
          items: [{ asset_id: 0, quantity: 1, notes: "" }],
        });
      }
    }
  }, [isOpen, maintenanceToEdit, form]);

  const onSubmit = async (data: MaintenanceFormValues) => {
    const url = isEditing
      ? dynamicEndpoints.MAINTENANCE_DETAIL(maintenanceToEdit.id)
      : endpoints.MAINTENANCES;
    const method = isEditing ? "patch" : "post";

    // Transform data for backend if needed
    const payload = {
      ...data,
      outing_date: new Date(data.outing_date).toISOString(),
      items: data.items.map(item => {
        const assetObj = assets.find(a => a.id === item.asset_id);
        return {
          ...item,
          from_location_id: assetObj?.location_id || 0,
          from_staff_id: assetObj?.staff_id || 0,
          from_unit_id: assetObj?.unit_id || 0,
          return_to_location_id: item.return_to_location_id || assetObj?.location_id || 0,
        };
      })
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
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <DialogTitle>
            {isEditing ? "Edit Maintenance" : "Create New Maintenance"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modify the information of the selected maintenance record."
              : "Register a new maintenance record by specifying details and selecting assets."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <GeneralInfoSection form={form} />
            <ServiceInfoSection form={form} />
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
            <ApprovalProcessSection 
              form={form} 
              users={users} 
              activeTemplate={activeTemplate ?? undefined} 
            />
          </div>

          <div className="p-4 border-t flex justify-end gap-3 shrink-0 bg-muted/10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="min-w-[120px]">
              {pending ? "Processing..." : isEditing ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
