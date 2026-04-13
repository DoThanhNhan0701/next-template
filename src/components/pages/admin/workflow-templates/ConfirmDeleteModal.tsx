"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { useMutation } from "@/hooks/useMutation";
import { endpoints } from "@/config/endpoints";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { IWorkflowTemplate } from "@/types/workflow-template";

interface Props {
  template: IWorkflowTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConfirmDeleteModal({ template, isOpen, onClose, onSuccess }: Props) {
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
          <DialogTitle className="text-center">Confirm Deletion</DialogTitle>
          <DialogDescription className="text-center px-4">
            Are you sure you want to delete workflow{" "}
            <span className="font-bold text-foreground">&quot;{template?.name}&quot;</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-center mt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 max-w-[140px]">
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
            className="flex-1 max-w-[140px]"
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
