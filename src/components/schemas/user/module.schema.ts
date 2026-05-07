import { z } from "zod";

export const ModuleSchema = z.object({
  name: z.string().min(1, "Field is required!"),
  module_code: z.string().nullish(),
  module_type: z.enum(
    ["peripheral", "component", "accessory", "license", "sim_card"],
    {
      message: "Field is required!",
    },
  ),
  serial_number: z.string().nullish(),
  model: z.string().nullish(),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Quantity must be at least 1"),
  ),
  cost: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Cost must be positive"),
  ),
  purchase_date: z.string().min(1, "Field is required!"),
  warranty_expiration: z.string().nullish(),
  status: z.enum(["active", "damaged", "lost", "returned"], {
    message: "Field is required!",
  }),
  notes: z.string().nullish(),
  asset_id: z.number().int(),
});

export type IModuleForm = z.infer<typeof ModuleSchema>;
