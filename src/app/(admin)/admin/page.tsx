"use client";

import { useTranslations } from "next-intl";

export default function AdminPage() {
  const t = useTranslations("page_admin_dashboard");

  return (
    <div className="p-3">
      <h1 className="font-bold text-sm">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("welcome")}</p>
    </div>
  );
}
