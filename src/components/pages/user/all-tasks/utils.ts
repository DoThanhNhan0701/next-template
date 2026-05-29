import { IAuditSession } from "@/types/audit";
import { TaskStatus } from "@/types/task";
import { IUser } from "@/types/auth";

export const getAllAuditDerivedStatus = (
  audit: IAuditSession & { _isPendingApproval?: boolean },
  user?: IUser | null
): TaskStatus => {
  const code = audit.status_obj.code;
  const userId = user?.id;

  // PENDING_APPROVAL logic
  // is_personal_completed is prerequisite; then verify ratio if available
  const allCompleted =
    audit.is_personal_completed &&
    (
      audit.personal_total_assigned == null ||
      audit.personal_total_assigned <= 0 ||
      audit.personal_completed_assigned === audit.personal_total_assigned
    );

  const isAssignee = userId != null && Number(audit.assignee_id) === Number(userId);

  if (
    audit._isPendingApproval ||
    code === "WAITING_APPROVAL" ||
    (code === "PENDING" && !!audit.submitted_at) ||
    (code === "IN_PROGRESS" && allCompleted && (!isAssignee || !!audit.submitted_at))
  ) {
    return "PENDING_APPROVAL";
  }

  // PENDING logic
  if (
    (code === "PENDING" && !audit.submitted_at) ||
    (code === "IN_PROGRESS" && (!allCompleted || (isAssignee && !audit.submitted_at))) ||
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
