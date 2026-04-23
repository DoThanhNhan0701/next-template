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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("page_organization");
  const { mutate, pending } = useMutation();

  const handleDelete = async () => {
    if (!unitId) return;

    await mutate(
      {
        url: `${endpoints.ORG_UNITS}/${unitId}/`,
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
          <DialogTitle className="text-center">{t("delete_unit")}</DialogTitle>
          <DialogDescription className="text-center px-4">
            {t.rich("delete_confirm", {
              name: () => (
                <span className="font-bold text-foreground underline decoration-destructive/30 decoration-2 underline-offset-4">
                  {unitName}
                </span>
              ),
            })}
            {" "}
            {t("delete_warning")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
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
