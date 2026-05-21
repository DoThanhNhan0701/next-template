import { IOffice } from "./office";

export interface IUnit {
  id: number;
  name: string;
  code: string;
  unit_type: "company" | "department" | "team";
  parent_id: number | null;
  leader_id: number | null;
  address: string | null;
  description: string | null;
  is_active: boolean;
}

export interface IStaff {
  id: number;
  staff_code: string;
  full_name: string;
  email: string;
  phone: string | null;
  unit_id: number;
  office_id: number;
  is_active: boolean;
  created_at: string;
  unit?: IUnit;
  office?: IOffice;
  login_username: string | null
}
