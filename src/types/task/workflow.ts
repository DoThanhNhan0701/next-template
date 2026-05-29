// ============================================
// WORKFLOW & TASK INTERFACES
// ============================================

export interface ITask {
    id: number;
    instance_id: number;
    step_id: number;
    user_id: number;
    status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "PENDING_APPROVAL";
    created_at: string;
    document_id: number;
    document_record_number: string;
    document_type: string;
    requester_name: string;
    assignee_name?: string;
    step_name: string;
    reason: string;
    action_date?: string;
    comment?: string;
    waiting_for_approval?: boolean;
}

export type TaskStatus = ITask["status"];

export interface ApprovalHistory {
    id: number;
    step_name: string;
    requester_name: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | 'PENDING_APPROVAL';
    comment: string | null;
    action_date: string;
}
