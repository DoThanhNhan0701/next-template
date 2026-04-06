import { toast } from "sonner";

export const getApiSuccessMessage = (response: unknown): string => {

  const err = response as {
    message?: string;
  };

  const message = err?.message ?? "Success";
  toast.success(message);
  return message;
};
