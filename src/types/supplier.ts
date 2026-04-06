export interface ISupplier {
  id: number;
  name: string;
  tax_code: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string;
  is_active: boolean;
}

export interface ISupplierCreate {
  name: string;
  tax_code?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  description?: string;
  is_active: boolean;
}

export type ISupplierUpdate = Partial<ISupplierCreate>;
