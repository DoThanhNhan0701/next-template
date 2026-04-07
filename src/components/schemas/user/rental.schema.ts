import { z } from "zod";

export const RentalCreateItemSchema = z.object({
  asset_id: z.number().min(1, "Vui lòng chọn tài sản"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  from_location_id: z.number().default(0),
  rental_revenue: z.number().min(0, "Doanh thu không hợp lệ").default(0),
  lessee_location: z.string().optional().default(""),
});

export const RentalCreateSchema = z.object({
  record_number: z.string().min(1, "Số phiếu là bắt buộc"),
  unit_id: z.number().min(1, "Đơn vị cho thuê là bắt buộc"),
  customer_id: z.number().min(1, "Khách hàng là bắt buộc"),
  lease_date: z.string().min(1, "Ngày thuê là bắt buộc"),
  duration_days: z.number().min(1, "Số ngày thuê phải lớn hơn 0"),
  reason: z.string().optional().default(""),
  total_revenue: z.number().min(0).default(0),
  contract_number: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  external_link: z.string().optional().default(""),
  attachments: z.array(z.string()).default([]),
  items: z.array(RentalCreateItemSchema).min(1, "Phải có ít nhất 1 tài sản"),
});
