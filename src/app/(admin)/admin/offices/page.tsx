import OfficePage from "@/components/pages/admin/offices";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offices | Admin",
  description: "Manage offices in the system",
};

export default function Page() {
  return <OfficePage />;
}
