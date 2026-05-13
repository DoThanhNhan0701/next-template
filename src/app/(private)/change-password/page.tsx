import { Metadata } from "next";

import ChangePasswordComponent from "@/components/pages/user/change-password";

export const metadata: Metadata = {
  title: "Change Password | Asset Management System",
  description: "Change your account password",
};

export default function ChangePasswordPage() {
  return <ChangePasswordComponent />;
}
