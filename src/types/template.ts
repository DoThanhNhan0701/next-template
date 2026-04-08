export interface ITemplateStep {
  id: number;
  name: string;
  step_order: number;
  default_assignee_role_id: number | null;
  default_assignee_user_id: number | null;
}

export interface ITemplate {
  id: number;
  name: string;
  document_type: string;
  description: string;
  is_active: boolean;
  steps: ITemplateStep[];
  created_at: string;
}
