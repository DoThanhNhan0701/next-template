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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("page_locations.delete");
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
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t.rich("confirm_message", {
              name: location?.name || "this item",
              important: (chunks) => (
                <span className="font-semibold">{chunks}</span>
              ),
            })}
            {" "}
            {t("warning")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? t("deleting") : t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
