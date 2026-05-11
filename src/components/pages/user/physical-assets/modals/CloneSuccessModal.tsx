"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { CheckCircle2, ChevronRight, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ICloneResponse } from "@/types/physical-asset";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ICloneResponse | null;
}

export default function CloneSuccessModal({ isOpen, onClose, data }: Props) {
  const t = useTranslations("page_physical_assets");
  const tUsers = useTranslations("page_users");
  const router = useRouter();

  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 shrink-0 border-b">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-500/10 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {t("modals.clone_success_title")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {t("modals.cloned_count", { count: data.cloned_count })} -{" "}
                {data.voucher_number}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary border-b pb-1">
            <Package className="w-4 h-4" />
            {t("modals.cloned_assets")}
          </h4>

          <div className="flex flex-col gap-2">
            {data.assets.map(
              (
                asset: import("@/types/physical-asset").IPhysicalAssetDetail,
              ) => (
                <div
                  key={asset.id}
                  className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {asset.asset_code}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                      {asset.name}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium hover:bg-primary hover:text-white transition-all shadow-none"
                    onClick={() => {
                      router.push(`/assets/${asset.id}`);
                      onClose();
                    }}
                  >
                    {t("modals.view_detail")}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ),
            )}
          </div>
        </div>

        <DialogFooter className="p-3 shrink-0 border-t">
          <Button onClick={onClose} className="w-full sm:w-auto">
            {tUsers("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
