"use client";

import * as React from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
  Building2,
  Network,
  Users,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string;
  name: string;
  code?: string;
  unit_type?: string;
  children?: TreeNode[];
}

export interface OrgUnit {
  name: string;
  code: string;
  unit_type: string;
  parent_id: number | null;
  leader_id: number | null;
  address: string | null;
  description: string | null;
  is_active: boolean;
  id: number;
  children: OrgUnit[];
}

export function convertToTreeNodes(units: OrgUnit[]): TreeNode[] {
  return units.map((unit) => ({
    id: unit.id.toString(),
    name: unit.name,
    code: unit.code,
    unit_type: unit.unit_type,
    children: unit.children ? convertToTreeNodes(unit.children) : undefined,
  }));
}

interface TreeProps {
  data: TreeNode[];
  className?: string;
  onAdd?: (node: TreeNode) => void;
  onEdit?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  onSelect?: (node: TreeNode) => void;
  onMove?: (nodeId: string, targetParentId: string | null) => void;
  selectedId?: string;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  onAdd?: (node: TreeNode) => void;
  onEdit?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  onSelect?: (node: TreeNode) => void;
  onMove?: (nodeId: string, targetParentId: string | null) => void;
  selectedId?: string;
  isLastChild?: boolean;
}

const getUnitIcon = (unitType?: string, isOpen?: boolean) => {
  switch (unitType) {
    case "company":
      return <Building2 className="h-4 w-4 text-blue-600" />;
    case "branch":
      return <Network className="h-4 w-4 text-amber-600" />;
    case "department":
      return <Users className="h-4 w-4 text-emerald-600" />;
    default:
      return isOpen ? (
        <FolderOpen className="h-4 w-4 text-primary" />
      ) : (
        <Folder className="h-4 w-4 text-primary" />
      );
  }
};

function TreeItem({
  node,
  level,
  onAdd,
  onEdit,
  onDelete,
  onSelect,
  onMove,
  selectedId,
  isLastChild,
}: Readonly<TreeItemProps>) {
  const [isOpen, setIsOpen] = React.useState(level < 1);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("nodeId", node.id);
    e.dataTransfer.effectAllowed = "move";
    // Ensure the drag is recognized
    e.dataTransfer.setData("text/plain", node.name);

    // Use a timeout to apply the style AFTER the drag ghost is created
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const draggedNodeId = e.dataTransfer.getData("nodeId");
    if (draggedNodeId && draggedNodeId !== node.id) {
      onMove?.(draggedNodeId, node.id);
    }
  };

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("relative", isDragOver && "z-50")}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-md transition-all duration-200 cursor-pointer relative",
          isSelected &&
            "bg-primary/5 text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]",
          isDragOver &&
            "bg-primary/10 ring-2 ring-inset ring-primary/40 scale-[1.01] z-10",
          isDragging &&
            "opacity-30 border-2 border-dashed border-primary/50 grayscale pointer-events-none",
        )}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => onSelect?.(node)}
      >
        {/* Connection Lines */}
        {level > 0 && (
          <div
            className="absolute left-[-14px] top-0 bottom-0 w-px bg-border group-hover:bg-primary/30 transition-colors"
            style={{ height: isLastChild && !hasChildren ? "20px" : "100%" }}
          />
        )}
        {level > 0 && (
          <div className="absolute left-[-14px] top-[20px] w-3 h-px bg-border group-hover:bg-primary/30 transition-colors" />
        )}

        <div className="flex items-center gap-1 min-w-[20px]">
          {hasChildren ? (
            <Collapsible.Trigger asChild>
              <button
                className="flex items-center justify-center h-5 w-5 hover:bg-muted rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isOpen && "rotate-90",
                  )}
                />
              </button>
            </Collapsible.Trigger>
          ) : (
            <div className="w-5" />
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className={cn(
              "p-1 rounded bg-muted/50 transition-colors",
              isSelected && "bg-primary/10",
            )}
          >
            {getUnitIcon(node.unit_type, isOpen)}
          </div>

          <div className="flex flex-col min-w-0">
            <span
              className={cn(
                "text-sm font-medium truncate leading-tight",
                isSelected && "text-primary font-semibold",
              )}
            >
              {node.name}
            </span>
            {node.code && (
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                {node.code}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(node);
              }}
              className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary transition-colors"
              title="Add sub-unit"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(node)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Unit
                </DropdownMenuItem>
              )}
              {onAdd && (
                <DropdownMenuItem onClick={() => onAdd(node)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-unit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(node)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Unit
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {hasChildren && (
        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="flex flex-col">
            {node.children!.map((child, index) => (
              <TreeItem
                key={child.id}
                node={child}
                level={level + 1}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onSelect={onSelect}
                onMove={onMove}
                selectedId={selectedId}
                isLastChild={index === node.children!.length - 1}
              />
            ))}
          </div>
        </Collapsible.Content>
      )}
    </Collapsible.Root>
  );
}

export function Tree({
  data,
  className,
  onAdd,
  onEdit,
  onDelete,
  onSelect,
  onMove,
  selectedId,
}: TreeProps) {
  const [isRootDragOver, setIsRootDragOver] = React.useState(false);

  return (
    <div className={cn("w-full py-2", className)}>
      {data.map((node, index) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          onMove={onMove}
          selectedId={selectedId}
          isLastChild={index === data.length - 1}
        />
      ))}

      {/* Move to root drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setIsRootDragOver(true);
        }}
        onDragLeave={() => setIsRootDragOver(false)}
        onDrop={(e) => {
          setIsRootDragOver(false);
          const draggedNodeId = e.dataTransfer.getData("nodeId");
          if (draggedNodeId) {
            onMove?.(draggedNodeId, null);
          }
        }}
        className={cn(
          "mt-4 p-4 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground transition-all duration-200",
          isRootDragOver &&
            "border-primary bg-primary/5 text-primary scale-[1.02]",
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        Drop here to make Root Unit
      </div>
    </div>
  );
}
