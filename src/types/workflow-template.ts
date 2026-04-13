export interface IWorkflowStep {
  id: number;
  step_order: number;
  name: string;
  default_assignee_role_id: number | null;
  default_assignee_user_id: number | null;
  is_active?: boolean;
}

export interface IWorkflowTemplate {
  id: number;
  name: string;
  document_type: string;
  description: string;
  is_active: boolean;
  is_locked: boolean;
  created_at?: string;
  steps: IWorkflowStep[];
}
