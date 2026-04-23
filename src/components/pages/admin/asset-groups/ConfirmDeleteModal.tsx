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
import { useTranslations } from "next-intl";
import { IAssetGroup } from "@/types/asset-group";

interface Props {
  assetGroup: IAssetGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: unknown, method?: "post" | "patch" | "delete") => void;
}

export default function ConfirmDeleteModal({
  assetGroup,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const t = useTranslations("page_asset_groups.delete");
  const { mutate, pending } = useMutation();

  const onDelete = async () => {
    if (!assetGroup) return;

    await mutate(
      {
        url: dynamicEndpoints.ASSET_GROUP_DETAIL(assetGroup.id),
        method: "patch", // Follow existing pattern of deactivating instead of hard deleting
        body: { is_active: false },
      },
      {
        onSuccess: (res) => {
          getApiSuccessMessage(res);
          onSuccess(res, "patch");
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
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="py-4 text-foreground">
            {t.rich("confirm_message", {
              name: assetGroup?.name || "this item",
              important: (chunks) => (
                <span className="font-semibold">{chunks}</span>
              ),
            })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
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
            onClick={onDelete}
            disabled={pending}
          >
            {pending ? t("deleting") : t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
