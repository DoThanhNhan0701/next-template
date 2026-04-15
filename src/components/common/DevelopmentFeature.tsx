"use client";

import { useTranslations } from "next-intl";
import { Hammer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DevelopmentFeature() {
  const t = useTranslations("Common");

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="max-w-md w-full border-none shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center text-center space-y-6 pt-6">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-20 bg-primary animate-pulse" />
            <div className="relative bg-surface-container border border-surface-border-color rounded-2xl p-6 shadow-xl">
              <Hammer size={48} className="text-primary animate-bounce" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("feature_under_development")}
            </h1>
            <p className="text-muted-foreground">
              {t("feature_under_development_description")}
            </p>
          </div>

          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
