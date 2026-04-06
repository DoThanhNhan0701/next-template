import { z } from "zod";

export const CatalogTypeSchema = z.object({
  name: z.string().min(1, "Catalog type name is required"),
  code: z.string().min(1, "Catalog type code is required"),
  description: z.string().nullable().optional(),
  catalog_group_id: z.number().int().optional(),
  is_active: z.boolean(),
  management_type: z.string().optional(),
  has_warranty: z.boolean().optional(),
});
