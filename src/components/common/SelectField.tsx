"use client";

import { useMemo, useRef, useState } from "react";

import { Check, ChevronsUpDown, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SelectOption<
  TValue extends string | number = string | number,
> {
  label: string;
  value: TValue;
  disabled?: boolean;
}

interface Props<TValue extends string | number = string | number> {
  /** Danh sách options */
  options: SelectOption<TValue>[];
  /** Giá trị hiện tại (string hoặc number cho single, array cho multiple) */
  value?: TValue | TValue[] | null;
  /** Callback khi chọn giá trị mới */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  /** Placeholder khi chưa chọn */
  placeholder?: string;
  /** Hiển thị thanh tìm kiếm bên trong dropdown */
  searchable?: boolean;
  /** Placeholder cho ô tìm kiếm */
  searchPlaceholder?: string;
  /** Vô hiệu hóa toàn bộ select */
  disabled?: boolean;
  /** Class của trigger button */
  className?: string;
  /** Hỗ trợ chọn nhiều giá trị */
  multiple?: boolean;
  /** Cho phép xóa giá trị đã chọn */
  clearable?: boolean;
}

/**
 * SelectField – component select tái sử dụng dạng Combobox (Popover + search).
 *
 * @example
 * // Dùng với React Hook Form Controller
 * <Controller
 *   name="role_id"
 *   control={form.control}
 *   render={({ field }) => (
 *     <SelectField
 *       options={roles.map((r) => ({ label: r.name, value: r.id }))}
 *       value={field.value}
 *       onChange={field.onChange}
 *       placeholder="Chọn vai trò"
 *       searchable
 *     />
 *   )}
 * />
 */
export function SelectField<TValue extends string | number = string | number>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchable = true,
  searchPlaceholder = "Search...",
  disabled = false,
  className,
  multiple = false,
  clearable = true,
}: Props<TValue>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const removeDiacritics = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lower = removeDiacritics(search.toLowerCase());
    return options.filter((opt) =>
      removeDiacritics(opt.label.toLowerCase()).includes(lower),
    );
  }, [options, search]);

  const isSelected = (optVal: TValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optVal);
    }
    return value === optVal;
  };

  const selectedLabel = useMemo(() => {
    if (multiple) {
      if (!Array.isArray(value) || value.length === 0) return null;
      const selectedOpts = options.filter((opt) => value.includes(opt.value));
      return selectedOpts.map((opt) => opt.label).join(", ");
    }
    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : null;
  }, [multiple, value, options]);

  const handleSelect = (opt: SelectOption<TValue>) => {
    if (opt.disabled) return;
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const nextValues = currentValues.includes(opt.value)
        ? currentValues.filter((v) => v !== opt.value)
        : [...currentValues, opt.value];
      onChange(nextValues);
    } else {
      onChange(opt.value);
      setOpen(false);
      setSearch("");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedLabel && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate pr-4">
            {selectedLabel ? selectedLabel : placeholder}
          </span>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {clearable && selectedLabel && !disabled && (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange(multiple ? [] : null);
                }}
                className="hover:text-destructive text-muted-foreground/60 transition-colors p-0.5 cursor-pointer rounded-sm hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/60" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
        sideOffset={5}
      >
        {searchable && (
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0" />
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent! border-0 px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
        )}

        <div
          className="max-h-60 overflow-y-auto overscroll-contain p-1"
          onWheel={(e) => e.stopPropagation()}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                disabled={opt.disabled}
                onClick={() => handleSelect(opt)}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground",
                  opt.disabled && "pointer-events-none opacity-50",
                  isSelected(opt.value) && "bg-accent",
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 shrink-0",
                    isSelected(opt.value) ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{opt.label}</span>
              </button>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No options found.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
