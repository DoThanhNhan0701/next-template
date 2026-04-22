import { useState } from "react";

import {
  Check,
  ChevronsUpDown,
  Search,
  User as UserIcon,
  X,
} from "lucide-react";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";

import { DatePickerField } from "@/components/common/DatePickerField";
import { FormattedNumberInput } from "@/components/common/FormattedNumberInput";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IStaff } from "@/types/staff";

import { LiquidationFormValues } from "@/components/schemas/user/liquidation.schema";

interface GeneralLiquidationSectionProps {
  form: UseFormReturn<LiquidationFormValues>;
  users: IStaff[];
}

export function GeneralLiquidationSection({
  form,
  users,
}: GeneralLiquidationSectionProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedUserIds =
    useWatch({
      control: form.control,
      name: "committee",
    }) || [];

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleUser = (id: number) => {
    const current = form.getValues("committee");
    if (current.includes(id)) {
      form.setValue(
        "committee",
        current.filter((v) => v !== id),
      );
    } else {
      form.setValue("committee", [...current, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Controller
          control={form.control}
          name="record_number"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>
                Record number
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder="e.g. TL20240001"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="liquidation_date"
          render={({ fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>
                Liquidation date
              </FieldLabel>
              <DatePickerField form={form} name="liquidation_date" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Controller
          control={form.control}
          name="liquidation_type"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>
                Liquidation method
              </FieldLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger className="bg-white shadow-sm">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="destroy">Destroy</SelectItem>
                  <SelectItem value="give">Donate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
              <FieldLabel>
                Total value (VND)
              </FieldLabel>
              <FormattedNumberInput
                {...field}
                value={field.value ?? 0}
                onChange={(val) => field.onChange(val ?? 0)}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <Field className="gap-1">
        <FieldLabel>
          Liquidation committee
        </FieldLabel>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full px-3 py-2 flex items-center justify-between gap-2 rounded-md border border-input shadow-sm hover:border-primary/50 transition-all text-left min-h-[44px]"
            >
              <div className="flex-1 flex flex-wrap gap-1.5 items-center overflow-hidden">
                {selectedUserIds.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Select committee members...
                  </span>
                ) : (
                  selectedUserIds.map((id) => {
                    const user = users.find((u) => u.id === id);
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1 text-xs whitespace-nowrap bg-primary/10 text-primary border-none hover:bg-primary/20"
                      >
                        {user?.full_name}
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUser(id);
                          }}
                          className="ml-0.5 hover:text-destructive cursor-pointer"
                        >
                          <X size={10} />
                        </span>
                      </Badge>
                    );
                  })
                )}
              </div>
              <ChevronsUpDown
                size={16}
                className="text-muted-foreground shrink-0"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-popper-anchor-width] min-w-[--radix-popper-anchor-width] p-0"
            align="start"
          >
            <div className="p-2 border-b bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 h-9 bg-background focus-visible:ring-1"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No members found
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`
                      flex items-center gap-2.5 px-3 py-2.5 rounded-sm cursor-pointer transition-colors
                      hover:bg-accent hover:text-accent-foreground
                      ${selectedUserIds.includes(u.id) ? "bg-accent/50" : ""}
                    `}
                    onClick={() => toggleUser(u.id)}
                  >
                    <div className="p-1.5 rounded-md bg-primary/5 text-primary">
                      <UserIcon size={14} />
                    </div>
                    <span className="flex-1 text-sm font-medium leading-none">
                      {u.full_name}
                    </span>
                    {selectedUserIds.includes(u.id) && (
                      <Check
                        size={16}
                        className="text-primary animate-in zoom-in-50 duration-200"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <FieldError errors={[form.formState.errors.committee]} />
      </Field>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Controller
          control={form.control}
          name="buyer_name"
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>
                Buyer / organization
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder="Buyer name or organization..."
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
              <FieldLabel>
                Document link
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                className="bg-white"
                placeholder="Drive/folder link..."
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
            <FieldLabel>
              Reason
            </FieldLabel>
            <Textarea
              {...field}
              value={field.value ?? ""}
              className="min-h-[80px] bg-white resize-none"
              placeholder="Why is this asset being liquidated?"
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
            <FieldLabel>
              Notes
            </FieldLabel>
            <Textarea
              {...field}
              value={field.value || ""}
              className="min-h-[60px] bg-white resize-none"
              placeholder="Additional notes if any..."
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </div>
  );
}
