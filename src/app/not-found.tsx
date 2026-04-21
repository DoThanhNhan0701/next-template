import Link from "next/link";

import { Home } from "lucide-react";

import BackButton from "@/components/common/BackButton";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--surface-navigation) px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[240px] font-bold text-primary/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-(--surface-container) rounded-2xl p-8 border border-(--surface-border-color) shadow-lg">
              <svg
                className="w-24 h-24 text-muted-foreground mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Sorry, the page you are looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              <Home className="w-5 h-5" />
              Back to home
            </Link>
          </Button>
          <BackButton />
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-(--surface-border-color)">
          <p className="text-sm text-muted-foreground">
            If you think this is an error, please{" "}
            <a
              href="mailto:support@example.com"
              className="text-primary hover:underline font-medium"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
