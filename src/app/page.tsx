import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard | Asset Management System",
  description: "Overview of asset management system",
};

export default function Page() {
  redirect("/dashboard");
}
