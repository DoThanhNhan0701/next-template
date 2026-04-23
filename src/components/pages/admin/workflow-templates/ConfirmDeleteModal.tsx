"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { endpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { IWorkflowTemplate } from "@/types/workflow-template";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  template: IWorkflowTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConfirmDeleteModal({
  template,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const t = useTranslations("page_workflow_templates.delete");
  const { mutate, pending } = useMutation();

  const handleDelete = async () => {
    if (!template) return;
    await mutate(
      { url: `${endpoints.TEMPLATES}${template.id}/`, method: "delete" },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess();
          onClose();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <TriangleAlert className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center px-4">
            {t.rich("confirm_message", {
              name: template?.name || "",
              important: (chunks) => (
                <span className="font-bold text-foreground mx-1 text-base underline decoration-destructive/30 underline-offset-4 font-mono bg-destructive/5 px-1.5 py-0.5 rounded border border-destructive/10 leading-none inline-block">
                  &quot;{chunks}&quot;
                </span>
              ),
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-3 shrink-0 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? t("deleting") : t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
