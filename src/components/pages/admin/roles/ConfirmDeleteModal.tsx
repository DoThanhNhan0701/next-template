import { useMutation } from "@/hooks/useMutation";
import { endpoints } from "@/config/endpoints";
import { IRole } from "@/types/rbac";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: IRole | null;
  onSuccess: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  role,
  onSuccess,
}: ConfirmDeleteModalProps) {
  const { mutate, pending } = useMutation({
    url: role ? `${endpoints.RBAC_ROLES}/${role.id}` : "",
    method: "delete",
  });

  const handleDelete = async () => {
    if (!role) return;
    await mutate({}, {
      onSuccess: () => {
        onSuccess();
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deactivate Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate or delete the role{" "}
            <strong>{role?.name}</strong>? This action may affect users assigned to this role.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={pending}
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
