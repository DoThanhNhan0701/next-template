"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
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

export function ApproverSelect({
  step,
  allUsers,
  value,
  onChange,
  triggerClassName,
  placeholder,
}: Props) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const baseOptions = useMemo(() => {
    return step.default_assignee_role_id
      ? allUsers.filter(
          (u) => u.is_active && u.role_id === step.default_assignee_role_id,
        )
      : allUsers.filter((u) => u.is_active);
  }, [allUsers, step.default_assignee_role_id]);

  const filteredOptions = useMemo(() => {
    return baseOptions.filter(
      (u) =>
        u.full_name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(deferredSearch.toLowerCase()),
    );
  }, [baseOptions, deferredSearch]);

  return (
    <Select
      onValueChange={onChange}
      value={value}
      onOpenChange={(open) => {
        if (!open) {
          setSearch("");
        } else {
          // Use requestAnimationFrame for more reliable focus timing in Radix
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              document.getElementById("approver-search-input")?.focus();
            });
          });
        }
      }}
    >
      <SelectTrigger className={triggerClassName ?? "h-9"}>
        <SelectValue placeholder={placeholder ?? "Select approver"} />
      </SelectTrigger>
      <SelectContent className="max-h-80" position="popper" sideOffset={5}>
        <div
          className="-mx-1 -mt-1 p-2 border-b bg-popover sticky top-[-10px] z-20"
          onPointerDown={(e) => {
            // Prevent blur of the input when clicking the container
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="approver-search-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPointerDown={(e) => {
                // Ensure clicks on the input work and don't propagate to Radix
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                // Prevent Radix UI from handling keys like Space or arrows
                e.stopPropagation();
              }}
              className="w-full pl-9 h-9 bg-background focus:ring-0 focus-visible:ring-1"
              autoFocus
            />
          </div>
        </div>
        <div className="p-1">
          <SelectItem value="none" className="text-muted-foreground italic">
            (None)
          </SelectItem>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((u) => (
              <SelectItem key={u.id} value={u.id.toString()}>
                {u.full_name} ({u.username})
              </SelectItem>
            ))
          ) : deferredSearch ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No user found.
            </div>
          ) : null}
        </div>
      </SelectContent>
    </Select>
  );
}
