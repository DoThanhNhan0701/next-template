import LocationPage from "@/components/pages/admin/locations";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Locations | Admin",
  description: "Manage locations in the system",
};

export default function Page() {
  return <LocationPage />;
}
