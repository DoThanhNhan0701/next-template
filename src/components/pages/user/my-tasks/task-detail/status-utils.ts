export const getStatusInfo = (statusName: string | undefined) => {
  const name = (statusName || "").toLowerCase();
  if (
    name.includes("approve") ||
    name.includes("đã duyệt") ||
    name.includes("approved")
  )
    return {
      label: "Approved",
      color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
    };
  if (
    name.includes("pending") ||
    name.includes("chờ duyệt") ||
    name.includes("processing")
  )
    return {
      label: "Process",
      color: "bg-amber-500/15 text-amber-600 border-amber-500/20",
    };
  if (
    name.includes("reject") ||
    name.includes("từ chối") ||
    name.includes("rejected")
  )
    return {
      label: "Rejected",
      color: "bg-red-500/15 text-red-600 border-red-500/20",
    };
  return {
    label: statusName || "Process",
    color: "bg-primary/10 text-primary border-primary/20",
  };
};
