import { toast } from "sonner";

interface ValidationError {
  loc?: string[];
  msg: string;
  type?: string;
}

interface ApiErrorData {
  detail?: string | ValidationError[];
  message?: string;
}

export const getApiErrorMessage = (error: unknown): string => {
  const err = error as {
    response?: {
      data?: ApiErrorData | string;
    };
  };

  let message = "Error";
  
  if (err?.response?.data) {
    const data = err.response.data;
    
    if (typeof data === "string") {
      message = data;
    } else {
      if (Array.isArray(data.detail)) {
        message = data.detail.map((e) => `${e.loc?.slice(-1)?.[0] || 'Field'}: ${e.msg}`).join(", ");
      } else if (typeof data.detail === "string") {
        message = data.detail;
      } else if (typeof data.message === "string") {
        message = data.message;
      }
    }
  }

  toast.error(message);
  return message;
};
