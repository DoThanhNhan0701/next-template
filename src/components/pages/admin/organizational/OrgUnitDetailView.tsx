"use client";

import {
  Building2,
  Hash,
  Info,
  MapPin,
  Network,
  User,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OrgUnit } from "@/components/ui/tree";
import { cn } from "@/lib/utils";

interface Props {
  unit: OrgUnit | null;
  onEdit: (unit: OrgUnit) => void;
  onDelete: (unit: OrgUnit) => void;
}

export default function OrgUnitDetailView({ unit, onEdit, onDelete }: Props) {
  if (!unit) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center border-2 border-dashed rounded-xl opacity-60">
        <Building2 className="h-12 w-12 mb-4 stroke-[1.5]" />
        <h3 className="text-lg font-medium">No Unit Selected</h3>
        <p className="text-sm max-w-[200px]">
          Select an organizational unit from the tree to view its details.
        </p>
      </div>
    );
  }

  const getUnitIcon = (unitType: string) => {
    switch (unitType) {
      case "company":
        return <Building2 className="h-5 w-5 text-blue-600" />;
      case "branch":
        return <Network className="h-5 w-5 text-amber-600" />;
      case "department":
        return <Users className="h-5 w-5 text-emerald-600" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-sm border-muted/60 overflow-hidden bg-transparent">
      <CardHeader className="bg-muted/30 border-b py-2 pr-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-background shadow-sm ring-1 ring-border/50">
              {getUnitIcon(unit.unit_type)}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight mb-0">
                {unit.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] tracking-wider px-1.5 py-0 h-4 border-muted-foreground/30"
                >
                  {unit.code}
                </Badge>
                <Badge
                  className={cn(
                    "px-1.5 py-0 h-4 text-[10px] font-medium",
                    unit.unit_type === "company" &&
                      "bg-blue-100 text-blue-700 hover:bg-blue-100",
                    unit.unit_type === "branch" &&
                      "bg-amber-100 text-amber-700 hover:bg-amber-100",
                    unit.unit_type === "department" &&
                      "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
                  )}
                >
                  {unit.unit_type}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(unit)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(unit)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-0">
          <DetailItem
            icon={<Hash className="h-4 w-4" />}
            label="Unit Code"
            value={unit.code}
          />
          <DetailItem
            icon={<Building2 className="h-4 w-4" />}
            label="Unit Type"
            value={unit.unit_type}
            isCapitalize
          />
          <DetailItem
            icon={<User className="h-4 w-4" />}
            label="Leader ID"
            value={unit.leader_id?.toString() || "No leader assigned"}
          />
          <DetailItem
            icon={<MapPin className="h-4 w-4" />}
            label="Address"
            value={unit.address || "Address not specified"}
            className="md:col-span-2"
          />
        </div>

        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
            <Info className="h-4 w-4" />
            <span>Description</span>
          </div>
          <Textarea
            value={unit.description || "No description provided."}
            disabled
            className="min-h-[100px] resize-none bg-muted/20 border-muted/40 text-foreground opacity-100 cursor-default"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-muted/60 bg-muted/10">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-muted-foreground tracking-widest">
              Status
            </span>
            <span
              className={cn(
                "text-sm font-bold",
                unit.is_active ? "text-emerald-600" : "text-destructive",
              )}
            >
              {unit.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                unit.is_active
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-destructive",
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({
  icon,
  label,
  value,
  isCapitalize,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isCapitalize?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      <Input
        value={value}
        disabled
        className={cn(
          "bg-muted/10 border-muted/50 text-foreground opacity-100 font-medium cursor-default",
          isCapitalize && "capitalize",
        )}
      />
    </div>
  );
}
