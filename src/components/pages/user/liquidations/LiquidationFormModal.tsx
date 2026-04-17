"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  Trash2,
  Package,
  UserCheck,
} from "lucide-react";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { endpoints, dynamicEndpoints } from "@/config/endpoints";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { ILocation } from "@/types/location";
import { IUser } from "@/types/auth";
import { ITemplate } from "@/types/template";
import { GeneralLiquidationSection } from "./components/GeneralLiquidationSection";
import { LiquidationAssetSelectionSection } from "./components/LiquidationAssetSelectionSection";
import { LiquidationApprovalSection } from "./components/LiquidationApprovalSection";
import { ILiquidation } from "@/types/liquidation";
import { LiquidationSchema, LiquidationFormValues } from "./schema";

interface LiquidationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: unknown, method: string) => void;
  liquidationToEdit?: ILiquidation | null;
}

export default function LiquidationFormModal({
  isOpen,
  onClose,
  onSuccess,
  liquidationToEdit,
}: LiquidationFormModalProps) {
  const isEditing = !!liquidationToEdit;
  const { mutate, pending } = useMutation();

  const form: UseFormReturn<LiquidationFormValues> = useForm<LiquidationFormValues>({
    resolver: zodResolver(LiquidationSchema),
    defaultValues: {
      record_number: "",
      reason: "",
      notes: null,
      liquidation_date: new Date().toISOString().split("T")[0],
      liquidation_type: "sell",
      committee: null,
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
    },
  });

  const { fields, append, remove } = useFieldArray<LiquidationFormValues, "items">({
    control: form.control,
    name: "items",
  });

  const { response: userRes } = useGet<IUser[]>({ url: endpoints.USERS }, { disabled: !isOpen });

  const { response: activeTemplate } = useGet<ITemplate>(
    { url: `${endpoints.TEMPLATE_ACTIVE}liquidation` },
    { disabled: !isOpen },
  );

  const { response: locationRes } = useGet<ILocation[]>(
    { url: `${endpoints.LOCATIONS}?limit=1000` },
    { disabled: !isOpen },
  );

  const users = userRes || [];
  const locations = locationRes || [];

  useEffect(() => {
    if (isOpen) {
      if (liquidationToEdit) {
        // Handle edit mapping if needed
      } else {
        form.reset({
          record_number: "",
          reason: "",
          notes: null,
          liquidation_date: new Date().toISOString().split("T")[0],
          liquidation_type: "sell",
          committee: "",
          total_value: 0,
          buyer_name: "",
          external_link: "",
          attachments: [],
          items: [
            {
              asset_id: 0,
              quantity: 1,
              unit_value: 0,
              remaining_value: 0,
              notes: "",
              from_location_id: 0,
              from_staff_id: 0,
              from_unit_id: 0,
            },
          ],
          workflow_assignments: [],
        });
      }
    }
  }, [isOpen, liquidationToEdit, form]);

  const onSubmit = async (data: LiquidationFormValues) => {
    const url = isEditing
      ? dynamicEndpoints.LIQUIDATION_DETAIL(liquidationToEdit!.id)
      : endpoints.LIQUIDATIONS;
    const method = isEditing ? "patch" : "post";

    const payload = {
      ...data,
      liquidation_date: new Date(data.liquidation_date).toISOString(),
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
      <DialogContent className="sm:max-w-[850px] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 pb-6 shrink-0 border-b">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trash2 className="text-primary" size={20} />
            </div>
            <DialogTitle className="text-2xl font-bold text-primary tracking-tight">
              {isEditing ? "Edit liquidation record" : "Create liquidation record"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground ml-11">
            {isEditing
              ? "Update the liquidation details and asset disposals."
              : "Register a new liquidation record with disposal details and approval workflow."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pb-4">
              <TabsList className="grid w-full grid-cols-3 h-16 p-1 bg-muted/30 z-10">
                <TabsTrigger value="general" className="flex flex-col items-center justify-center gap-1 h-full font-medium text-xs">
                  <ClipboardList size={16} /> Thông tin chung
                </TabsTrigger>
                <TabsTrigger value="assets" className="flex flex-col items-center justify-center gap-1 h-full font-medium text-xs">
                  <Package size={16} /> Lựa chọn tài sản
                </TabsTrigger>
                <TabsTrigger value="approval" className="flex flex-col items-center justify-center gap-1 h-full font-medium text-xs">
                  <UserCheck size={16} /> Quy trình phê duyệt
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              <TabsContent value="general" className="mt-0 outline-none">
                <GeneralLiquidationSection form={form} />
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
                <LiquidationApprovalSection
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
              {pending ? "Processing..." : isEditing ? "Save changes" : "Confirm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
