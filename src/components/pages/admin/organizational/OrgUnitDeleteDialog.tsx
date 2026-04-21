"use client";

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
import { endpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  unitId: number | null;
  unitName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrgUnitDeleteDialog({
  unitId,
  unitName,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { mutate, pending } = useMutation();

  const handleDelete = async () => {
    if (!unitId) return;

    await mutate(
      {
        url: `${endpoints.ORG_UNITS}${unitId}/`,
        method: "delete",
      },
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
            <TriangleAlert
              className="h-6 w-6 text-destructive"
              aria-hidden="true"
            />
          </div>
          <DialogTitle className="text-center">Confirm Deletion</DialogTitle>
          <DialogDescription className="text-center px-4">
            Are you sure you want to delete{" "}
            <span className="font-bold text-foreground">
              &quot;{unitName}&quot;
            </span>
            ? This action cannot be undone and may affect associated data.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row gap-2 sm:justify-center mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting..." : "Delete Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
