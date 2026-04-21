import { useEffect } from "react";

import { AlertCircle, Calendar, Package, UserCircle2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { ApproverSelect } from "@/components/common/ApproverSelect";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IUser } from "@/types/auth";
import { ILocation } from "@/types/location";
import { IRentalFull } from "@/types/rental";
import { ITemplate } from "@/types/template";
import { getTodayISO } from "@/utils/date";

interface RentalReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Record<string, unknown>) => void;
  pending: boolean;
  rentalDetail: IRentalFull | null;
}

interface RentalReturnFormValues {
  return_date: string;
  notes: string;
  to_location_id: string;
  approver_step_1_id: number | null;
  approver_step_2_id: number | null;
  items: Array<{
    asset_id: number;
    rental_detail_id: number;
    quantity: number;
    condition: string;
    asset_name: string; // for display
    asset_code: string; // for display
    max_quantity: number; // for validation
  }>;
}

export default function RentalReturnModal({
  isOpen,
  onClose,
  onConfirm,
  pending,
  rentalDetail,
}: RentalReturnModalProps) {
  const form = useForm<RentalReturnFormValues>({
    defaultValues: {
      return_date: getTodayISO(),
      notes: "",
      to_location_id: "",
      approver_step_1_id: null,
      approver_step_2_id: null,
      items: [],
    },
  });

  const { response: locationsRes } = useGet<ILocation[]>({
    url: endpoints.LOCATIONS,
  });

  const { response: userRes } = useGet<IUser[]>(
    { url: endpoints.USERS },
    { disabled: !isOpen },
  );

  const { response: activeTemplate } = useGet<ITemplate>(
    { url: `${endpoints.TEMPLATE_ACTIVE}rental_return` },
    { disabled: !isOpen },
  );

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const locations = locationsRes || [];
  const users = userRes || [];

  // Reset items when modal opens or rentalDetail changes
  useEffect(() => {
    if (isOpen && rentalDetail) {
      const initialItems = rentalDetail.details.map((d) => ({
        asset_id: d.asset_id,
        rental_detail_id: d.id,
        quantity: d.quantity - d.returned_quantity,
        condition: "Bình thường",
        asset_name: d.asset.name,
        asset_code: d.asset.asset_code,
        max_quantity: d.quantity - d.returned_quantity,
      }));
      replace(initialItems);
      form.reset({
        ...form.getValues(),
        items: initialItems,
        to_location_id:
          rentalDetail.details[0]?.from_location_id?.toString() || "",
      });
    }
  }, [isOpen, rentalDetail, replace, form]);

  const onSubmit = (values: RentalReturnFormValues) => {
    const workflow_assignments: Array<{ step_id: number; user_id: number }> =
      [];
    if (activeTemplate?.steps) {
      if (values.approver_step_1_id && activeTemplate.steps[0]) {
        workflow_assignments.push({
          step_id: activeTemplate.steps[0].id,
          user_id: values.approver_step_1_id,
        });
      }
      if (values.approver_step_2_id && activeTemplate.steps[1]) {
        workflow_assignments.push({
          step_id: activeTemplate.steps[1].id,
          user_id: values.approver_step_2_id,
        });
      }
    }

    const payload = {
      return_date: new Date(values.return_date).toISOString(),
      notes: values.notes,
      to_location_id: Number(values.to_location_id),
      attachments: [],
      items: values.items.map((item) => ({
        asset_id: item.asset_id,
        rental_detail_id: item.rental_detail_id,
        quantity: Number(item.quantity),
        condition: item.condition,
      })),
      workflow_assignments,
    };

    onConfirm(payload);
  };

  if (!rentalDetail) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-primary" />
            Hoàn trả tài sản thuê
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Lập biên bản nhận lại tài sản từ khách hàng cho phiếu{" "}
            {rentalDetail.record_number}
          </DialogDescription>
        </DialogHeader>

        {/* Warning Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              CẢNH BÁO: QUY TRÌNH PHÊ DUYỆT ĐANG BỊ KHÓA
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Nghiệp vụ này đã được thiết lập quy trình phê duyệt{" "}
              <span className="font-semibold">bắt buộc</span>. Chứng từ sẽ ở
              trạng thái <span className="font-semibold">Chờ duyệt</span> sau
              khi lưu và không thể thực thi ngay lập tức.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-4">
              {/* Return Date */}
              <div className="space-y-2">
                <Label
                  htmlFor="returnDate"
                  className="text-xs font-semibold uppercase text-muted-foreground"
                >
                  Ngày trả thực tế
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="returnDate"
                    type="date"
                    {...form.register("return_date")}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* To Location */}
              <div className="space-y-2">
                <Label
                  htmlFor="toLocation"
                  className="text-xs font-semibold uppercase text-muted-foreground"
                >
                  Kho nhận lại tài sản
                </Label>
                <Controller
                  name="to_location_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Kho tổng (ST_TOTAL)" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id.toString()}>
                            {loc.name} ({loc.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-muted-foreground italic">
                  * Mặc định hệ thống sẽ trả về kho đã xuất ban đầu nếu không
                  chọn kho khác.
                </p>
              </div>
            </div>

            {/* General Notes */}
            <div className="space-y-2 flex flex-col">
              <Label
                htmlFor="notes"
                className="text-xs font-semibold uppercase text-muted-foreground"
              >
                Ghi chú chung
              </Label>
              <Textarea
                id="notes"
                placeholder="VD: Khách trả tại kho, máy còn mới..."
                {...form.register("notes")}
                className="resize-none flex-1"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Danh sách tài sản
            </Label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          defaultChecked
                        />
                        Tên tài sản
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">
                      Đang thuê
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">
                      Số lượng trả
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">
                      Tình trạng nhận lại
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-muted/30">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded"
                            defaultChecked
                          />
                          <div>
                            <p className="font-medium">{field.asset_name}</p>
                            <code className="text-xs text-muted-foreground">
                              {field.asset_code}
                            </code>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant="outline" className="font-semibold">
                          {field.max_quantity}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Input
                          type="number"
                          {...form.register(`items.${index}.quantity` as const)}
                          min={0}
                          max={field.max_quantity}
                          className="w-16 h-8 text-center mx-auto"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          {...form.register(
                            `items.${index}.condition` as const,
                          )}
                          placeholder="Bình thường"
                          className="h-8"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approval Workflow */}
          {activeTemplate?.steps && activeTemplate.steps.length > 0 && (
            <div className="flex flex-col gap-3 pt-4 border-t px-1">
              <h3 className="text-sm font-semibold text-primary pb-2 flex items-center gap-2 tracking-tight">
                <UserCircle2 className="w-5 h-5 text-primary" />
                <span>Người duyệt quy trình</span>
              </h3>

              <div className="bg-muted/20 border rounded-md p-6 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  {activeTemplate.steps.map((step, idx) => {
                    const name =
                      idx === 0 ? "approver_step_1_id" : "approver_step_2_id";
                    return (
                      <Controller
                        key={`rental-return-approver-${step.id}`}
                        name={name as keyof RentalReturnFormValues}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field className="gap-2.5">
                            <FieldLabel className="text-[10px] font-black text-muted-foreground/80 tracking-[0.15em] mb-1">
                              {step.name}
                            </FieldLabel>
                            <ApproverSelect
                              step={step}
                              allUsers={users}
                              value={field.value ? field.value.toString() : ""}
                              onChange={(val) =>
                                field.onChange(
                                  val === "none" ? null : Number(val),
                                )
                              }
                              triggerClassName="h-14 bg-white rounded-md border-muted-foreground/30 shadow-sm transition-all hover:border-primary/50 focus:ring-4 focus:ring-primary/5"
                            />
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Hủy bỏ
          </Button>
          <Button
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={pending}
          >
            {pending ? "Đang xử lý..." : "Xác nhận hoàn trả"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
