"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Plus, RefreshCcw, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tree, TreeNode, convertToTreeNodes } from "@/components/ui/tree";
import { OrgUnit } from "@/components/ui/tree";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { IOrgUnit } from "@/types/org";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

import OrgUnitDeleteDialog from "./OrgUnitDeleteDialog";
import OrgUnitDetailView from "./OrgUnitDetailView";
import OrgUnitFormModal from "./OrgUnitFormModal";

const flattenOrgUnits = (units: OrgUnit[]): OrgUnit[] => {
  return units.reduce((acc: OrgUnit[], unit) => {
    return [...acc, unit, ...flattenOrgUnits(unit.children || [])];
  }, []);
};

export default function OrganizationalStructurePage() {
  const {
    response: data,
    pending: loading,
    reFetch,
    setResponse: setData,
  } = useGet<OrgUnit[]>({
    url: endpoints.ORG_UNITS + "/tree",
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
  const [isParentDisabled, setIsParentDisabled] = useState(false);

  const { mutate } = useMutation();

  const flatUnits = useMemo(() => {
    return data ? flattenOrgUnits(data) : [];
  }, [data]);

  // --- Local state updaters (no refetch needed) ---
  const insertUnit = (units: OrgUnit[], newUnit: OrgUnit): OrgUnit[] => {
    if (newUnit.parent_id === null)
      return [...units, { ...newUnit, children: [] }];
    return units.map((u) => {
      if (u.id === newUnit.parent_id) {
        return {
          ...u,
          children: [...(u.children || []), { ...newUnit, children: [] }],
        };
      }
      if (u.children?.length)
        return { ...u, children: insertUnit(u.children, newUnit) };
      return u;
    });
  };

  const updateUnit = (units: OrgUnit[], updated: OrgUnit): OrgUnit[] => {
    return units.map((u) => {
      if (u.id === updated.id)
        return { ...updated, children: u.children || [] };
      if (u.children?.length)
        return { ...u, children: updateUnit(u.children, updated) };
      return u;
    });
  };

  const removeUnit = (units: OrgUnit[], id: number): OrgUnit[] => {
    return units
      .filter((u) => u.id !== id)
      .map((u) => ({
        ...u,
        children: u.children?.length ? removeUnit(u.children, id) : u.children,
      }));
  };

  const handleFormSuccess = (savedUnit: IOrgUnit) => {
    setData((prev) => {
      if (!prev) return prev;
      const existingNode = flatUnits.find((u) => u.id === savedUnit.id);
      const unitWithChildren: OrgUnit = {
        ...savedUnit,
        address: savedUnit.address ?? null,
        description: savedUnit.description ?? null,
        // preserve existing children when updating
        children: existingNode?.children || [],
      };

      if (!existingNode) {
        // New unit: insert at correct parent
        return insertUnit(prev, unitWithChildren);
      }

      const parentChanged = existingNode.parent_id !== savedUnit.parent_id;
      if (parentChanged) {
        // Remove from old position, insert at new position
        const withoutOld = removeUnit(prev, savedUnit.id);
        return insertUnit(withoutOld, unitWithChildren);
      }

      // Same position: just update in place
      return updateUnit(prev, unitWithChildren);
    });
    setSelectedUnit(
      (prev) =>
        ({
          ...(prev || {}),
          ...savedUnit,
          address: savedUnit.address ?? null,
          description: savedUnit.description ?? null,
          children:
            flatUnits.find((u) => u.id === savedUnit.id)?.children || [],
        }) as OrgUnit,
    );
  };

  const handleDeleteSuccess = (deletedId: number) => {
    setData((prev) => (prev ? removeUnit(prev, deletedId) : prev));
    setSelectedUnit(null);
  };

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
    setIsParentDisabled(false);
    setIsFormOpen(true);
  };

  const handleAddChild = (node: TreeNode) => {
    setUnitToEdit(null);
    setParentUnit({ id: Number(node.id), name: node.name });
    setIsParentDisabled(true);
    setIsFormOpen(true);
  };

  const handleEdit = (node: TreeNode | OrgUnit) => {
    // Correctly find the full OrgUnit by comparing string IDs to be type-safe
    const unit = flatUnits.find((u) => u.id.toString() === node.id.toString());
    if (unit) {
      setUnitToEdit(unit);
      setParentUnit(null);
      setIsParentDisabled(false);
      setIsFormOpen(true);
    }
  };

  const handleDeleteTrigger = (node: TreeNode | OrgUnit) => {
    const unit = flatUnits.find((u) => u.id.toString() === node.id.toString());
    if (unit) {
      setUnitToDelete(unit);
      setIsDeleteOpen(true);
    }
  };

  const handleSelect = (node: TreeNode) => {
    const unit = flatUnits.find((u) => u.id.toString() === node.id);
    if (unit) setSelectedUnit(unit);
  };

  const handleMove = async (nodeId: string, targetParentId: string | null) => {
    const unit = flatUnits.find((u) => u.id.toString() === nodeId);
    if (!unit) return;

    // Type casting to number
    const targetId = targetParentId ? Number(targetParentId) : null;

    // Check if target is same as current parent
    if (unit.parent_id === targetId) return;

    // Check for circular reference: cannot move a parent into its own branch
    if (targetId !== null) {
      const isDescendant = (id: number, target: number): boolean => {
        if (id === target) return true;
        const u = flatUnits.find((u) => u.id === id);
        if (!u) return false;
        return (u.children || []).some((child) =>
          isDescendant(child.id, target),
        );
      };

      if (isDescendant(unit.id, targetId)) {
        toast.error("Invalid move: cannot move a unit to its own branch.");
        return;
      }
    }

    // Call API using useMutation for consistency
    await mutate(
      {
        url: `${endpoints.ORG_UNITS}${unit.id}`,
        method: "patch",
        body: { parent_id: targetId },
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          handleFormSuccess(res as OrgUnit);
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
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
        <div className="w-full md:basis-[40%] flex flex-col gap-3 border rounded-xl shadow-sm overflow-hidden p-3">
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
                onMove={handleMove}
                selectedId={selectedUnit?.id.toString()}
              />
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center p-3">
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
        isParentDisabled={isParentDisabled}
        onSuccess={(savedUnit) => {
          handleFormSuccess(savedUnit);
        }}
      />

      <OrgUnitDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        unitId={unitToDelete?.id || null}
        unitName={unitToDelete?.name || null}
        onSuccess={() => {
          if (unitToDelete) handleDeleteSuccess(unitToDelete.id);
        }}
      />
    </div>
  );
}
