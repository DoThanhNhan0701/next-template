import { z } from "zod";

export const SupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  tax_code: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email("Invalid email format").nullable().optional().or(z.literal("")),
  address: z.string().nullable().optional(),
  description: z.string().optional(),
  is_active: z.boolean(),
});
