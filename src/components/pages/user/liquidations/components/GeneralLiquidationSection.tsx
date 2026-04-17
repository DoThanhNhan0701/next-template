"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { LiquidationFormValues } from "../schema";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeneralLiquidationSectionProps {
  form: UseFormReturn<LiquidationFormValues>;
}

export function GeneralLiquidationSection({ form }: GeneralLiquidationSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          control={form.control}
          name="record_number"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Số biên bản *
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white h-11"
                placeholder="e.g. TL20240001"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="liquidation_date"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Ngày thanh lý *
              </FieldLabel>
              <Input {...field} type="date" className="bg-white h-11" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          control={form.control}
          name="liquidation_type"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Hình thức thanh lý *
              </FieldLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="bg-white h-11 shadow-sm">
                  <SelectValue placeholder="Chọn hình thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">Bán thanh lý</SelectItem>
                  <SelectItem value="destroy">Tiêu hủy</SelectItem>
                  <SelectItem value="give">Cho/Tặng</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="total_value"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Tổng giá trị (VND)
              </FieldLabel>
              <Input
                {...field}
                type="number"
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="bg-white h-11"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <Controller
        control={form.control}
        name="committee"
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel className="text-xs font-semibold text-muted-foreground">
              Hội đồng thanh lý
            </FieldLabel>
            <Input
              {...field}
              value={field.value ?? ""}
              className="bg-white h-11"
              placeholder="Danh sách thành viên (cách nhau bởi dấu phẩy)"
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          control={form.control}
          name="buyer_name"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Người/Đơn vị mua
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white h-11"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="external_link"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel className="text-xs font-semibold text-muted-foreground">
                Đường dẫn tài liệu
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white h-11"
                placeholder="Link drive, folder..."
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <Controller
        control={form.control}
        name="reason"
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest">
              LÝ DO *
            </FieldLabel>
            <Textarea
              {...field}
              value={field.value ?? ""}
              className="min-h-[80px] bg-white resize-none"
              placeholder="Tại sao tài sản này lại được thanh lý?"
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="notes"
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel className="text-[10px] font-extrabold text-muted-foreground tracking-widest">
              GHI CHÚ
            </FieldLabel>
            <Textarea
              {...field}
              value={field.value || ""}
              className="min-h-[60px] bg-white resize-none"
              placeholder="Ghi chú thêm nếu có..."
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </div>
  );
}
