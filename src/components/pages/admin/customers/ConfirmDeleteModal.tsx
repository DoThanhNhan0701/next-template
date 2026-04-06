"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "@/hooks/useMutation";
import { dynamicEndpoints } from "@/config/endpoints";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";
import { ICustomer } from "@/types/customer";

interface Props {
  customer: ICustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function ConfirmDeleteModal({
  customer,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { mutate, pending } = useMutation();

  const onDelete = async () => {
    if (!customer) return;

    await mutate(
      {
        url: dynamicEndpoints.CUSTOMER_DETAIL(customer.id),
        method: "delete",
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess(res, "delete");
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          Are you sure you want to delete customer{" "}
          <span className="font-semibold">{customer?.name}</span>? This action
          cannot be undone.
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={pending}
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
