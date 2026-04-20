"use client";

import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, FieldValues, Path, UseFormReturn, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
}

export function DatePickerField<T extends FieldValues>({
  form,
  name,
}: DatePickerFieldProps<T>) {
  const fieldValue = useWatch({
    control: form.control,
    name,
  });

  const date = useMemo(() => {
    if (!fieldValue) return undefined;
    return (fieldValue as unknown) instanceof Date
      ? (fieldValue as Date)
      : new Date(fieldValue as string | number);
  }, [fieldValue]);

  const [inputValue, setInputValue] = useState(
    date ? format(date, "dd/MM/yyyy") : "",
  );
  const [prevDate, setPrevDate] = useState<Date | undefined>(date);

  // Sync internal state with form value when it changes (e.g. from calendar)
  if (date?.getTime() !== prevDate?.getTime()) {
    setPrevDate(date);
    setInputValue(date ? format(date, "dd/MM/yyyy") : "");
  }

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <div className="flex gap-2">
          {/* INPUT TYPE TEXT */}
          <Input
            placeholder="DD/MM/YYYY"
            className="bg-white text-sm"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              setInputValue(value);

              const parsed = parse(value, "dd/MM/yyyy", new Date());

              if (isValid(parsed) && value.length === 10) {
                field.onChange(format(parsed, "yyyy-MM-dd"));
              }
            }}
            onBlur={() => {
              if (date) {
                setInputValue(format(date, "dd/MM/yyyy"));
              } else {
                setInputValue("");
              }
            }}
          />

          {/* CALENDAR */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="bg-white shrink-0"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d: Date | undefined) => field.onChange(d ? format(d, "yyyy-MM-dd") : "")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    />
  );
}
