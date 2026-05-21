export interface IActivityLog {
  id: number;
  user_id: number;
  username: string;
  action: string;
  target_model: string;
  target_id: number;
  target_name?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  user?: {
    username: string;
    email: string;
    full_name: string;
    role_id: number;
    id: number;
    role: string;
    is_active: boolean;
  };
}

