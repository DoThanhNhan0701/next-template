"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { EditIcon, GitBranch } from "lucide-react";

import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
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
import { dynamicEndpoints, endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
import { IWorkflowTemplate } from "@/types/workflow-template";

import WorkflowTemplateFormModal from "./WorkflowTemplateFormModal";

export default function WorkflowTemplateTable() {
  const t = useTranslations("page_workflow_templates");
  const tt = useTranslations("page_workflow_templates.table");
  const td = useTranslations("page_workflow_templates.delete");
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

  const docTypeLabels: Record<string, string> = {
    transfer: tt("doc_types.transfer"),
    allocation: tt("doc_types.allocation"),
    recovery: tt("doc_types.recovery"),
    maintenance: tt("doc_types.maintenance"),
    rental: tt("doc_types.rental"),
    rental_return: tt("doc_types.rental_return"),
    liquidation: tt("doc_types.liquidation"),
    audit: tt("doc_types.audit"),
    stock_in: tt("doc_types.stock_in"),
    stock_out: tt("doc_types.stock_out"),
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 gap-2">
      <div className="flex items-center justify-end w-full">
        <Button onClick={() => setIsCreating(true)}>{t("create")}</Button>
      </div>

      <div className="border border-(--surface-border-color) flex-1 min-h-0 w-full overflow-hidden [&_div[data-slot=table-container]]:h-full [&_div[data-slot=table-container]]:overflow-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-sidebar-accent text-foreground border-b border-(--surface-border-color) sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="font-semibold h-10 px-4 w-[5%] text-center">
                {tt("no")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[45%]">
                {tt("workflow_name")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[20%]">
                {tt("document_type")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[10%] text-center">
                {tt("steps")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[10%] text-center">
                {tt("status")}
              </TableHead>
              <TableHead className="font-semibold h-10 px-4 w-[10%] text-right">
                {tt("actions")}
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
                message={tt("no_workflows_found")}
                description={tt("add_first_workflow")}
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
                    {docTypeLabels[item.document_type] ?? item.document_type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center text-sm">
                    {item.steps?.length ?? 0}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {item.is_active ? (
                      <span className="text-green-600 bg-green-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        {t("active")}
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        {t("inactive")}
                      </span>
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
        existingTemplates={templates}
        onSuccess={handleSaveSuccess}
      />

      <ConfirmDeleteModal
        isOpen={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        onSuccess={handleDeleteSuccess}
        title={td("title")}
        description={td.rich("confirm_message", {
          name: templateToDelete?.name || "",
          important: (chunks) => (
            <span className="font-semibold">{chunks}</span>
          ),
        })}
        url={
          templateToDelete
            ? dynamicEndpoints.TEMPLATE_DETAIL(templateToDelete.id)
            : ""
        }
        method="delete"
        translationGroup="page_workflow_templates.delete"
      />
    </div>
  );
}
