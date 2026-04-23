"use client";

import { UseFormRegister, UseFormSetValue, useWatch, Control } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";

import { RentalReturnFormValues } from "@/components/schemas/user/rental-return.schema";

interface ReturnItemRowProps {
  index: number;
  register: UseFormRegister<RentalReturnFormValues>;
  setValue: UseFormSetValue<RentalReturnFormValues>;
  control: Control<RentalReturnFormValues>;
  field: RentalReturnFormValues["items"][number];
}

export function ReturnItemRow({
  index,
  register,
  setValue,
  control,
  field,
}: ReturnItemRowProps) {
  const selected = useWatch({ control, name: `items.${index}.selected` });

  return (
    <TableRow className={!selected ? "opacity-50" : undefined}>
      <TableCell className="py-2 pl-3">
        <Checkbox
          id={`item-check-${index}`}
          checked={!!selected}
          onCheckedChange={(checked) =>
            setValue(`items.${index}.selected`, !!checked)
          }
        />
      </TableCell>
      <TableCell className="py-2">
        <div>
          <p className="font-medium text-sm">{field.asset_name}</p>
          <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
            {field.asset_code}
          </code>
        </div>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Badge variant="outline" className="font-semibold text-xs py-0 h-5">
          {field.max_quantity}
        </Badge>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Input
          type="number"
          {...register(`items.${index}.quantity` as const, {
            valueAsNumber: true,
          })}
          min={0}
          max={field.max_quantity}
          disabled={!selected}
          className="w-16 h-8 text-center mx-auto text-sm"
        />
      </TableCell>
      <TableCell className="py-2">
        <Input
          {...register(`items.${index}.condition` as const)}
          placeholder="Normal"
          disabled={!selected}
          className="h-8 text-sm"
        />
      </TableCell>
    </TableRow>
  );
}
