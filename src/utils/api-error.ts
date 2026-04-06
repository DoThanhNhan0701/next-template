import { toast } from "sonner";

export const getApiErrorMessage = (error: unknown): string => {
  const err = error as {
    response?: {
      data?: {
        detail?: string;
      };
    };
  };


  const message = err?.response?.data?.detail ?? "Error";
  toast.error(message);
  return message;
};
