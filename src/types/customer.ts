export interface ICustomer {
  id: number;
  name: string;
  customer_type: string;
  identifier: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  is_active: boolean;
}

export interface ICustomerCreate {
  name: string;
  customer_type: string;
  identifier: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  description?: string | null;
  is_active: boolean;
}

export type ICustomerUpdate = Partial<ICustomerCreate>;
