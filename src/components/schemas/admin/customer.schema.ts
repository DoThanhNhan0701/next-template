import { z } from "zod";

export const CustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  customer_type: z.enum(["Individual", "Organization"]),
  identifier: z.string().min(1, "Identifier is required"),
  phone: z.string().nullable().optional(),
  email: z.string().email("Invalid email format").nullable().optional().or(z.literal("")),
  address: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
});
