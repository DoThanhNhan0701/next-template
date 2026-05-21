import ActivityLogsPage from "@/components/pages/admin/activity-logs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity Logs | Admin",
  description: "View system activity logs",
};

export default function Page() {
  return <ActivityLogsPage />;
}
