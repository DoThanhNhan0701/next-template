"use client";

import React from "react";

import { useTranslations } from "next-intl";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@/hooks/useMutation";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "delete" | "patch" | "post") => void;
  title: React.ReactNode;
  description: React.ReactNode;
  url: string;
  method?: "delete" | "patch" | "post";
  body?: Record<string, unknown>;
  /**
   * Translation key for cancel button. Default to "cancel"
   */
  cancelText?: string;
  /**
   * Translation key for delete/confirm button. Default to "delete"
   */
  confirmText?: string;
  /**
   * Translation key for loading state. Default to "deleting"
   */
  loadingText?: string;
  /**
   * Message group for translations. Default to "common"
   */
  translationGroup?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  url,
  method = "delete",
  body = {},
  cancelText,
  confirmText,
  loadingText,
  translationGroup = "common",
}: ConfirmDeleteModalProps) {
  const t = useTranslations(translationGroup);
  const { mutate, pending } = useMutation();

  const handleConfirm = async () => {
    await mutate(
      {
        url,
        method,
        body,
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess(res, method);
          onClose();
        },
        onError: (err) => {
          getApiErrorMessage(err);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="mt-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <TriangleAlert
              className="h-6 w-6 text-destructive"
              aria-hidden="true"
            />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <div className="text-center px-4">
            <DialogDescription asChild>
              <div className="text-sm text-muted-foreground">{description}</div>
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            {cancelText || t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending
              ? loadingText || t("deleting")
              : confirmText || t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
