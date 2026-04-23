"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
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
import { IUser } from "@/types/auth";
import { getApiErrorMessage } from "@/utils/api-error";
import { getApiSuccessMessage } from "@/utils/api-success";

interface Props {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConfirmDeleteModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { mutate, pending } = useMutation();
  const t = useTranslations("page_users");

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
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("deactivate_user")}</DialogTitle>
          <DialogDescription>
            {t.rich("deactivate_confirm_question", {
              username: user?.username || "",
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? t("processing") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
