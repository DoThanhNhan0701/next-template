import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dynamicEndpoints } from "@/config/endpoints";
import { useMutation } from "@/hooks/useMutation";
import { ILocation } from "@/types/location";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: ILocation | null;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  location,
  onSuccess,
}: ConfirmDeleteModalProps) {
  const { mutate, pending } = useMutation();

  const handleConfirm = async () => {
    if (!location) return;

    await mutate(
      {
        url: dynamicEndpoints.LOCATION_DETAIL(location.id),
        method: "delete",
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess(location, "delete"); // manual update with deleted item
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the location{" "}
            <strong>{location?.name || "this item"}</strong>? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
