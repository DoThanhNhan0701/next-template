export interface ITask {
  id: number;
  instance_id: number;
  step_id: number;
  user_id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  document_id: number;
  document_record_number: string;
  document_type: string;
  requester_name: string;
  step_name: string;
  reason: string;
  action_date?: string;
  comment?: string;
}

export type TaskStatus = ITask["status"];

export interface DetailItem {
  id: number;
  asset?: {
    name: string;
    asset_code: string;
  };
  quantity: number;
  location?: {
    name: string;
    code: string;
  };
}

export interface ApprovalHistory {
  id: number;
  step_name: string;
  requester_name: string;
  status: string;
  comment: string;
  action_date: string;
}

export interface DocumentDetail {
  id: number;
  record_number: string;
  allocated_to_name: string;
  allocated_to_type: string;
  allocation_date: string;
  reason?: string;
  created_at: string;
  issuer_name?: string;
  unit?: {
    name: string;
  };
  creator?: {
    full_name: string;
  };
  status_obj?: {
    name: string;
    code: string;
  };
  details?: DetailItem[];
}
