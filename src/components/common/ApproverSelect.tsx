"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IUser } from "@/types/auth";
import { ITemplateStep } from "@/types/template";

interface Props {
  step: ITemplateStep;
  allUsers: IUser[];
  value: string;
  onChange: (val: string) => void;
  triggerClassName?: string;
  placeholder?: string;
}

export function ApproverSelect({ step, allUsers, value, onChange, triggerClassName, placeholder }: Props) {
  const options = step.default_assignee_role_id
    ? allUsers.filter((u) => u.is_active && u.role_id === step.default_assignee_role_id)
    : allUsers.filter((u) => u.is_active);

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className={triggerClassName ?? "h-9"}>
        <SelectValue placeholder={placeholder ?? "Select approver"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none" className="text-muted-foreground italic">
          (None)
        </SelectItem>
        {options.map((u) => (
          <SelectItem key={u.id} value={u.id.toString()}>
            {u.full_name} ({u.username})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
