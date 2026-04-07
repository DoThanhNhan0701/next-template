import { toast } from "sonner";

export const getApiSuccessMessage = (response: unknown): string => {

  const err = response as {
    message?: string;
  };

  const messageMap: Record<string, string> = {
    "Cập nhật hồ sơ tài sản và đồng bộ tồn kho thành công":
      "Asset profile updated and inventory synced successfully.",
  };

  const originalMessage = err?.message ?? "Success";
  const finalMessage = messageMap[originalMessage] || originalMessage;

  toast.success(finalMessage);
  return finalMessage;
};
