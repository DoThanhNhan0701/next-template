import { IAuditSession } from "@/types/audit";
import { TaskStatus } from "@/types/task";

export const getAuditDerivedStatus = (
  audit: IAuditSession & { _isPendingApproval?: boolean },
  userId?: number
): TaskStatus => {
  const code = audit.status_obj.code;

  // PENDING_APPROVAL logic
  if (
    audit._isPendingApproval ||
    code === "WAITING_APPROVAL" ||
    (code === "PENDING" && !!audit.submitted_at) ||
    (code === "IN_PROGRESS" && audit.is_personal_completed && !audit.submitted_at)
  ) {
    return "PENDING_APPROVAL";
  }

  // PENDING logic
  if (
    (code === "PENDING" && !audit.submitted_at) ||
    (code === "IN_PROGRESS" && (!audit.is_personal_completed || !!audit.submitted_at)) ||
    (code === "COMPLETED" && !!userId && Number(audit.assignee_id) !== Number(userId))
  ) {
    return "PENDING";
  }

  // APPROVED logic
  if (
    code === "APPROVED" ||
    (code === "COMPLETED" && !!userId && Number(audit.assignee_id) === Number(userId))
  ) {
    return "APPROVED";
  }

  return code as TaskStatus;
};
