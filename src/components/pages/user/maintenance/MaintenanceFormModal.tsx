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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Wrench, Package, UserCheck } from "lucide-react";
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
  items: z
    .array(
      z.object({
        asset_id: z.number().min(1, "Required"),
        quantity: z.number().min(1, "Required"),
        notes: z.string().nullable(),
        from_location_id: z.number(),
        from_staff_id: z.number(),
        from_unit_id: z.number(),
        return_to_location_id: z.number().nullable(),
      }),
    )
    .min(1, "At least one item is required"),
  workflow_assignments: z.array(
    z.object({
      step_id: z.number(),
      user_id: z.number(),
    }),
  ),
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

  const form: UseFormReturn<MaintenanceFormValues> =
    useForm<MaintenanceFormValues>({
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
      if (maintenanceToEdit) {
        // Handle edit mapping
      } else {
        form.reset({
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
          items: [
            {
              asset_id: 0,
              quantity: 1,
              notes: "",
              from_location_id: 0,
              from_staff_id: 0,
              from_unit_id: 0,
              return_to_location_id: null,
            },
          ],
          workflow_assignments: [],
        });
      }
    }
  }, [isOpen, maintenanceToEdit, form]);

  const onSubmit = async (data: MaintenanceFormValues) => {
    console.log(data);
    const url = isEditing
      ? dynamicEndpoints.MAINTENANCE_DETAIL(maintenanceToEdit.id)
      : endpoints.MAINTENANCES;
    const method = isEditing ? "patch" : "post";

    // Transform data for backend if needed
    const payload = {
      ...data,
      outing_date: new Date(data.outing_date).toISOString(),
      items: data.items.map((item) => {
        const assetObj = assets.find((a) => a.id === item.asset_id);
        return {
          ...item,
          from_location_id: assetObj?.location_id || 0,
          from_staff_id: assetObj?.staff_id || 0,
          from_unit_id: assetObj?.unit_id || 0,
          return_to_location_id:
            item.return_to_location_id || assetObj?.location_id || 0,
        };
      }),
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

  console.log(activeTemplate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 pb-6 shrink-0 border-b">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wrench className="text-primary" size={20} />
            </div>
            <DialogTitle className="text-2xl font-bold text-primary tracking-tight">
              {isEditing
                ? "Edit maintenance record"
                : "Create maintenance record"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground ml-11">
            {isEditing
              ? "Update the maintenance details and asset allocations."
              : "Register a new maintenance record with detailed tracking and approval workflow."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit, (err) =>
            console.error("Validation Errors:", err),
          )}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <Tabs
            defaultValue="general"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-4 pb-4">
              <TabsList className="grid w-full grid-cols-4 h-16 p-1 bg-muted/30 z-10">
                <TabsTrigger
                  value="general"
                  className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs font-medium"
                >
                  <ClipboardList size={16} /> Thông tin chung
                </TabsTrigger>
                <TabsTrigger
                  value="service"
                  className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs font-medium"
                >
                  <Wrench size={16} /> Dịch vụ sửa chữa
                </TabsTrigger>
                <TabsTrigger
                  value="assets"
                  className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs font-medium"
                >
                  <Package size={16} /> Lựa chọn tài sản
                </TabsTrigger>
                <TabsTrigger
                  value="approval"
                  className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs font-medium"
                >
                  <UserCheck size={16} /> Quy trình phê duyệt
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              <TabsContent
                value="general"
                className="mt-0 outline-none animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <GeneralInfoSection form={form} />
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
                  form={form}
                  users={users}
                  activeTemplate={activeTemplate ?? undefined}
                />
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-6 border-t flex justify-end gap-3 shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
