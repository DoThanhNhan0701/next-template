"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Tree, convertToTreeNodes, TreeNode } from "@/components/ui/tree";
import { useGet } from "@/hooks/useGet";
import { endpoints } from "@/config/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCcw, Search } from "lucide-react";
import OrgUnitFormModal from "./OrgUnitFormModal";
import OrgUnitDetailView from "./OrgUnitDetailView";
import OrgUnitDeleteDialog from "./OrgUnitDeleteDialog";
import { OrgUnit } from "@/components/ui/tree";

export default function OrganizationalStructurePage() {
  const {
    response: data,
    pending: loading,
    reFetch,
  } = useGet<OrgUnit[]>({
    url: endpoints.ORG_UNITS + "tree",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<OrgUnit | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<OrgUnit | null>(null);
  const [parentUnit, setParentUnit] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<OrgUnit | null>(null);

  const flatUnits = useMemo(() => {
    const flatten = (units: OrgUnit[]): OrgUnit[] => {
      return units.reduce((acc: OrgUnit[], unit) => {
        return [...acc, unit, ...flatten(unit.children || [])];
      }, []);
    };
    return data ? flatten(data) : [];
  }, [data]);

  const hasInitialized = useRef(false);
  // Auto-select first unit on load
  useEffect(() => {
    if (data && data.length > 0 && !hasInitialized.current) {
      const timer = setTimeout(() => {
        setSelectedUnit(data[0]);
        hasInitialized.current = true;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const filteredTreeData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return convertToTreeNodes(data);

    const filterTree = (nodes: OrgUnit[]): OrgUnit[] => {
      return nodes
        .map((node) => ({
          ...node,
          children: filterTree(node.children || []),
        }))
        .filter(
          (node) =>
            node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.children.length > 0,
        );
    };

    return convertToTreeNodes(filterTree(data));
  }, [data, searchQuery]);

  const handleCreateRoot = () => {
    setUnitToEdit(null);
    setParentUnit(null);
    setIsFormOpen(true);
  };

  const handleAddChild = (node: TreeNode) => {
    setUnitToEdit(null);
    setParentUnit({ id: Number(node.id), name: node.name });
    setIsFormOpen(true);
  };

  const handleEdit = (node: TreeNode | OrgUnit) => {
    const unit =
      "children" in node
        ? node
        : flatUnits.find((u) => u.id.toString() === node.id);
    if (unit) {
      setUnitToEdit(unit as OrgUnit);
      setParentUnit(null);
      setIsFormOpen(true);
    }
  };

  const handleDeleteTrigger = (node: TreeNode | OrgUnit) => {
    const unit =
      "children" in node
        ? node
        : flatUnits.find((u) => u.id.toString() === node.id);
    if (unit) {
      setUnitToDelete(unit as OrgUnit);
      setIsDeleteOpen(true);
    }
  };

  const handleSelect = (node: TreeNode) => {
    const unit = flatUnits.find((u) => u.id.toString() === node.id);
    if (unit) setSelectedUnit(unit);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-medium">
            Building organizational hierarchy...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-hidden h-full">
      {/* Header Section */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => reFetch()}
          disabled={loading}
          className="shadow-sm"
        >
          <RefreshCcw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
        <Button size="sm" onClick={handleCreateRoot} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Root Unit
        </Button>
      </div>

      {/* Main Content: Master-Detail Layout */}
      <div className="flex-1 flex gap-2 min-h-0">
        {/* Left Side: Tree Explorer */}
        <div className="w-full md:basis-[40%] flex flex-col gap-4 border rounded-xl shadow-sm overflow-hidden p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search units, codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/30 border-none ring-1 ring-border/50 focus-visible:ring-primary/40"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-primary/20 transition-colors">
            {filteredTreeData.length > 0 ? (
              <Tree
                data={filteredTreeData}
                onAdd={handleAddChild}
                onEdit={handleEdit}
                onDelete={handleDeleteTrigger}
                onSelect={handleSelect}
                selectedId={selectedUnit?.id.toString()}
              />
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4">
                <Search className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No units found matching &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detail View */}
        <div className="hidden md:block md:basis-[60%] min-w-0">
          <OrgUnitDetailView
            unit={selectedUnit}
            onEdit={handleEdit}
            onDelete={handleDeleteTrigger}
          />
        </div>
      </div>

      {/* Modals */}
      <OrgUnitFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        unitToEdit={unitToEdit}
        parentUnit={parentUnit}
        onSuccess={() => {
          reFetch();
          setSelectedUnit(null); // Clear selection to refresh details if needed
        }}
      />

      <OrgUnitDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        unitId={unitToDelete?.id || null}
        unitName={unitToDelete?.name || null}
        onSuccess={() => {
          reFetch();
          setSelectedUnit(null);
        }}
      />
    </div>
  );
}
