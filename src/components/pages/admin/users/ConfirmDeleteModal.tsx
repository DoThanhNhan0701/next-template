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
import { useMutation } from "@/hooks/useMutation";
import { dynamicEndpoints } from "@/config/endpoints";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { IUser } from "@/types/auth";

interface Props {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConfirmDeleteModal({ user, isOpen, onClose, onSuccess }: Props) {
  const { mutate, pending } = useMutation();

  const handleConfirm = async () => {
    if (!user) return;

    await mutate(
      {
        url: dynamicEndpoints.USER_DETAIL(user.id),
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
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deactivate User</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to deactivate the account <strong>{user?.username}</strong>? This action will prevent the user from logging in.
        </DialogDescription>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={pending}>
            {pending ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
