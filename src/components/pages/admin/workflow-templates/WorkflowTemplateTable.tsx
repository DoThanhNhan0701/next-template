"use client";

import { useState } from "react";

import {
  EditIcon,
  GitBranch,
  Lock,
  PlusIcon,
  Trash2Icon,
  Unlock,
} from "lucide-react";

import {
  TableEmptyRow,
  TableLoadingRows,
} from "@/components/common/TableStateDisplay";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IWorkflowTemplate } from "@/types/workflow-template";

import ConfirmDeleteModal from "./ConfirmDeleteModal";
import WorkflowTemplateFormModal from "./WorkflowTemplateFormModal";

export default function WorkflowTemplateTable() {
  const { response, pending, setResponse } = useGet<IWorkflowTemplate[]>({
    url: endpoints.TEMPLATES,
  });

  const templates = response || [];

  const [isCreating, setIsCreating] = useState(false);
  const [templateToEdit, setTemplateToEdit] =
    useState<IWorkflowTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] =
    useState<IWorkflowTemplate | null>(null);

  const handleSaveSuccess = (saved: IWorkflowTemplate, isEdit: boolean) => {
    setResponse((prev) => {
      if (!prev) return [saved];
      if (isEdit) return prev.map((t) => (t.id === saved.id ? saved : t));
      return [...prev, saved];
    });
  };

  const handleDeleteSuccess = () => {
    if (!templateToDelete) return;
    setResponse((prev) =>
      prev ? prev.filter((t) => t.id !== templateToDelete.id) : prev,
    );
  };

  const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    transfer: "Transfer · Asset transfer",
    allocation: "Allocation · Asset allocation",
    recovery: "Recovery · Asset recovery",
    maintenance: "Maintenance · Repair & maintenance",
    rental: "Rental · Asset rental",
    rental_return: "Rental Return · Return rental assets",
    liquidation: "Liquidation · Asset liquidation",
    audit: "Audit · Asset audit",
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex items-center justify-end w-full">
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon size={16} className="mr-2" />
          Add Workflow
        </Button>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                No
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[30%]">
                Workflow Name
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                Document Type
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[10%] text-center">
                Steps
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[10%] text-center">
                Status
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[10%] text-center">
                Locked
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-(--surface-border-color)">
            {pending ? (
              <TableLoadingRows colSpan={7} rows={6} />
            ) : templates.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                icon={GitBranch}
                message="No workflows found"
                description="Add your first approval workflow using the button above."
              />
            ) : (
              templates.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium">
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground font-normal truncate max-w-[260px]">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {DOCUMENT_TYPE_LABELS[item.document_type] ??
                      item.document_type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center text-sm">
                    {item.steps?.length ?? 0}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {item.is_active ? (
                      <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {item.is_locked ? (
                      <Lock size={15} className="mx-auto text-amber-500" />
                    ) : (
                      <Unlock
                        size={15}
                        className="mx-auto text-muted-foreground"
                      />
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setTemplateToEdit(item)}
                      >
                        <EditIcon size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-500/10"
                        onClick={() => setTemplateToDelete(item)}
                        disabled={item.is_locked}
                      >
                        <Trash2Icon size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <WorkflowTemplateFormModal
        isOpen={isCreating || templateToEdit !== null}
        onClose={() => {
          setIsCreating(false);
          setTemplateToEdit(null);
        }}
        templateToEdit={templateToEdit}
        onSuccess={handleSaveSuccess}
      />

      <ConfirmDeleteModal
        isOpen={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        template={templateToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
