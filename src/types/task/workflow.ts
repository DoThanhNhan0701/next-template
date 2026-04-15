// ============================================
// WORKFLOW & TASK INTERFACES
// ============================================

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

export interface ApprovalHistory {
    id: number;
    step_name: string;
    requester_name: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    comment: string | null;
    action_date: string;
}
