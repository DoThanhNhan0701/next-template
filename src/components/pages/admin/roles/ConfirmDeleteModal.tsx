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
import { IRole } from "@/types/rbac";

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
  const t = useTranslations("page_roles");
  const { mutate, pending } = useMutation({
    url: role ? `${endpoints.RBAC_ROLES}/${role.id}` : "",
    method: "delete",
  });

  const handleDelete = async () => {
    if (!role) return;
    await mutate(
      {},
      {
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("deactivate_role")}</DialogTitle>
          <DialogDescription>
            {t.rich("deactivate_confirm_question", {
              name: role?.name || "",
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-3 shrink-0 border-t">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            {t("cancel")}
          </Button>
          <Button
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
