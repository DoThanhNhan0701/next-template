export interface IOrgUnit {
  id: number;
  name: string;
  code: string;
  unit_type: string;
  parent_id: number | null;
  leader_id: number | null;
  address?: string | null;
  description?: string | null;
  is_active: boolean;
}
